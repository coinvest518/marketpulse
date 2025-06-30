# ✅ Neon Migration Checklist (2025 Edition)

Based on the latest Vercel Postgres → Neon transition and Drizzle ORM best practices.

## 📋 Pre-Migration Setup

### 1. Database Creation
- [ ] **Create Neon Database**
  - [ ] Option A: Via Vercel Dashboard → Storage → "Create Database" → Neon Postgres
  - [ ] Option B: Direct at https://console.neon.tech/
  - [ ] Copy connection string from dashboard
  - [ ] Note: Use **direct** connection string for migrations, **pooled** for app queries

### 2. Environment Configuration
- [ ] **Local Environment (.env)**
  ```bash
  DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
  ```
- [ ] **Vercel Environment**
  - [ ] Add DATABASE_URL to Vercel Dashboard → Settings → Environment Variables
  - [ ] Or use: `vercel env add DATABASE_URL`

### 3. Dependencies Check
- [ ] **Required packages installed:**
  ```json
  {
    "dependencies": {
      "drizzle-orm": "latest",
      "@neondatabase/serverless": "latest",
      "dotenv": "latest"
    },
    "devDependencies": {
      "drizzle-kit": "latest"
    }
  }
  ```

## 🔧 Migration Process

### 4. Schema & Configuration
- [ ] **Drizzle config updated** (`drizzle.config.ts`)
  ```typescript
  export default defineConfig({
    schema: "./shared/schema_postgres.ts",
    out: "./migrations_postgres",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  });
  ```
- [ ] **PostgreSQL schema ready** (`shared/schema_postgres.ts`)
- [ ] **Database connection configured** (`server/db_neon.ts`)

### 5. Migration Commands
- [ ] **Test database connection**
  ```bash
  node -e "
    import('@neondatabase/serverless').then(async ({neon}) => {
      const sql = neon(process.env.DATABASE_URL);
      console.log(await sql\`SELECT 1 as test\`);
    })
  "
  ```
- [ ] **Generate migrations**
  ```bash
  npm run db:generate
  ```
- [ ] **Apply migrations**
  ```bash
  # Development: Direct push
  npm run db:push
  
  # Production: Proper migrations
  npm run db:migrate
  ```

## 🔄 Code Migration

### 6. Update API/Server Code
- [ ] **Replace database imports**
  ```typescript
  // ❌ Old (SQLite)
  import { db } from '../server/db';
  
  // ✅ New (Neon)
  import { db } from '../server/db_neon';
  ```
- [ ] **Update all API routes** (api/*.ts, server/*.ts)
- [ ] **Update service files** (server/services/*.ts)

### 7. Data Migration (if needed)
- [ ] **Export existing data** (if coming from SQLite)
  ```bash
  npm run export-data  # Custom script if needed
  ```
- [ ] **Import data to Neon**
  ```bash
  npm run import-data  # Custom script if needed
  ```

## 🧪 Testing

### 8. Local Testing
- [ ] **Run migration script**
  ```powershell
  .\migrate-to-neon-2025.ps1
  ```
- [ ] **Start development server**
  ```bash
  npm run dev
  ```
- [ ] **Test all API endpoints**
  - [ ] User authentication
  - [ ] Data CRUD operations
  - [ ] AI analysis features
  - [ ] Keyword monitoring

### 9. Build Testing
- [ ] **Test production build**
  ```powershell
  .\test-build.ps1
  ```
- [ ] **Verify build artifacts**
  - [ ] Client build in `dist/public`
  - [ ] API functions in `api/`
  - [ ] No build errors

## 🚀 Deployment

### 10. Vercel Deployment
- [ ] **Set environment variables in Vercel**
  ```bash
  # All required environment variables
  DATABASE_URL=postgresql://...
  OPENAI_API_KEY=...
  TAVILY_API_KEY=...
  MEM0_API_KEY=...
  # ... other API keys
  ```
- [ ] **Deploy to Vercel**
  ```bash
  vercel --prod
  ```
- [ ] **Run post-deployment migration** (if needed)
  ```bash
  vercel env pull .env.local
  npm run db:migrate
  ```

### 11. Production Testing
- [ ] **Test deployed application**
  - [ ] Database connectivity
  - [ ] API endpoints functionality
  - [ ] User flows (signup, login, dashboard)
  - [ ] AI integrations
- [ ] **Monitor for errors**
  - [ ] Check Vercel function logs
  - [ ] Monitor Neon database metrics
  - [ ] Check application performance

## 🔍 Post-Migration Verification

### 12. Performance & Monitoring
- [ ] **Database performance**
  - [ ] Query response times
  - [ ] Connection pooling working
  - [ ] No connection timeouts
- [ ] **Application metrics**
  - [ ] Page load times
  - [ ] API response times
  - [ ] Error rates

### 13. Clean Up
- [ ] **Remove old SQLite references** (after confirming Neon works)
  - [ ] Delete `local.db`
  - [ ] Remove SQLite-specific code
  - [ ] Update documentation
- [ ] **Update team documentation**
  - [ ] Share new environment setup
  - [ ] Update README.md
  - [ ] Document new deployment process

## 🆘 Troubleshooting Checklist

### Common Issues
- [ ] **Connection errors**
  - [ ] Check DATABASE_URL format
  - [ ] Verify SSL mode (`sslmode=require`)
  - [ ] Test network connectivity
- [ ] **Migration errors**
  - [ ] Use direct (non-pooled) connection for migrations
  - [ ] Check schema syntax
  - [ ] Verify permissions
- [ ] **Build/Deploy errors**
  - [ ] Check environment variables in Vercel
  - [ ] Verify API route imports
  - [ ] Check for TypeScript errors

### Resources
- [ ] **Documentation links saved**
  - [ ] [Neon Documentation](https://neon.tech/docs)
  - [ ] [Drizzle + Neon Guide](https://orm.drizzle.team/docs/get-started/neon-new)
  - [ ] [Vercel Postgres Transition Guide](https://neon.com/docs/guides/vercel-postgres-transition-guide)

## 📊 Success Criteria

- [ ] ✅ Application running locally with Neon
- [ ] ✅ All API endpoints working
- [ ] ✅ Successful Vercel deployment
- [ ] ✅ Production database operational
- [ ] ✅ No performance regressions
- [ ] ✅ Team can deploy and develop

---

**Your project is already well-configured for Neon! 🎉**

Main remaining tasks:
1. Create Neon database and set DATABASE_URL
2. Switch API imports from `db.ts` to `db_neon.ts`
3. Test and deploy

Use the migration script: `.\migrate-to-neon-2025.ps1`
