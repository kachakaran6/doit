# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 1 — Backend core
- **Last completed prompt:** P02 (green)
- **Next prompt:** P03 — Workspaces, Projects, Memberships & Roles
- **Branch in flight:** `feat/p02-auth`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Play Store eligible; `samyukt.doit.app` also confirmed valid)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P02 | Completed & verified | JWT auth with 15-min access tokens, Argon2id password hashing, 32-byte hex refresh tokens with family rotation replay defense, device sessions, `@Public()`, `@CurrentUser()`, `@Roles()`, `JwtAuthGuard`, `RolesGuard`, user profile `/auth/me` |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Android package name set to `com.samyukt.doit` | Standard reverse-DNS Play Store convention |
| 2026-10-30 | Turborepo + pnpm hoisted node-linker | exFAT filesystem compatibility without directory symlinks |
| 2026-10-30 | Refresh token format `<sessionId>:<rawToken>` | Enables O(1) indexed session lookup before argon2 hash verification |
| 2026-10-30 | Replay defense: family revocation | When an already revoked or reused refresh token is presented, all sessions in `familyId` are marked revoked |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| `infra/realtime/realtime.gateway.ts` | Socket.io shell logger | P16 realtime lands |
| `apps/mobile/App.tsx` | Placeholder PingSchema verification screen | P10 navigation lands |

## Backlog discovered (do not build without asking)

- [ ] Automatic Play Store deployment pipeline
- [ ] AWS S3 / Cloudflare R2 production storage driver
- [ ] Production email provider integration (SendGrid / Postmark) replacing console transport

## Known issues

| # | Issue | Severity | Owner |
|---|---|---|---|
| — | None | — | — |

## Environment notes

- Node 24.13.0, pnpm 11.9.0, TypeScript 5.8+, Turbo 2.4+, Prisma 5.22, Argon2id.
- Target Android Package Name: `com.samyukt.doit`.

## Gate log

| Gate | Result | Date | Evidence |
|---|---|---|---|
| G0 | pass | 2026-10-30 | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all green; GET `/api/v1/health` returned 200 `{ status: "ok", version: "0.1.0" }` |
| G1 (in progress) | green so far | 2026-10-30 | P01 & P02 complete; 15 unit tests passing across 6 suites; 11 Swagger endpoints registered |
