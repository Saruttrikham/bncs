# Base stage - install dependencies
FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS base
WORKDIR /app

# Install Node.js for Next.js build compatibility
RUN apk add --no-cache nodejs npm

# Copy root package files
COPY package.json bun.lock ./
COPY turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy workspace packages
COPY packages ./packages

# Copy Web app
COPY apps/web ./apps/web

# Install dependencies (without frozen lockfile for flexibility)
RUN bun install

# Builder stage - build the application
FROM base AS builder
WORKDIR /app

# Build packages first (dependencies)
RUN cd packages/dtos && bun run build
RUN cd packages/ui && bun run build

# Create public directory if it doesn't exist
RUN mkdir -p apps/web/public

# Build Next.js app using Node.js (better compatibility)
RUN cd apps/web && node ./node_modules/next/dist/bin/next build

# Production stage - minimal runtime image
FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS runner
WORKDIR /app

# Install Node.js for Next.js runtime
RUN apk add --no-cache nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy root files
COPY package.json bun.lock ./
COPY turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages
COPY --from=builder /app/packages/dtos/dist ./packages/dtos/dist
COPY --from=builder /app/packages/dtos/package.json ./packages/dtos/
COPY --from=builder /app/packages/dtos/node_modules ./packages/dtos/node_modules
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder /app/packages/ui/package.json ./packages/ui/
COPY --from=builder /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy Next.js build files
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next

# Set the correct user
USER nextjs

# Expose web port
EXPOSE 3001

# Set Next.js port
ENV PORT=3001

# Start the application
WORKDIR /app/apps/web
CMD ["bun", "run", "start"]

