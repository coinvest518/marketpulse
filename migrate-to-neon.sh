#!/bin/bash

echo "🚀 Neon Postgres Migration Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: You need to set up your Neon database first!"
    echo "   1. Go to https://console.neon.tech"
    echo "   2. Create a new project"
    echo "   3. Copy the connection string"
    echo "   4. Add it to your .env file as DATABASE_URL"
    echo ""
    echo "   OR use Vercel Integration:"
    echo "   1. Go to your Vercel dashboard"
    echo "   2. Navigate to Storage tab"
    echo "   3. Create Neon Postgres database"
    echo "   4. Connect it to your project"
    echo ""
    read -p "Press Enter when you've set up DATABASE_URL in .env..."
fi

# Check if DATABASE_URL is set
source .env
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env file"
    echo "Please add your Neon connection string to .env file:"
    echo "DATABASE_URL=\"postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require\""
    exit 1
fi

echo "✅ DATABASE_URL found in environment"

# Generate migration files
echo "📋 Generating migration files..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate migrations"
    exit 1
fi

echo "✅ Migration files generated"

# Push schema to database
echo "🚀 Pushing schema to Neon database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    echo "Please check your DATABASE_URL and try again"
    exit 1
fi

echo "✅ Schema pushed to database successfully!"

# Test connection
echo "🔍 Testing database connection..."
npm run db:studio &
STUDIO_PID=$!
sleep 3
kill $STUDIO_PID 2>/dev/null

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your API imports to use the new database:"
echo "   import { db } from '../server/db_neon';"
echo ""
echo "2. Test your application:"
echo "   npm run dev"
echo ""
echo "3. Deploy to Vercel:"
echo "   vercel env add DATABASE_URL"
echo "   vercel --prod"
echo ""
echo "4. Monitor your database:"
echo "   npm run db:studio"
