Write-Host "🚀 Neon Postgres Migration Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: You need to set up your Neon database first!" -ForegroundColor Red
    Write-Host "   1. Go to https://console.neon.tech" -ForegroundColor White
    Write-Host "   2. Create a new project" -ForegroundColor White
    Write-Host "   3. Copy the connection string" -ForegroundColor White
    Write-Host "   4. Add it to your .env file as DATABASE_URL" -ForegroundColor White
    Write-Host ""
    Write-Host "   OR use Vercel Integration:" -ForegroundColor Cyan
    Write-Host "   1. Go to your Vercel dashboard" -ForegroundColor White
    Write-Host "   2. Navigate to Storage tab" -ForegroundColor White
    Write-Host "   3. Create Neon Postgres database" -ForegroundColor White
    Write-Host "   4. Connect it to your project" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter when you've set up DATABASE_URL in .env"
}

# Check if DATABASE_URL is set in .env
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$databaseUrl = $envContent | Where-Object { $_ -match "^DATABASE_URL=" }

if (-not $databaseUrl) {
    Write-Host "❌ DATABASE_URL is not set in .env file" -ForegroundColor Red
    Write-Host "Please add your Neon connection string to .env file:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"' -ForegroundColor White
    exit 1
}

Write-Host "✅ DATABASE_URL found in .env file" -ForegroundColor Green

# Generate migration files
Write-Host "📋 Generating migration files..." -ForegroundColor Blue
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate migrations" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration files generated" -ForegroundColor Green

# Push schema to database
Write-Host "🚀 Pushing schema to Neon database..." -ForegroundColor Blue
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema to database" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Schema pushed to database successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Migration completed successfully!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your API imports to use the new database:" -ForegroundColor White
Write-Host "   import { db } from '../server/db_neon';" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test your application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor White
Write-Host "   vercel env add DATABASE_URL" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Monitor your database:" -ForegroundColor White
Write-Host "   npm run db:studio" -ForegroundColor Cyan
