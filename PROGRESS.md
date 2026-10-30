# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 1 — Backend core
- **Last completed prompt:** P01 (green)
- **Next prompt:** P02 — Auth JWT & Sessions
- **Branch in flight:** `feat/p01-backend-foundation`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Play Store eligible; `samyukt.doit.app` also confirmed valid)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P01 | Completed & verified | Prisma full schema, seed script, AllExceptionsFilter, ResponseInterceptor, LoggingInterceptor, ZodValidationPipe, CursorPage, StorageService, QueueService, RealtimeGateway, Swagger at `/docs`, readiness check at `/health/ready` |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Android package name set to `com.samyukt.doit` | User requested `com.samyukt.doit` or `samyukt.doit.app`; both are eligible on Google Play Store, `com.samyukt.doit` chosen as standard reverse-DNS |
| 2026-10-30 | Base64URL encoding for `CursorPage` | Safe for URL query parameters without escaping issues |
| 2026-10-30 | Local-disk StorageService writes under `.storage/` | Serves via `/static` endpoint for local development without requiring immediate AWS credentials |
| 2026-10-30 | In-memory QueueService fallback | Allows running and testing without requiring a live Redis daemon |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| `infra/realtime/realtime.gateway.ts` | Socket.io shell logger | P16 realtime lands |
| `apps/mobile/App.tsx` | Placeholder PingSchema verification screen | P10 navigation lands |

## Backlog discovered (do not build without asking)

- [ ] Automatic Play Store deployment pipeline
- [ ] AWS S3 / Cloudflare R2 production storage driver

## Known issues

| # | Issue | Severity | Owner |
|---|---|---|---|
| — | None | — | — |

## Environment notes

- Node 24.13.0, pnpm 11.9.0, TypeScript 5.8+, Turbo 2.4+, Prisma 5.22.
- Target Android Package Name: `com.samyukt.doit`.

## Gate log

| Gate | Result | Date | Evidence |
|---|---|---|---|
| G0 | pass | 2026-10-30 | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all green; GET `/api/v1/health` returned 200 `{ status: "ok", version: "0.1.0" }` |
| G1 (in progress) | green so far | 2026-10-30 | P01 backend foundation tests passing, Swagger spec live at `/docs`, `/health/ready` reporting component states |
