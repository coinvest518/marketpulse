# 🗄️ Neon Postgres Migration Guide

Based on the latest documentation (as of June 2025), Vercel has completed transitioning from Vercel Postgres to **Neon Postgres**. This guide will help you migrate your SQLite database to Neon Postgres for production deployment.

## 📋 Overview

**Important Update**: Vercel Postgres has transitioned to **Neon Postgres** via the Vercel Native Integration. This is now the recommended approach for production databases on Vercel.

## 🎯 Migration Options

### Option 1: Vercel Native Integration (Recommended)
- **Best for**: New projects or those deploying to Vercel
- **Benefits**: Automatic branch creation for preview deployments, managed through Vercel
- **Billing**: Managed through Vercel account

### Option 2: Direct Neon Account
- **Best for**: Existing Neon users or multi-platform deployment
- **Benefits**: Full Neon feature access, direct billing with Neon

## 🚀 Quick Setup Guide

### Step 1: Install Dependencies

```bash
# Remove SQLite dependencies
npm uninstall better-sqlite3

# Install Neon dependencies
npm install @neondatabase/serverless drizzle-orm dotenv
npm install -D drizzle-kit
```

### Step 2: Set Up Neon Database

#### Option A: Through Vercel Dashboard (Recommended)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database** → **Neon Postgres**
4. Follow the setup wizard

#### Option B: Direct Neon Account
1. Sign up at [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string

### Step 3: Configure Environment Variables

Add to your `.env` file:
```bash
# Neon Database URL (you'll get this from Vercel or Neon Console)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Optional: Pooled connection for better performance
DATABASE_URL_UNPOOLED="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Update Database Configuration

Create `server/db-neon.ts`:
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// For production and development
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Step 5: Update Drizzle Config

Update `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

export default defineConfig({
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql', // Changed from sqlite
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### Step 6: Update Schema for PostgreSQL

Update `shared/schema.ts`:
```typescript
import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
  serial
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  keyword: text('keyword').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const mentions = pgTable('mentions', {
  id: serial('id').primaryKey(),
  keywordId: integer('keyword_id').notNull().references(() => keywords.id),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  url: text('url'),
  source: text('source').notNull(),
  sentiment: text('sentiment').notNull(),
  sentimentScore: real('sentiment_score'),
  createdAt: timestamp('created_at').defaultNow()
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  keywordId: integer('keyword_id').references(() => keywords.id),
  reportType: text('report_type').notNull().default('daily'),
  totalMentions: integer('total_mentions').default(0),
  positiveSentiment: real('positive_sentiment').default(0),
  negativeSentiment: real('negative_sentiment').default(0),
  neutralSentiment: real('neutral_sentiment').default(0),
  insights: text('insights'),
  createdAt: timestamp('created_at').defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  response: text('response').notNull(),
  context: text('context'),
  createdAt: timestamp('created_at').defaultNow()
});

export const scheduledReports = pgTable('scheduled_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  keywordId: integer('keyword_id').references(() => keywords.id),
  frequency: text('frequency').notNull(),
  isActive: boolean('is_active').default(true),
  lastRun: timestamp('last_run'),
  nextRun: timestamp('next_run').notNull(),
  emailNotification: boolean('email_notification').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations remain the same...
export const usersRelations = relations(users, ({ many }) => ({
  keywords: many(keywords),
  mentions: many(mentions),
  reports: many(reports),
  chatMessages: many(chatMessages),
  scheduledReports: many(scheduledReports)
}));

// ... other relations

// Validation schemas
export const insertKeywordSchema = createInsertSchema(keywords);
export const insertMentionSchema = createInsertSchema(mentions);
export const insertReportSchema = createInsertSchema(reports);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertScheduledReportSchema = createInsertSchema(scheduledReports);
```

### Step 7: Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "set NODE_ENV=development&& tsx server/index.ts",
    "build": "npm run build:client",
    "build:client": "vite build",
    "start": "set NODE_ENV=production&& node dist/index.js",
    "check": "tsc",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Step 8: Generate and Run Migrations

```bash
# Generate migration files
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### Step 9: Update Server Code

Update `server/db.ts`:
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

let db: any;

if (process.env.DATABASE_URL) {
  // Production/Development with Neon
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // Fallback for local development without database
  console.warn('No DATABASE_URL found. Using mock database for development.');
  // You could implement a mock database here or throw an error
  throw new Error('DATABASE_URL is required');
}

export { db };
```

Update API imports:
```typescript
// In api/index.ts and server files
import { db } from '../server/db'; // Update this import
```

## 🔧 Advanced Configuration

### Connection Pooling
For better performance, use pooled connections:
```typescript
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### Environment-Specific Configuration
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const connectionString = isDevelopment 
  ? process.env.DATABASE_URL_DEVELOPMENT
  : process.env.DATABASE_URL;

const sql = neon(connectionString!);
export const db = drizzle(sql, { 
  schema,
  logger: isDevelopment // Enable logging in development
});
```

## 🚀 Deployment Steps

### 1. Set Environment Variables in Vercel
```bash
vercel env add DATABASE_URL
# Paste your Neon connection string when prompted
```

### 2. Update Vercel Build Commands
In `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build && npm run db:migrate",
  "outputDirectory": "dist/public",
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 3. Deploy
```bash
vercel --prod
```

## 📊 Migration Commands Summary

```bash
# 1. Install dependencies
npm uninstall better-sqlite3
npm install @neondatabase/serverless drizzle-orm dotenv

# 2. Generate new schema
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Deploy
vercel --prod
```

## 🔍 Verification

After migration, verify your setup:

1. **Check Database Connection**:
   ```bash
   npm run db:studio
   ```

2. **Test API Endpoints**:
   ```bash
   curl https://your-app.vercel.app/api/test-integration
   ```

3. **Monitor Logs**:
   - Check Vercel function logs
   - Monitor Neon Console for connection activity

## 🎯 Key Benefits

✅ **Serverless**: Scales automatically with your application  
✅ **Branching**: Database branches for preview deployments  
✅ **Performance**: Connection pooling and caching  
✅ **Monitoring**: Built-in analytics and logging  
✅ **Reliability**: Automated backups and high availability  

## 🆘 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify environment variables are set correctly
   - Check if using direct (not pooled) connection for migrations

2. **Migration Failures**:
   - Ensure DATABASE_URL is accessible
   - Run migrations manually: `npm run db:migrate`

3. **Type Errors**:
   - Regenerate schema: `npm run db:generate`
   - Update imports from SQLite to PostgreSQL types

### Need Help?

- [Neon Discord](https://discord.gg/neon) - #vercel-postgres-transition channel
- [Vercel Support](https://vercel.com/help)
- [Drizzle Documentation](https://orm.drizzle.team/docs/overview)

## 🎉 You're Ready!

Your application is now using Neon Postgres instead of SQLite, making it production-ready for Vercel deployment with automatic scaling, branching, and enterprise-grade reliability.
