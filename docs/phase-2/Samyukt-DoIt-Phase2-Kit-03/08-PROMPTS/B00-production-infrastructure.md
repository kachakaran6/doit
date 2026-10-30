# B00 — Production Infrastructure

**Lane** B · **Depends on** R00 · **Branch** `feat/b00-production-infrastructure`

## Load
- `09-PHASE2-RULES.md`
- `04-ARCHITECTURE.md` (Phase 1) §4.8
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.1, §5.2, §5.3 (CORS + cookies — needed by W01)

## Goal
Take the API from a laptop to a real deployment: managed Postgres, object storage, Redis, TLS,
secrets, migrations in CI, backups you have actually restored.

## Deliverables
- `apps/api/Dockerfile` (multi-stage, non-root, small)
- `docker-compose.prod.yml` for local reproduction
- IaC or a documented runbook (`docs/DEPLOY.md`) for the chosen host
- CI deploy workflow: build → migrate → deploy → health check → rollback on failure
- **the cookie + CORS endpoints from `05-BACKEND-CHANGES-FOR-WEB.md` §5.1–5.3** (W01 is blocked
  on these)
- `docs/BACKUP-RESTORE.md` with a timed, successful restore
- env schema updated: `COOKIE_DOMAIN`, `COOKIE_SECURE`, `CSRF_SECRET`, `TRUST_PROXY`
- uptime monitor config

## Requirements
- Postgres: managed, 7-day PITR, daily snapshot, connection pooling (pgbouncer or the
  provider's pooler). Prisma `connection_limit` set appropriately.
- Storage: S3-compatible bucket + CDN; private by default, signed URLs only; lifecycle rule
  deleting orphans after 30 days.
- Redis: managed, used for BullMQ and rate limits; TLS; maxmemory policy `noeviction` for queues.
- TLS: valid cert on `api.samyukt.com`, HTTP→HTTPS redirect, HSTS 1 year.
- Secrets: injected by the platform's secret store. `.env` never on a server. `config` module
  fails fast on a missing key.
- Migrations: `prisma migrate deploy` runs in CI **before** the new container takes traffic.
  Never `db push` in production.
- Health: `/health/ready` checks DB + storage + queue; the deploy gate polls it for 60 s.
- Rollback: keep the previous image; a failed health check auto-reverts.
- `trust proxy` enabled so rate limits see real IPs.

## Do not
- Do not run the database in a container on the same host as the API in production.
- Do not commit secrets, connection strings, or a `.env` file.
- Do not enable `synchronize`/`db push` anywhere.
- Do not skip the restore test — an untested backup is not a backup.

## Acceptance checks
- [ ] `https://api.samyukt.com/api/v1/health/ready` returns all-up from a clean deploy.
- [ ] `curl -i -X POST .../auth/web/login` sets both cookies with `Secure; HttpOnly; SameSite=Lax`.
- [ ] A cross-origin request from `http://evil.example` is rejected by CORS.
- [ ] Killing the DB makes `/health/ready` fail within 10 s and the monitor alerts.
- [ ] A restore from the latest snapshot into a scratch database succeeds; time it and record it.
- [ ] A rolling deploy with a failing health check auto-rolls back (simulate it).
- [ ] `grep -r "localhost:5460" apps/` returns nothing in the production config path.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
