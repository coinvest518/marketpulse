import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  keyword: text("keyword").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const mentions = pgTable("mentions", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => keywords.id),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  source: text("source").notNull(),
  sentiment: text("sentiment").notNull(), // 'positive', 'negative', 'neutral'
  sentimentScore: real("sentiment_score"),
  createdAt: timestamp("created_at").defaultNow()
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  keywordId: integer("keyword_id").references(() => keywords.id),
  reportType: text("report_type").notNull().default("daily"),
  totalMentions: integer("total_mentions").default(0),
  positiveSentiment: real("positive_sentiment").default(0),
  negativeSentiment: real("negative_sentiment").default(0),
  neutralSentiment: real("neutral_sentiment").default(0),
  insights: text("insights"), // JSON string for AI-generated insights
  createdAt: timestamp("created_at").defaultNow()
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  context: text("context"), // JSON string for additional context
  createdAt: timestamp("created_at").defaultNow()
});

export const scheduledReports = pgTable("scheduled_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  keywordId: integer("keyword_id").references(() => keywords.id),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run").notNull(),
  emailNotification: boolean("email_notification").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  keywords: many(keywords),
  mentions: many(mentions),
  reports: many(reports),
  chatMessages: many(chatMessages),
  scheduledReports: many(scheduledReports)
}));

export const keywordsRelations = relations(keywords, ({ one, many }) => ({
  user: one(users, {
    fields: [keywords.userId],
    references: [users.id]
  }),
  mentions: many(mentions),
  reports: many(reports)
}));

export const mentionsRelations = relations(mentions, ({ one }) => ({
  keyword: one(keywords, {
    fields: [mentions.keywordId],
    references: [keywords.id]
  }),
  user: one(users, {
    fields: [mentions.userId],
    references: [users.id]
  })
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id]
  }),
  keyword: one(keywords, {
    fields: [reports.keywordId],
    references: [keywords.id]
  })
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id]
  })
}));

export const scheduledReportsRelations = relations(scheduledReports, ({ one }) => ({
  user: one(users, {
    fields: [scheduledReports.userId],
    references: [users.id]
  }),
  keyword: one(keywords, {
    fields: [scheduledReports.keywordId],
    references: [keywords.id]
  })
}));

// Validation schemas
export const insertKeywordSchema = createInsertSchema(keywords);
export const insertMentionSchema = createInsertSchema(mentions);
export const insertReportSchema = createInsertSchema(reports);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertScheduledReportSchema = createInsertSchema(scheduledReports);
