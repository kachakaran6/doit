# DoIt Production Deployment Guide — Coolify & PostgreSQL

This document outlines the production deployment topology, environment variable configuration, persistent storage management, and maintenance procedures for the DoIt API backend running on Coolify.

---

## 1. Infrastructure Specifications

- **Hosting Platform**: Coolify PaaS (Self-hosted on Ubuntu 24.04 LTS)
- **Server**: `main` (IP: `137.23.49.73`)
- **DNS / Edge**: Cloudflare Proxied DNS (`kachakaran.me` / `samyukt.pro`)
- **Reverse Proxy**: Caddy Docker Proxy with dynamic label routing & TLS termination
- **Database Engine**: PostgreSQL 16 Alpine (`doit-db`)
- **Application Engine**: Multi-stage Node.js 22 Alpine container (`doit-api`)
- **API Production Domain**: `https://doit-api.kachakaran.me`
- **Health Check Endpoint**: `https://doit-api.kachakaran.me/api/v1/health`

---

## 2. Resource Hierarchy on Coolify

```
Project: DoIt (uuid: jx8tmqwsymbsggf3svx1otg8)
  └── Environment: production (uuid: ni56mpxmi3spgmcvetpfqs1m)
        ├── Database: doit-db (PostgreSQL 16)
        │     UUID: nb1qafcbbkrcp0awnyvq4abc
        │     Network: coolify (Internal Docker bridge)
        │     Internal URL: postgres://postgres:<SECRET>@nb1qafcbbkrcp0awnyvq4abc:5432/postgres
        └── Application: doit-api
              UUID: lnord0tgfnwefwlvtcnzjtah
              Git App: karan-coolify (uuid: xt46lt5v5rxbd4ckxsq2mq8h)
              Repository: kachakaran6/doit (branch: main)
              Dockerfile: /docker/api.Dockerfile
              Exposed Port: 3000
              Domains: https://doit-api.kachakaran.me
              Persistent Volume: doit-uploads -> /app/uploads
```

---

## 3. Environment Variables Reference

| Variable | Type | Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `production` | Enables production optimizations, logging, and security |
| `PORT` | Number | `3000` | Port on which the NestJS HTTP listener binds |
| `API_PREFIX` | String | `api/v1` | URL prefix for REST controller routing |
| `DATABASE_URL` | String | `postgres://postgres:...@nb1qafcbbkrcp0awnyvq4abc:5432/postgres` | Internal connection pool string for Prisma ORM |
| `JWT_SECRET` | String (Hex 64) | `<SECURE_64_CHAR_HEX>` | Secret key for signing 15-minute access tokens |
| `JWT_REFRESH_SECRET` | String (Hex 64) | `<SECURE_64_CHAR_HEX>` | Secret key for signing 30-day refresh tokens |
| `STORAGE_DRIVER` | Enum | `local` | Upload storage handler (`local` or `s3`) |
| `UPLOAD_DIR` | Path | `/app/uploads` | Path to persistent storage volume for user assets |
| `CORS_ORIGIN` | String | `*` | Allowed CORS origins for cross-origin web requests |
| `TRUST_PROXY` | Number | `1` | Enables reverse-proxy IP headers from Caddy |

---

## 4. Multi-Stage Dockerfile Architecture

The production Docker image (`docker/api.Dockerfile`) is structured as follows:

1. **`base` Stage**: `node:22-alpine` with `openssl`, `tini`, and `pnpm@11.9.0` prepared via Corepack.
2. **`build` Stage**:
   - Copies lockfiles, workspace definitions, `packages/`, `apps/api/`, and `scripts/`.
   - Runs `pnpm install --frozen-lockfile`.
   - Compiles `@doit/contracts` and `@doit/tokens` using TypeScript.
   - Synchronizes workspace symlinks via `scripts/sync-packages.mjs`.
   - Generates Prisma ORM client code (`prisma generate`).
   - Builds production NestJS JavaScript bundle into `dist/` (`tsc -p tsconfig.build.json`).
   - Isolates production runtime artifacts via `pnpm --filter @doit/api deploy --legacy --prod /out`.
3. **`runner` Stage**:
   - Copies only the production bundle `/out`, compiled `dist/`, and Prisma migrations.
   - Creates a dedicated unprivileged user `app:app`.
   - Mounts `/app/uploads` volume with `chown -R app:app /app`.
   - Executes database schema migrations (`npx prisma migrate deploy`) followed by the server (`node dist/main.js`) supervised by `/sbin/tini`.

---

## 5. Health Check & Monitoring

- **Endpoint**: `GET /api/v1/health`
- **Expected Status**: `200 OK`
- **Payload**:
```json
{
  "status": "ok",
  "db": "up",
  "version": "0.1.0",
  "uptime": 124,
  "timestamp": "2026-11-01T19:30:00.000Z"
}
```
- **Coolify Healthcheck Config**:
  - Path: `/api/v1/health`
  - Interval: `30s`
  - Timeout: `5s`
  - Retries: `5`
  - Start Period: `15s`

---

## 6. Zero-Downtime Deployment & Rollbacks

When a new commit is pushed to `main`:
1. Coolify webhook / GitHub App detects commit and enqueues build.
2. New container image is compiled in parallel.
3. Automated database migrations execute on startup.
4. Caddy routes traffic to the new container once the `/api/v1/health` check passes.
5. Old container is gracefully stopped after a 5-second drain period.
