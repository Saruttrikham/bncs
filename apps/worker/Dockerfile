# Base stage - install dependencies
FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS base
WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./
COPY turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy workspace packages
COPY packages ./packages

# Copy Worker app
COPY apps/worker ./apps/worker

# Install dependencies (without frozen lockfile for flexibility)
RUN bun install

# Builder stage - build the application
FROM base AS builder
WORKDIR /app

# Build packages first (dependencies)
RUN cd packages/database && bun run build
RUN cd packages/dtos && bun run build
RUN cd packages/logger && bun run build

# Build Worker
RUN cd apps/worker && bun run build

# Production stage - minimal runtime image
FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS runner
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy node_modules from builder (includes all dependencies already installed)
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/packages/dtos/dist ./packages/dtos/dist
COPY --from=builder /app/packages/dtos/package.json ./packages/dtos/
COPY --from=builder /app/packages/dtos/node_modules ./packages/dtos/node_modules
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/packages/logger/package.json ./packages/logger/
COPY --from=builder /app/packages/logger/node_modules ./packages/logger/node_modules

# Copy built Worker
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/apps/worker/nest-cli.json ./apps/worker/
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "apps/worker/dist/src/main.js"]

