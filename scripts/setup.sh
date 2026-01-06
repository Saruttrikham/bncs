#!/bin/bash
set -e

echo "🚀 Setting up NCBS..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Make sure PostgreSQL is installed and running."
fi

if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis not found. Make sure Redis is installed and running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm build

# Setup database
echo "🗄️  Setting up database..."
cd packages/database
pnpm dev

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please create .env.local files:"
    echo "   - apps/api/.env.local"
    echo "   - apps/worker/.env.local"
    echo "   - apps/web/.env.local"
    echo ""
    echo "See SETUP.md for details."
else
    echo "📊 Pushing database schema..."
    pnpm db:push || echo "⚠️  Database push failed. Check your DATABASE_URL."
fi

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create .env.local files (see SETUP.md)"
echo "2. Run 'pnpm dev' to start all apps"
echo "3. Visit http://localhost:3000 for web app"
echo "4. Visit http://localhost:3001/health for API health check"

