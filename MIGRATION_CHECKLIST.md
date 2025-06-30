# ✅ Neon Postgres Migration Checklist

Follow this step-by-step checklist to migrate from SQLite to Neon Postgres.

## 📋 Pre-Migration Checklist

- [ ] **Backup your current SQLite data** (if you have important data)
  ```bash
  cp local.db local.db.backup
  ```

- [ ] **Ensure you have the latest code**
  ```bash
  git pull origin main
  ```

## 🗄️ Database Setup

### Option A: Vercel Integration (Recommended)

- [ ] **Go to Vercel Dashboard**
  - Navigate to [vercel.com/dashboard](https://vercel.com/dashboard)
  - Select your project

- [ ] **Add Neon Database**
  - Click **Storage** tab
  - Click **Create Database**
  - Select **Neon Postgres**
  - Follow the setup wizard

- [ ] **Connect to Your Project**
  - Select environments (Development, Preview, Production)
  - Copy the `DATABASE_URL` provided

### Option B: Direct Neon Account

- [ ] **Create Neon Account**
  - Go to [console.neon.tech](https://console.neon.tech)
  - Sign up or log in

- [ ] **Create New Project**
  - Click **New Project**
  - Choose a name and region
  - Select Postgres version (latest recommended)

- [ ] **Get Connection String**
  - Click **Connect** button
  - Copy the connection string
  - Format: `postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`

## 🔧 Code Migration

- [ ] **Set up Environment Variables**
  ```bash
  # Copy the example file
  cp .env.example .env
  
  # Edit .env and add your DATABASE_URL
  DATABASE_URL="your_neon_connection_string_here"
  ```

- [ ] **Update Dependencies** (already done)
  - ✅ `@neondatabase/serverless` installed
  - ✅ `dotenv` installed
  - ✅ `drizzle-orm` updated

- [ ] **Use New Database Configuration**
  Update your imports in:
  - `api/index.ts`
  - `server/storage.ts`
  - Any other files using the database
  
  Change:
  ```typescript
  import { db } from '../server/db';
  ```
  
  To:
  ```typescript
  import { db } from '../server/db_neon';
  ```

## 🏗️ Database Schema Migration

- [ ] **Generate Migration Files**
  ```bash
  npm run db:generate
  ```

- [ ] **Push Schema to Neon**
  ```bash
  npm run db:push
  ```

- [ ] **Verify Database Connection**
  ```bash
  npm run db:studio
  ```
  - Should open Drizzle Studio
  - Verify tables are created
  - Check schema matches expectations

## 🧪 Testing

- [ ] **Test Local Development**
  ```bash
  npm run dev
  ```
  - Verify app starts without errors
  - Test API endpoints work
  - Check database operations function

- [ ] **Test API Endpoints**
  - `/api/test-integration` - Should connect to services
  - `/api/auth/user` - Authentication flow
  - `/api/keywords` - CRUD operations
  - `/api/mentions` - Data retrieval
  - `/api/analytics/sentiment` - Analytics

- [ ] **Test with Real Data**
  - Create test user
  - Add test keywords
  - Verify data persistence
  - Check relationships work

## 🚀 Deployment

- [ ] **Set Environment Variables in Vercel**
  ```bash
  vercel env add DATABASE_URL
  # Paste your Neon connection string
  ```

- [ ] **Deploy to Vercel**
  ```bash
  vercel --prod
  ```

- [ ] **Verify Production Deployment**
  - Check logs for database connection
  - Test API endpoints in production
  - Verify no SQLite references remain

## 🔍 Post-Migration Verification

- [ ] **Monitor Database Performance**
  - Check Neon Console for connection stats
  - Monitor query performance
  - Verify no connection errors

- [ ] **Test All Features**
  - User authentication
  - Keyword management
  - Mention tracking
  - AI chat functionality
  - Report generation

- [ ] **Set up Monitoring** (Optional)
  - Enable Neon monitoring
  - Set up alerts for connection issues
  - Monitor database usage

## 🧹 Cleanup

- [ ] **Remove SQLite Dependencies** (Optional)
  ```bash
  npm uninstall better-sqlite3
  ```

- [ ] **Remove Old Files** (Optional)
  - `local.db` (after verifying migration)
  - `migrations/` (old SQLite migrations)
  - `server/db.ts` (old SQLite config)

- [ ] **Update Documentation**
  - Update README.md
  - Document new database setup
  - Update deployment instructions

## 🆘 Troubleshooting

### Common Issues

- **Connection Errors**
  - [ ] Verify `DATABASE_URL` format
  - [ ] Check network connectivity
  - [ ] Ensure database is not sleeping (Neon free tier)

- **Schema Issues**
  - [ ] Regenerate migrations: `npm run db:generate`
  - [ ] Check for type mismatches
  - [ ] Verify foreign key constraints

- **Import Errors**
  - [ ] Update all database imports
  - [ ] Check for circular dependencies
  - [ ] Verify schema exports

### Need Help?

- 📖 [Neon Documentation](https://neon.com/docs)
- 💬 [Neon Discord](https://discord.gg/neon)
- 🎯 [Drizzle Documentation](https://orm.drizzle.team)

## ✨ Success Criteria

Your migration is complete when:

- [ ] ✅ Application starts without errors
- [ ] ✅ All API endpoints work correctly
- [ ] ✅ Data persists between requests
- [ ] ✅ Production deployment is successful
- [ ] ✅ No SQLite references remain in code
- [ ] ✅ Database monitoring shows healthy connections

**🎉 Congratulations! Your application is now running on Neon Postgres!**
