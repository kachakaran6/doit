# 07 — Deployment (Docker + Coolify)

## Images
`docker/api.Dockerfile` — multi-stage: deps → build → prod runner (node:lts-alpine, non-root user, `prisma generate`, `prisma migrate deploy` on start via entrypoint script, `tini`). Context = monorepo root (pnpm filter `api` + `shared`).

## Compose (local + Coolify "Docker Compose" resource)
Services: `api`, `db` (postgres:16-alpine, volume `pgdata`, healthcheck), optional `adminer` (local profile only).
Volumes: `pgdata`, `uploads` mounted at `/app/uploads`.
`api` depends_on db healthy; exposes port `3000`; healthcheck `GET /api/v1/health`.

## Env (`apps/api/.env.example`)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://samyukt:CHANGE_ME@db:5432/samyukt
JWT_ACCESS_SECRET=CHANGE_ME_LONG_RANDOM
JWT_ACCESS_TTL=15m
REFRESH_TTL_DAYS=30
CORS_ORIGINS=*
UPLOAD_DIR=/app/uploads
MAX_IMAGE_MB=10
MAX_AUDIO_MB=20
PUBLIC_BASE_URL=https://api.example.com
```

## Coolify checklist
1. New resource → from Git repo → Build pack: **Dockerfile** (or Docker Compose).
2. Set env vars in Coolify UI; mark secrets.
3. Add a **persistent storage** for `/app/uploads`; Postgres as Coolify database resource or compose service with volume.
4. Port 3000, domain with HTTPS (Coolify proxy/Traefik handles TLS). Health check path `/api/v1/health`.
5. Behind proxy: `app.set('trust proxy', 1)`; set body size limit ≥ 25 MB in app and proxy.
6. Migrations run on container start (idempotent `prisma migrate deploy`).
7. Backups: enable Coolify scheduled Postgres backups; uploads volume backup noted in README.

## Mobile build
- EAS Build profiles: `development` (dev client, APK), `preview` (internal APK for testers), `production`.
- `EXPO_PUBLIC_API_URL` per profile.
- Testers install the **preview APK** directly (sideload) — also write a short `TESTER_GUIDE.md` (install → login → enable bug capture wizard).

## CI (optional, GitHub Actions)
lint + typecheck + api tests on PR; build & push image on main.
