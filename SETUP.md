# NCBS Setup & Run Guide

Complete guide to set up and run the NCBS monorepo.

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker. See [DOCKER.md](./DOCKER.md) for detailed instructions.

```bash
# 1. Copy environment template
cp ENV_TEMPLATE.txt .env

# 2. Edit .env with your configuration (if needed)
nano .env

# 3. Start all services
make up
# OR
docker-compose up -d

# 4. View logs
make logs
# OR
docker-compose logs -f

# Access the applications:
# - API: http://localhost:3000
# - Web: http://localhost:3001
# - Oracle: localhost:1521
# - Redis: localhost:6379
```

That's it! See [DOCKER.md](./DOCKER.md) for more commands and options.

---

## Alternative: Local Development Setup

If you prefer to run the applications locally without Docker:

## Prerequisites

Before starting, ensure you have:

1. **Node.js** >= 18.0.0

   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **pnpm** >= 8.0.0

   ```bash
   npm install -g pnpm
   pnpm --version  # Should be >= 8.0.0
   ```

3. **PostgreSQL** (for database)

   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Or use Docker
   docker run --name ncbs-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

4. **Redis** (for BullMQ queue)

   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Or use Docker
   docker run --name ncbs-redis -p 6379:6379 -d redis
   ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From the root directory
pnpm install
```

This installs dependencies for all apps and packages in the monorepo.

### 2. Set Up Environment Variables

Create `.env.local` files for each app:

#### Root `.env.local` (optional, for shared config)

```bash
# Copy example (if you created one)
cp .env.example .env.local
```

#### `apps/api/.env.local`

```bash
cd apps/api
cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ncbs?schema=public"

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
LOG_LEVEL=debug
EOF
```

#### `apps/worker/.env.local`

```bash
cd apps/worker
cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ncbs?schema=public"

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development
LOG_LEVEL=debug
EOF
```

#### `apps/web/.env.local`

```bash
cd apps/web
cat > .env.local << EOF
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
EOF
```

**Important:** Update the `DATABASE_URL` with your actual PostgreSQL credentials!

### 3. Set Up Database

```bash
# Navigate to database package
cd packages/database

# Generate Prisma Client
pnpm dev

# Push schema to database (creates tables)
pnpm db:push

# Or use migrations (recommended for production)
pnpm db:migrate
```

### 4. Build All Packages (One-Time Setup)

```bash
# From root directory
pnpm build
```

This builds all packages (`database`, `dtos`, `logger`, `ui`) that are dependencies of the apps.

**Note**: After this initial build, you don't need to rebuild manually! The `dev` command runs packages in watch mode, so they rebuild automatically when you change them. See [DEV_MODE.md](./DEV_MODE.md) for details.

## Running the Applications

### Option 1: Run All Apps Together (Recommended)

From the root directory:

```bash
pnpm dev
```

This runs all apps in parallel using Turborepo:

- API server on `http://localhost:3001`
- Worker (background processor)
- Web app on `http://localhost:3000`

### Option 2: Run Apps Individually

#### Run API Server

```bash
cd apps/api
pnpm dev
# API runs on http://localhost:3001
```

#### Run Worker

```bash
cd apps/worker
pnpm dev
# Worker processes jobs from Redis queue
```

#### Run Web App

```bash
cd apps/web
pnpm dev
# Web app runs on http://localhost:3000
```

### Option 3: Run Specific Apps

```bash
# Run only API and Web
pnpm --filter @ncbs/api dev &
pnpm --filter @ncbs/web dev

# Or use turbo directly
turbo run dev --filter=@ncbs/api --filter=@ncbs/web
```

## Verify Everything Works

### 1. Check API Health

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"api"}
```

### 2. Check Web App

Open browser: `http://localhost:3000`

### 3. Test Authentication (after setup)

```bash
# Login endpoint
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Common Issues & Solutions

### Issue: "Cannot find module '@ncbs/database'"

**Solution:** Build packages first

```bash
pnpm build
```

### Issue: "Prisma Client not generated"

**Solution:** Generate Prisma client

```bash
cd packages/database
pnpm dev
```

### Issue: "Database connection failed"

**Solution:**

1. Check PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `.env.local` is correct
3. Create database: `createdb ncbs` (if using PostgreSQL directly)

### Issue: "Redis connection failed"

**Solution:**

1. Check Redis is running: `redis-cli ping` (should return "PONG")
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env.local`

### Issue: Port already in use

**Solution:** Change ports in `.env.local` files or kill the process:

```bash
# Find process on port 3001
lsof -ti:3001 | xargs kill -9
```

## Development Workflow

### 1. Making Changes to Shared Packages

If you modify `packages/dtos` or `packages/database`:

```bash
# Rebuild the package
cd packages/dtos
pnpm build

# Or rebuild all packages
cd ../..
pnpm build
```

### 2. Adding a New Package Dependency

```bash
# Add to specific app
cd apps/api
pnpm add some-package

# Add to shared package
cd packages/dtos
pnpm add some-package
```

### 3. Database Migrations

```bash
cd packages/database

# Create a new migration
pnpm db:migrate --name add_new_field

# Apply migrations
pnpm db:migrate deploy

# Reset database (⚠️ deletes all data)
pnpm db:migrate reset
```

## Production Build

```bash
# Build all apps and packages
pnpm build

# Run production builds
cd apps/api
pnpm start:prod

cd apps/worker
pnpm start:prod

cd apps/web
pnpm start
```

## Quick Start Script

Save this as `setup.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up NCBS..."

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
pnpm db:push
cd ../..

echo "✅ Setup complete! Run 'pnpm dev' to start all apps."
```

Make it executable:

```bash
chmod +x setup.sh
./setup.sh
```

## Next Steps

1. ✅ All apps running
2. Visit `http://localhost:3000` to see the web app
3. Test API at `http://localhost:3001`
4. Check worker logs for job processing
5. Read `PACKAGE_SHARING_EXAMPLE.md` to understand package sharing
