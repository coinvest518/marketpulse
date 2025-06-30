import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { agentService } from "./services/agentService";
import { insertKeywordSchema } from "../shared/schema";
import { z } from "zod";
import { tavilyService } from "./services/tavilyService";
import { mem0Service } from "./services/mem0Service";

// Helper function to extract userId from Firebase token
async function getUserIdFromToken(req: any): Promise<string> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const idToken = authHeader.split('Bearer ')[1];
  const { auth } = await import('./firebaseAdmin');
  const decodedToken = await auth.verifyIdToken(idToken);
  
  return decodedToken.uid;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes - Firebase authentication validation
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization header' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      
      // Verify the Firebase ID token
      const { auth } = await import('./firebaseAdmin');
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Create or update user in our database
      const user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        firstName: decodedToken.name?.split(' ')[0] || 'User',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: decodedToken.picture || 'https://via.placeholder.com/150',
      };

      await storage.upsertUser(user);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Keyword management routes
  app.post('/api/keywords', async (req: any, res) => {
    try {
      const userId = await getUserIdFromToken(req);
      const keywordData = insertKeywordSchema.parse({
        ...req.body,
        userId,
      });
      
      const keyword = await storage.createKeyword(keywordData);
      
      // Start monitoring this keyword in the background
      agentService.processKeywordMonitoring(userId, keyword.keyword).catch(console.error);
      
      res.json(keyword);
    } catch (error) {
      console.error("Error creating keyword:", error);
      res.status(400).json({ message: "Invalid keyword data or authentication failed" });
    }
  });

  app.get('/api/keywords', async (req: any, res) => {
    try {
      const userId = await getUserIdFromToken(req);
      const keywords = await storage.getUserKeywords(userId);
      res.json(keywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Mention routes
  app.get('/api/mentions', async (req: any, res) => {
    try {
      let userId;
      try {
        userId = await getUserIdFromToken(req);
      } catch {
        // For demo purposes, return sample data if not authenticated
        return res.json([
          {
            id: 1,
            content: "This is amazing technology that's revolutionizing the industry!",
            sentiment: "positive",
            source: "Twitter",
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            content: "Interesting developments in AI and machine learning.",
            sentiment: "neutral", 
            source: "LinkedIn",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const mentions = await storage.getUserMentions(userId, limit);
      res.json(mentions);
    } catch (error) {
      console.error("Error fetching mentions:", error);
      res.status(500).json({ message: "Failed to fetch mentions" });
    }
  });

  app.get('/api/mentions/keyword/:keywordId', async (req: any, res) => {
    try {
      const keywordId = parseInt(req.params.keywordId);
      const limit = parseInt(req.query.limit as string) || 10;
      const mentions = await storage.getMentionsByKeyword(keywordId, limit);
      res.json(mentions);
    } catch (error) {
      console.error("Error fetching keyword mentions:", error);
      res.status(500).json({ message: "Failed to fetch keyword mentions" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/sentiment', async (req: any, res) => {
    try {
      let userId;
      try {
        userId = await getUserIdFromToken(req);
      } catch {
        // For demo purposes, return sample data if not authenticated
        return res.json({
          total: 150,
          positive: 85,
          negative: 35,
          neutral: 30
        });
      }
      
      const keywordId = req.query.keywordId ? parseInt(req.query.keywordId as string) : undefined;
      const stats = await storage.getSentimentStats(userId, keywordId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sentiment stats:", error);
      res.status(500).json({ message: "Failed to fetch sentiment stats" });
    }
  });

  app.get('/api/analytics/trending', async (req: any, res) => {
    try {
      let userId;
      try {
        userId = await getUserIdFromToken(req);
      } catch {
        // For demo purposes, return sample data if not authenticated
        return res.json([
          { keyword: "AI", sentimentScore: 0.8, mentionCount: 45 },
          { keyword: "Machine Learning", sentimentScore: 0.7, mentionCount: 32 },
          { keyword: "Technology", sentimentScore: 0.6, mentionCount: 28 }
        ]);
      }
      
      const trending = await storage.getTrendingKeywords(userId);
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending keywords:", error);
      res.status(500).json({ message: "Failed to fetch trending keywords" });
    }
  });

  // Report routes
  app.get('/api/reports', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/reports/latest', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const keywordId = req.query.keywordId ? parseInt(req.query.keywordId as string) : undefined;
      const report = await storage.getLatestReport(userId, keywordId);
      res.json(report);
    } catch (error) {
      console.error("Error fetching latest report:", error);
      res.status(500).json({ message: "Failed to fetch latest report" });
    }
  });

  app.post('/api/reports/generate', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const keywordId = req.body.keywordId ? parseInt(req.body.keywordId) : undefined;
      
      const reportData = await agentService.generateReport(userId, keywordId);
      const report = await storage.createReport(reportData);
      
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Chat routes
  app.post('/api/chat', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await agentService.processUserQuery(userId, message);
      res.json({ response });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/history', async (req: any, res) => {
    try {
      let userId;
      try {
        userId = await getUserIdFromToken(req);
      } catch {
        // For demo purposes, return empty array if not authenticated
        return res.json([]);
      }
      
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getUserChatHistory(userId, limit);
      res.json(history.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Manual keyword monitoring trigger
  app.post('/api/monitor/:keyword', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const keyword = req.params.keyword;
      
      // Trigger monitoring process
      await agentService.processKeywordMonitoring(userId, keyword);
      
      res.json({ message: "Monitoring started successfully" });
    } catch (error) {
      console.error("Error starting monitoring:", error);
      res.status(500).json({ message: "Failed to start monitoring" });
    }
  });

  // Test API integrations endpoint
  app.post('/api/test-integration', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // In production, get from Firebase token
      const { keyword = "OpenAI" } = req.body;

      console.log(`Testing API integration for keyword: ${keyword}`);

      // Test Tavily API
      const tavilyResults = await tavilyService.searchMentions(keyword, 3);
      console.log(`Tavily found ${tavilyResults.length} results`);

      // Test Mem0 API
      const memoryAdded = await mem0Service.addMemory(userId, `Testing integration with keyword: ${keyword}`);
      console.log(`Mem0 memory added: ${memoryAdded}`);

      // Test OpenAI sentiment analysis
      let sentimentTest = null;
      if (tavilyResults.length > 0) {
        const { analyzeSentiment } = await import("./services/openai");
        sentimentTest = await analyzeSentiment(tavilyResults[0].content);
        console.log(`OpenAI sentiment analysis completed`);
      }

      // Test CopilotKit
      let copilotTest = null;
      try {
        const { copilotKitService } = await import("./services/claudeService");
        const copilotResponse = await copilotKitService.copilotAssist(
          `What can you tell me about ${keyword}?`,
          { currentData: { keyword, mentionCount: tavilyResults.length } }
        );
        copilotTest = { status: 'success', response: copilotResponse.response.substring(0, 100) + '...' };
        console.log(`CopilotKit test completed`);
      } catch (copilotError) {
        console.warn('CopilotKit test failed:', copilotError);
        copilotTest = { status: 'failed', error: (copilotError as Error).message || 'Unknown error' };
      }

      res.json({
        tavily: {
          status: tavilyResults.length > 0 ? 'success' : 'no_results',
          resultCount: tavilyResults.length,
          sample: tavilyResults[0] || null
        },
        mem0: {
          status: memoryAdded ? 'success' : 'failed',
          memoryAdded
        },
        openai: {
          status: sentimentTest ? 'success' : 'no_test_data',
          sentiment: sentimentTest
        },
        copilotkit: copilotTest
      });    } catch (error) {
      console.error("Integration test failed:", error);
      res.status(500).json({ 
        message: "Integration test failed", 
        error: (error as Error).message || 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
