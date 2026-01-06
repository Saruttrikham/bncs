# National Credit Bank System (NCBS)

A centralized "System of Record" for Thai university credits, aggregating data from multiple heterogeneous university APIs into a standardized format.

## Architecture

This project follows a **Modular Monolith** architecture inside a **Monorepo**:

- **`apps/api`** - NestJS API Gateway (Producer) - Handles HTTP requests, validation, and authentication. Pushes jobs to queue.
- **`apps/worker`** - NestJS Background Processor (Consumer) - Handles heavy business logic, parsing JSON files, and normalizing grades.
- **`apps/web`** - Next.js 14+ Frontend - Admin Dashboard & Student Portal

### Shared Packages

- **`packages/database`** - Prisma Client & Schema (Source of Truth)
- **`packages/dtos`** - Shared Zod Schemas & TypeScript Types (Contract between FE/BE)
- **`packages/ui`** - Shared React Components
- **`packages/logger`** - Standardized Logging

## Tech Stack

- **Monorepo Manager:** Turborepo + pnpm
- **Backend Framework:** NestJS (Modular Monolith)
- **Frontend Framework:** Next.js 14+ (App Router, CSR focus)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Queue:** BullMQ (Redis)
- **Validation:** Zod

## Getting Started

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build packages
pnpm build

# 3. Set up database (see SETUP.md for details)
cd packages/database
pnpm dev
pnpm db:push
cd ../..

# 4. Create .env.local files (see SETUP.md)
# - apps/api/.env.local
# - apps/worker/.env.local  
# - apps/web/.env.local

# 5. Run all apps
pnpm dev
```

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (running on port 5432)
- Redis (running on port 6379)

### Development

Run all apps in development mode:
```bash
pnpm dev
```

This starts:
- **API Server** on `http://localhost:3001`
- **Worker** (background processor)
- **Web App** on `http://localhost:3000`

Or run individual apps:
```bash
# API Server
cd apps/api && pnpm dev

# Worker
cd apps/worker && pnpm dev

# Web App
cd apps/web && pnpm dev
```

## Project Structure

```
root/
├── apps/
│   ├── api/                 # NestJS API Gateway
│   ├── worker/              # NestJS Background Processor
│   └── web/                 # Next.js Frontend
│
├── packages/
│   ├── database/            # Prisma Client & Schema
│   ├── dtos/                # Zod Schemas & TS Types
│   ├── ui/                  # Shared React Components
│   └── logger/              # Standardized Logging
```

## Design Patterns

### Backend (DDD)

Business logic lives in `domain/` or `application/`, never in `api/` (Controllers).

```
src/modules/ingestion/
├── api/                     # Controllers (Input/Output only)
├── application/             # Use Cases / Commands / Queries
├── domain/                  # Pure Business Logic (No frameworks, No DB)
└── infrastructure/          # Database Implementation & External Adapters
```

### Frontend (Feature-Sliced Design)

Domain-specific logic lives in `features/`:
- `features/transcript/components/TranscriptTable.tsx`

## Coding Guidelines

1. **Always update DTOs first**: If adding a field, modify `packages/dtos` first, then run `pnpm build`.
2. **No Logic in Controllers**: Controllers should only parse requests, call services, and return results.
3. **Strict Typing**: Do not use `any`. Use interfaces from `packages/dtos`.
4. **Environment Variables**: Reference via `ConfigService`, never `process.env` directly.

## License

Private

# bncs
