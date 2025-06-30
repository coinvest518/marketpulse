import { storage } from "../storage";
import { analyzeSentiment, generateInsights } from "./openai";
import { tavilyService } from "./tavilyService";
import { mem0Service } from "./mem0Service";
import { copilotKitService } from "./claudeService";
import type { InsertMention, InsertReport } from "@shared/schema";

export class AgentService {
  // Crawler Agent - Real implementation using Tavily API
  async crawlMentions(userId: string, keyword: string): Promise<InsertMention[]> {
    const keywordRecord = await storage.getUserKeywords(userId);
    const targetKeyword = keywordRecord.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
    
    if (!targetKeyword) {
      throw new Error("Keyword not found");
    }

    try {
      // Use Tavily to search for real mentions
      const searchResults = await tavilyService.searchMentions(keyword, 10);
      const mentions: InsertMention[] = [];

      for (const result of searchResults) {
        // Extract source from URL
        let source = "Web";
        if (result.url.includes('twitter.com')) source = "Twitter";
        else if (result.url.includes('reddit.com')) source = "Reddit";
        else if (result.url.includes('linkedin.com')) source = "LinkedIn";
        else if (result.url.includes('facebook.com')) source = "Facebook";
        else if (result.url.includes('news.')) source = "News";
        else if (result.url.includes('medium.com')) source = "Medium";
        else if (result.url.includes('trustpilot.com')) source = "Trustpilot";
        else if (result.url.includes('glassdoor.com')) source = "Glassdoor";

        // Analyze sentiment using OpenAI
        const sentimentResult = await analyzeSentiment(result.content);
        
        mentions.push({
          keywordId: targetKeyword.id,
          userId,
          title: result.title || keyword, // Use result.title if available, fallback to keyword
          source,
          content: result.content.slice(0, 500), // Limit content length
          url: result.url,
          sentiment: sentimentResult.sentiment,
          sentimentScore: sentimentResult.confidence,
        });
      }

      // Store user preferences in memory
      await mem0Service.addMemory(
        userId, 
        `User is monitoring keyword: ${keyword}. Recent search found ${mentions.length} mentions.`,
        { keyword, mentionCount: mentions.length, timestamp: new Date().toISOString() }
      );

      return mentions;
    } catch (error) {
      console.error('Error crawling mentions:', error);
      // Fallback to empty array if API fails
      return [];
    }
  }
  
  // Analyzer Agent - Uses OpenAI for sentiment analysis
  async analyzeMentions(mentions: InsertMention[]): Promise<InsertMention[]> {
    const analyzedMentions: InsertMention[] = [];
    
    for (const mention of mentions) {
      const analysis = await analyzeSentiment(mention.content);
      analyzedMentions.push({
        ...mention,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.confidence,
      });
    }
    
    return analyzedMentions;
  }
  
  // Reporter Agent - Generates reports and insights
  async generateReport(userId: string, keywordId?: number): Promise<InsertReport> {
    const stats = await storage.getSentimentStats(userId, keywordId);
    const recentMentions = keywordId 
      ? await storage.getMentionsByKeyword(keywordId, 50)
      : await storage.getUserMentions(userId, 50);
    
    // Get keyword info for Claude analysis
    let keyword = "Brand";
    if (keywordId) {
      const keywords = await storage.getUserKeywords(userId);
      const keywordRecord = keywords.find(k => k.id === keywordId);
      if (keywordRecord) keyword = keywordRecord.keyword;
    }

    // Generate AI insights using both OpenAI and CopilotKit
    const [openaiInsights, copilotAnalysis] = await Promise.allSettled([
      generateInsights(recentMentions.map(m => ({
        content: m.content,
        sentiment: m.sentiment,
        source: m.source,
      }))),
      copilotKitService.analyzeMarketData({
        mentions: recentMentions.map(m => ({
          content: m.content,
          sentiment: m.sentiment,
          source: m.source,
        })),
        keyword,
        timeframe: "recent"
      })
    ]);
    
    const total = stats.total || 1; // Avoid division by zero
    
    // Combine insights from both AI services
    let combinedInsights: {
      insights: string[];
      recommendations: string[];
      trends: string[];
    } = {
      insights: [],
      recommendations: [],
      trends: [],
    };

    if (openaiInsights.status === 'fulfilled') {
      combinedInsights.insights.push(...openaiInsights.value.insights);
      combinedInsights.recommendations.push(...openaiInsights.value.recommendations);
      combinedInsights.trends.push(...openaiInsights.value.trends);
    }

    if (copilotAnalysis.status === 'fulfilled') {
      combinedInsights.insights.push(...copilotAnalysis.value.insights);
      combinedInsights.recommendations.push(...copilotAnalysis.value.recommendations);
      combinedInsights.insights.push(`CopilotKit Reasoning: ${copilotAnalysis.value.reasoning}`);
    }
    
    return {
      userId,
      keywordId: keywordId || null,
      reportType: "daily",
      positiveSentiment: (stats.positive / total) * 100,
      negativeSentiment: (stats.negative / total) * 100,
      neutralSentiment: (stats.neutral / total) * 100,
      totalMentions: stats.total,
      insights: JSON.stringify(combinedInsights),
    };
  }
  
