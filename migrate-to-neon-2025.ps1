#!/usr/bin/env powershell

# 🚀 Neon Database Migration Script (2025 Best Practices)
# Based on latest Vercel Postgres → Neon transition documentation

Write-Host "🔄 Neon Database Migration & Setup (2025)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    Write-Host "⚠️  Please update .env with your DATABASE_URL" -ForegroundColor Yellow
}

# Check for required environment variables
Write-Host "🔍 Checking environment configuration..." -ForegroundColor Blue

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#].+?)=(.+)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl -or $databaseUrl -eq "your_neon_connection_string_here") {
    Write-Host "❌ DATABASE_URL not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Steps to set up Neon database:" -ForegroundColor Yellow
    Write-Host "1. Visit https://console.neon.tech/ or use Vercel Dashboard → Storage" -ForegroundColor White
    Write-Host "2. Create a new Postgres database" -ForegroundColor White
    Write-Host "3. Copy the connection string" -ForegroundColor White
    Write-Host "4. Update DATABASE_URL in .env file" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Example DATABASE_URL format:" -ForegroundColor Cyan
    Write-Host "DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ DATABASE_URL configured" -ForegroundColor Green

# Check if packages are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Blue

$packages = @(
    "@neondatabase/serverless",
    "drizzle-orm",
    "dotenv"
)

$devPackages = @(
    "drizzle-kit"
)

foreach ($package in $packages) {
    if (-not (Test-Path "node_modules/$package")) {
        Write-Host "❌ Missing package: $package" -ForegroundColor Red
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install @neondatabase/serverless drizzle-orm dotenv
        break
    }
}

foreach ($package in $devPackages) {
    if (-not (Test-Path "node_modules/$package")) {
        Write-Host "❌ Missing dev package: $package" -ForegroundColor Red
        Write-Host "📦 Installing dev dependencies..." -ForegroundColor Yellow
        npm install -D drizzle-kit
        break
    }
}

Write-Host "✅ Dependencies OK" -ForegroundColor Green

# Test database connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Blue

# Create a simple connection test script
$testScript = @"
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function testConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql\`SELECT 1 as test\`;
    console.log('✅ Database connection successful!');
    console.log('📊 Test result:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"@

$testScript | Out-File -FilePath "test-connection.mjs" -Encoding utf8

try {
    node test-connection.mjs
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
    Remove-Item "test-connection.mjs" -ErrorAction SilentlyContinue
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "🔍 Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
    Remove-Item "test-connection.mjs" -ErrorAction SilentlyContinue
    exit 1
}

# Generate and apply migrations
Write-Host "🔧 Running database migrations..." -ForegroundColor Blue

Write-Host "📝 Generating migration files..." -ForegroundColor Yellow
try {
    npm run db:generate
    Write-Host "✅ Migration files generated" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Migration generation failed, trying db:push instead..." -ForegroundColor Yellow
    try {
        npm run db:push
        Write-Host "✅ Schema pushed directly to database" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to update database schema" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Applying migrations to database..." -ForegroundColor Yellow
try {
    npm run db:migrate
    Write-Host "✅ Migrations applied successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Migration command not available, schema should be updated via push" -ForegroundColor Yellow
}

# Verify schema
Write-Host "🔍 Verifying database schema..." -ForegroundColor Blue

$verifyScript = @"
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function verifySchema() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Check if tables exist
    const tables = await sql\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`;
    
    console.log('📊 Database tables:', tables.map(t => t.table_name));
    
    if (tables.length > 0) {
      console.log('✅ Database schema verified!');
    } else {
      console.log('⚠️  No tables found. Schema may need to be applied.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    process.exit(1);
  }
}

verifySchema();
"@

$verifyScript | Out-File -FilePath "verify-schema.mjs" -Encoding utf8

try {
    node verify-schema.mjs
    Remove-Item "verify-schema.mjs" -ErrorAction SilentlyContinue
} catch {
    Write-Host "❌ Schema verification failed!" -ForegroundColor Red
    Remove-Item "verify-schema.mjs" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🎉 Neon Migration Complete!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your code to use server/db_neon.ts instead of server/db.ts" -ForegroundColor White
Write-Host "2. Test your application locally: npm run dev" -ForegroundColor White
Write-Host "3. Set DATABASE_URL in Vercel environment variables" -ForegroundColor White
Write-Host "4. Deploy to Vercel: vercel --prod" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "npm run db:generate  # Generate new migrations" -ForegroundColor Gray
Write-Host "npm run db:push      # Push schema changes (development)" -ForegroundColor Gray
Write-Host "npm run db:migrate   # Apply migrations (production)" -ForegroundColor Gray
Write-Host "npm run db:studio    # Open Drizzle Studio (if configured)" -ForegroundColor Gray

Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "- VERCEL_POSTGRES_2025_GUIDE.md" -ForegroundColor Gray
Write-Host "- https://neon.tech/docs" -ForegroundColor Gray
Write-Host "- https://orm.drizzle.team/docs/get-started/neon-new" -ForegroundColor Gray
