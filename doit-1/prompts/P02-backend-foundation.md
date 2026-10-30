# P02 — Backend Foundation (Backend)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `02`, `03`, `04` (Auth, Health), `07`, **`10` (sections 1–7)**.

## Task
1. Nest bootstrap: config module with env validation, pino logging, helmet, CORS from env, global ValidationPipe, global exception filter with the standard error shape, throttler, Swagger at `/docs`, `/api/v1` prefix, `trust proxy`.
2. Prisma schema for ALL entities in `docs/04` + initial migration + seed script (demo workspace, admin user, sample project, labels).
3. Modules: `health`, `users`, `auth` (argon2, access JWT, rotating hashed refresh tokens, `sessions` table, reuse detection, logout, logout-all, list/revoke sessions), `workspaces` (multi-workspace CRUD, members, invitations, ownership transfer, leave), `policy` (permission matrix, `PolicyService`, `WorkspaceGuard` using `X-Workspace-Id`, `PolicyGuard` + `@Can()`), `audit`. `JwtAuthGuard` global with `@Public()`, session-validated access tokens, `@CurrentUser()`. Also: change/forgot/reset password, account lockout, password policy.
4. Docker: `docker/api.Dockerfile` (multi-stage, non-root), `docker-compose.yml` (api, db, volumes, healthchecks), entrypoint that runs `prisma migrate deploy`.
5. e2e tests for auth flows (register → login → refresh rotation → reuse attack → logout), revoked-session rejection, lockout, reset token, invitations, last-owner protection, plus the table-driven permission matrix tests.

## Verify
`docker compose up --build` works from clean; Swagger shows auth endpoints; tests pass.

## Done when
STATUS.md updated with run commands and seeded credentials.
