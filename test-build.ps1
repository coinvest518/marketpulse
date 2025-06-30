Write-Host "🚀 Testing Vercel Build Process (with Neon DB)..." -ForegroundColor Green

# Test database connection first
Write-Host "🔌 Testing database connection..." -ForegroundColor Blue
if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL found" -ForegroundColor Green
    
    # Create a quick connection test
    $testScript = @"
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
try {
  const result = await sql\`SELECT 1 as connected\`;
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}
"@
    
    $testScript | Out-File -FilePath "temp-db-test.mjs" -Encoding utf8
    try {
        node temp-db-test.mjs
        Remove-Item "temp-db-test.mjs" -ErrorAction SilentlyContinue
    } catch {
        Write-Host "❌ Database connection test failed!" -ForegroundColor Red
        Remove-Item "temp-db-test.mjs" -ErrorAction SilentlyContinue
        Write-Host "⚠️  Continuing with build but deployment may fail..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  DATABASE_URL not set - Neon database not configured" -ForegroundColor Yellow
    Write-Host "📖 See VERCEL_POSTGRES_2025_GUIDE.md for setup instructions" -ForegroundColor Cyan
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Build client
Write-Host "📦 Building client..." -ForegroundColor Blue
npm run build:client

# Check if client build succeeded
if (Test-Path "dist/public") {
    Write-Host "✅ Client build successful!" -ForegroundColor Green
    Write-Host "📊 Client build contents:" -ForegroundColor Cyan
    Get-ChildItem -Recurse "dist/public" | Select-Object Name, Length | Format-Table
}
else {
    Write-Host "❌ Client build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Build test completed!" -ForegroundColor Green
Write-Host "📁 Build artifacts:" -ForegroundColor Cyan
Get-ChildItem -Recurse "dist" -Include "*.js", "*.css", "*.html" | Select-Object Name, FullName

Write-Host ""
Write-Host "🔥 Ready for Vercel deployment!" -ForegroundColor Magenta
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. vercel login" -ForegroundColor White
Write-Host "2. Set DATABASE_URL in Vercel environment variables" -ForegroundColor White
Write-Host "3. vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "📖 Migration Resources:" -ForegroundColor Cyan
Write-Host "- Run: .\migrate-to-neon-2025.ps1" -ForegroundColor Gray
Write-Host "- Guide: VERCEL_POSTGRES_2025_GUIDE.md" -ForegroundColor Gray
Write-Host "- Checklist: NEON_MIGRATION_CHECKLIST_2025.md" -ForegroundColor Gray