  // Interface Agent - Handles user interactions and memory with Claude Copilot
  async processUserQuery(userId: string, message: string): Promise<string> {
    // Get user context from database
    const userKeywords = await storage.getUserKeywords(userId);
    const recentMentions = await storage.getUserMentions(userId, 10);
    const sentimentStats = await storage.getSentimentStats(userId);
    const chatHistory = await storage.getUserChatHistory(userId, 5);
    
    // Get user memories from Mem0
    const userMemories = await mem0Service.getUserMemories(userId);
    const relevantMemories = await mem0Service.searchMemories(userId, message);
    
    const context = {
      keywords: userKeywords.map(k => k.keyword),
      recentMentions: recentMentions.slice(0, 5).map(m => ({
        content: m.content,
        sentiment: m.sentiment,
        source: m.source,
      })),
      sentimentStats,
      userMemories: relevantMemories.slice(0, 3).map(m => m.memory),
      preferences: userMemories.slice(0, 5).map(m => m.memory)
    };

    // Try CopilotKit first, fallback to OpenAI
    let response: string;
    try {
      const copilotResponse = await copilotKitService.copilotAssist(message, {
        userHistory: chatHistory,
        currentData: { keywords: context.keywords, sentimentStats: context.sentimentStats },
        preferences: context.preferences
      });
      
      response = copilotResponse.response;
      
      // Add suggestions as part of response if available
      if (copilotResponse.suggestions.length > 0) {
        response += "\n\nSuggestions:\n" + copilotResponse.suggestions.map(s => `• ${s}`).join('\n');
      }
    } catch (copilotError) {
      console.warn('CopilotKit failed, falling back to OpenAI:', copilotError);
      // Fallback to OpenAI
      const { chatWithAI } = await import("./openai");
      response = await chatWithAI(message, context);
    }
    
    // Store this interaction in Mem0 for future context
    await mem0Service.addMemory(
      userId,
      `User asked: "${message}". Context: ${JSON.stringify({ keywords: context.keywords, sentimentStats: context.sentimentStats })}`,
      { type: 'user_query', timestamp: new Date().toISOString() }
    );
    
    // Save the conversation for database history
    await storage.saveChatMessage({
      userId,
      message,
      response,
      context: JSON.stringify(context),
    });
    
    return response;
  }
  
  // Orchestrator - Coordinates all agents
  async processKeywordMonitoring(userId: string, keyword: string): Promise<void> {
    try {
      // 1. Crawler Agent: Get mentions
      const mentions = await this.crawlMentions(userId, keyword);
      
      // 2. Store mentions in database
      for (const mention of mentions) {
        await storage.createMention(mention);
      }
      
      // 3. Reporter Agent: Generate updated report
      const keywordRecord = await storage.getUserKeywords(userId);
      const targetKeyword = keywordRecord.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
      
      if (targetKeyword) {
        const report = await this.generateReport(userId, targetKeyword.id);
        await storage.createReport(report);
      }
    } catch (error) {
      console.error("Keyword monitoring failed:", error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
