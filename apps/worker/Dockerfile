# Base stage - install turbo
FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS base
RUN apk update && apk add --no-cache libc6-compat nodejs npm
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo@^2

# ---
# Prune stage - create a pruned monorepo for the worker app
FROM base AS prepare
WORKDIR /app

COPY package.json bun.lock ./
COPY turbo.json ./

COPY tsconfig.json tsconfig.base.json ./

COPY packages ./packages
COPY apps ./apps

RUN turbo prune @ncbs/worker --docker

# ---
# Install dependencies stage
FROM base AS installer
WORKDIR /app

COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/bun.lock ./bun.lock
RUN bun install

COPY --from=prepare /app/out/full/ .

COPY --from=prepare /app/tsconfig.json ./tsconfig.json
COPY --from=prepare /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=prepare /app/turbo.json ./turbo.json

# ---
# Builder stage - build the application
FROM installer AS builder
WORKDIR /app

RUN turbo run build --filter=@ncbs/worker

FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/apps/worker/nest-cli.json ./apps/worker/

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/packages/dtos/dist ./packages/dtos/dist
COPY --from=builder /app/packages/dtos/package.json ./packages/dtos/
COPY --from=builder /app/packages/dtos/node_modules ./packages/dtos/node_modules
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/packages/logger/package.json ./packages/logger/
COPY --from=builder /app/packages/logger/node_modules ./packages/logger/node_modules

COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/turbo.json ./turbo.json

CMD ["node", "apps/worker/dist/src/main.js"]
