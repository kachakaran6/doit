# REFERENCE ONLY — the agent must adapt to the real repo layout/package manager version and TEST it.
# Build context = monorepo root. Expected: non-root, small, runs migrations on start.
FROM node:22-alpine AS base
RUN apk add --no-cache openssl tini && corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @doit/contracts --filter @doit/tokens build || true
RUN pnpm --filter @doit/api exec prisma generate
RUN pnpm --filter @doit/api build
# Create a pruned production bundle (verify the flags for your pnpm version)
RUN pnpm --filter @doit/api deploy --prod /out

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out ./
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/uploads && chown -R app:app /app
USER app
EXPOSE 3000
ENTRYPOINT ["/sbin/tini","--"]
# prisma CLI must be a production dependency (or use a separate migrate step)
CMD ["sh","-c","npx prisma migrate deploy && node dist/main.js"]
