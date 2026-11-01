# Production Dockerfile for @doit/api (Coolify & Docker Compose ready)
FROM node:22-alpine AS base
RUN apk add --no-cache openssl tini && corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @doit/contracts --filter @doit/tokens build
RUN node scripts/sync-packages.mjs
RUN pnpm --filter @doit/api exec prisma generate
RUN pnpm --filter @doit/api build
RUN pnpm --filter @doit/api deploy --legacy --prod /out

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out ./
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
COPY --from=build /repo/packages ./packages

# Setup non-root execution and storage directories
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/uploads && mkdir -p /app/.storage && chown -R app:app /app
USER app
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

