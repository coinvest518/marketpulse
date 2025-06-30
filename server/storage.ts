import {
  users,
  keywords,
  mentions,
  reports,
  chatMessages,
  type User,
  type UpsertUser,
  type Keyword,
  type InsertKeyword,
  type Mention,
  type InsertMention,
  type Report,
  type InsertReport,
  type ChatMessage,
  type InsertChatMessage,
} from "../shared/schema";
import { db } from "./db_neon";
import { eq, desc, and, gte, count, avg, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Keyword operations
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  getUserKeywords(userId: string): Promise<Keyword[]>;
  getKeywordById(id: number): Promise<Keyword | undefined>;
  updateKeywordStatus(id: number, isActive: boolean): Promise<void>;
  
  // Mention operations
  createMention(mention: InsertMention): Promise<Mention>;
  getUserMentions(userId: string, limit?: number): Promise<Mention[]>;
  getMentionsByKeyword(keywordId: number, limit?: number): Promise<Mention[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getUserReports(userId: string): Promise<Report[]>;
  getLatestReport(userId: string, keywordId?: number): Promise<Report | undefined>;
  
  // Chat operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Analytics
  getSentimentStats(userId: string, keywordId?: number): Promise<{
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  }>;
  
  getTrendingKeywords(userId: string): Promise<{
    keyword: string;
    mentionCount: number;
    sentimentScore: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Keyword operations
  async createKeyword(keyword: InsertKeyword): Promise<Keyword> {
    const [newKeyword] = await db
      .insert(keywords)
      .values(keyword)
      .returning();
    return newKeyword;
  }

  async getUserKeywords(userId: string): Promise<Keyword[]> {
    return await db
      .select()
      .from(keywords)
      .where(eq(keywords.userId, userId))
      .orderBy(desc(keywords.createdAt));
  }

  async getKeywordById(id: number): Promise<Keyword | undefined> {
    const [keyword] = await db
      .select()
      .from(keywords)
      .where(eq(keywords.id, id))
      .limit(1);
    return keyword;
  }

  async updateKeywordStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(keywords)
      .set({ isActive })
      .where(eq(keywords.id, id));
  }

  // Mention operations
  async createMention(mention: InsertMention): Promise<Mention> {
    const [newMention] = await db
      .insert(mentions)
      .values(mention)
      .returning();
    return newMention;
  }

  async getUserMentions(userId: string, limit = 10): Promise<Mention[]> {
    return await db
      .select()
      .from(mentions)
      .where(eq(mentions.userId, userId))
      .orderBy(desc(mentions.createdAt))
      .limit(limit);
  }

  async getMentionsByKeyword(keywordId: number, limit = 10): Promise<Mention[]> {
    return await db
      .select()
      .from(mentions)
      .where(eq(mentions.keywordId, keywordId))
      .orderBy(desc(mentions.createdAt))
      .limit(limit);
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getLatestReport(userId: string, keywordId?: number): Promise<Report | undefined> {
    const query = db
      .select()
      .from(reports)
      .where(
        keywordId 
          ? and(eq(reports.userId, userId), eq(reports.keywordId, keywordId))
          : eq(reports.userId, userId)
      )
      .orderBy(desc(reports.createdAt))
      .limit(1);
    
    const [report] = await query;
    return report;
  }

  // Chat operations
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUserChatHistory(userId: string, limit = 20): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Analytics
  async getSentimentStats(userId: string, keywordId?: number): Promise<{
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  }> {
    const baseQuery = db
      .select({
        sentiment: mentions.sentiment,
        count: count(),
      })
      .from(mentions)
      .where(
        keywordId 
          ? and(eq(mentions.userId, userId), eq(mentions.keywordId, keywordId))
          : eq(mentions.userId, userId)
      )
      .groupBy(mentions.sentiment);

    const results = await baseQuery;
    
    const stats = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: 0,
    };

    interface SentimentStatsResult {
      sentiment: "positive" | "negative" | "neutral";
      count: number;
    }

    results.forEach((result: SentimentStatsResult) => {
      stats[result.sentiment as keyof typeof stats] = result.count;
      stats.total += result.count;
    });

    return stats;
  }

  async getTrendingKeywords(userId: string): Promise<{
    keyword: string;
    mentionCount: number;
    sentimentScore: number;
  }[]> {
    const results = await db
      .select({
        keyword: keywords.keyword,
        mentionCount: count(mentions.id),
        avgSentimentScore: avg(mentions.sentimentScore),
      })
      .from(keywords)
      .leftJoin(mentions, eq(keywords.id, mentions.keywordId))
      .where(eq(keywords.userId, userId))
      .groupBy(keywords.id, keywords.keyword)
      .orderBy(desc(count(mentions.id)))
      .limit(10);

    interface TrendingKeywordResult {
      keyword: string;
      mentionCount: number;
      avgSentimentScore: number | null;
    }

    interface TrendingKeyword {
      keyword: string;
      mentionCount: number;
      sentimentScore: number;
    }

    return results.map((result: TrendingKeywordResult): TrendingKeyword => ({
      keyword: result.keyword,
      mentionCount: result.mentionCount,
      sentimentScore: Number(result.avgSentimentScore) || 0,
    }));
  }
}

export const storage = new DatabaseStorage();
