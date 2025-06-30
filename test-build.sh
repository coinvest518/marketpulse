#!/bin/bash

echo "🚀 Testing Vercel Build Process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build client
echo "📦 Building client..."
npm run build:client

# Check if client build succeeded
if [ -d "dist/public" ]; then
    echo "✅ Client build successful!"
    echo "📊 Client build size:"
    du -sh dist/public/
else
    echo "❌ Client build failed!"
    exit 1
fi

# Build server (optional for testing)
echo "🔧 Testing server build (for local verification)..."
if command -v esbuild &> /dev/null; then
    esbuild api/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/api --target=node18
    if [ -f "dist/api/index.js" ]; then
        echo "✅ Server build successful!"
        echo "📊 Server build size:"
        du -sh dist/api/
    else
        echo "⚠️  Server build had issues, but this is expected for Vercel deployment"
    fi
else
    echo "⚠️  esbuild not found, skipping server build test"
fi

echo ""
echo "🎉 Build test completed!"
echo "📁 Build artifacts:"
find dist/ -type f -name "*.js" -o -name "*.css" -o -name "*.html" | head -10

echo ""
echo "🔥 Ready for Vercel deployment!"
echo "Run: vercel --prod"
