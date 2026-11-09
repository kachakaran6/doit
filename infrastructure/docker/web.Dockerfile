# Production Web Dockerfile for @doit/web (Coolify & Nginx ready)
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /repo
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @doit/contracts --filter @doit/tokens build
RUN pnpm --filter @doit/web build

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80

