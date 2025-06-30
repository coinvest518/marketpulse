// Shared types for the client application

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Keyword {
  id: number;
  userId: string;
  keyword: string;
  isActive: boolean;
  createdAt: string;
}

export interface Mention {
  id: number;
  keywordId: number;
  userId: string;
  title: string;
  content: string;
  url?: string;
  source: string;
  sentiment: string;
  sentimentScore?: number;
  createdAt: string;
}

export interface Report {
  id: number;
  userId: string;
  keywordId?: number;
  reportType: string;
  totalMentions: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  insights?: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: number;
  userId: string;
  keywordId?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  emailNotification: boolean;
  createdAt: string;
}
