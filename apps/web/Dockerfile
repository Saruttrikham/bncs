FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS base
RUN apk update && apk add --no-cache libc6-compat nodejs npm
WORKDIR /app

RUN npm install -g turbo@^2

FROM base AS prepare
WORKDIR /app

COPY package.json bun.lock ./
COPY turbo.json ./

COPY tsconfig.json tsconfig.base.json ./

COPY packages ./packages
COPY apps ./apps

RUN turbo prune @ncbs/web --docker

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

RUN turbo run build --filter=@ncbs/web

FROM --platform=linux/amd64 oven/bun:1.3.0-alpine AS runner
WORKDIR /app

RUN apk add --no-cache nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

RUN mkdir -p ./apps/web/public && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001
ENV PORT=3001

CMD ["node", "apps/web/server.js"]
