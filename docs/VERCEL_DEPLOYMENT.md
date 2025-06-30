# Vercel Deployment Guide

This guide explains how to deploy your AI-powered market research platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Environment Variables**: Prepare your API keys and Firebase configuration
3. **Build Configuration**: The project is now configured for Vercel deployment

## Project Structure for Vercel

The project has been restructured for Vercel compatibility:

```
├── api/                    # Serverless API functions
│   └── index.ts           # Main API handler
├── client/                # React frontend
├── dist/public/          # Built static files (generated)
├── server/               # Original server code (for reference)
├── vercel.json          # Vercel configuration
└── package.json         # Build scripts updated
```

## Environment Variables

You need to set these environment variables in your Vercel dashboard:

### Firebase Configuration (Client-side)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### API Keys (Server-side)
- `TAVILY_API_KEY`
- `MEM0_API_KEY`
- `OPENAI_API_KEY`
- `COPILOTKIT_API_KEY`

### Firebase Admin (Server-side)
- `GOOGLE_APPLICATION_CREDENTIALS` (or Firebase Admin SDK config)

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel --prod
   ```

4. **Set environment variables**:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add TAVILY_API_KEY
   # ... add all other environment variables
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set Environment Variables**:
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add all required environment variables

## Build Configuration

The project includes these build configurations:

### package.json scripts:
- `build`: Builds the client for production
- `build:client`: Builds React frontend only
- `build:server`: Builds API for serverless functions

### vercel.json:
- Configures API routes to use serverless functions
- Sets up static file serving
- Handles client-side routing

## API Endpoints

After deployment, your API will be available at:
- `https://your-app.vercel.app/api/auth/user`
- `https://your-app.vercel.app/api/keywords`
- `https://your-app.vercel.app/api/mentions`
- `https://your-app.vercel.app/api/analytics/sentiment`
- `https://your-app.vercel.app/api/chat`

## Database Considerations

### SQLite (Current):
- Works for development but not recommended for production
- Consider migrating to:
  - Vercel Postgres
  - PlanetScale
  - Neon
  - Supabase

### Migration to Vercel Postgres:
1. Create a Vercel Postgres database
2. Update database configuration in `server/db.ts`
3. Set `POSTGRES_URL` environment variable
4. Run migrations

## Troubleshooting

### Build Errors
- Check that all dependencies are in `dependencies` not `devDependencies`
- Verify TypeScript types are correct
- Check build logs in Vercel dashboard

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify environment variables are set correctly
- Test API endpoints individually

### Database Issues
- SQLite files are not persistent in Vercel
- Consider using external database service
- Check database connection configuration

## Performance Optimization

1. **Enable caching** for static assets
2. **Optimize bundle size** with tree shaking
3. **Use CDN** for images and assets
4. **Implement proper error handling**

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API response times
- Track user engagement

## Next Steps

1. Set up production database
2. Configure domain name
3. Set up monitoring and analytics
4. Implement proper error handling
5. Add CI/CD pipeline for testing

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally with `vercel dev`
4. Check the Vercel documentation
