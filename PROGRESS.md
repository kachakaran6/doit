# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 1 — Backend core
- **Last completed prompt:** P03 (green)
- **Next prompt:** P04 — Tasks Core
- **Branch in flight:** `feat/p03-workspaces-roles`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Play Store eligible; `samyukt.doit.app` also confirmed valid)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P03 | Completed & verified | Multi-tenant workspaces, projects with unique 2-5 char keys, memberships with invite token flows, `WorkspaceMemberGuard` resolving workspace context from route params and enforcing strict OWNER > ADMIN > TESTER > VIEWER role hierarchy |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Android package name set to `com.samyukt.doit` | Standard reverse-DNS Play Store convention |
| 2026-10-30 | Turborepo + pnpm hoisted node-linker | exFAT filesystem compatibility without directory symlinks |
| 2026-10-30 | WorkspaceMemberGuard route resolution | Inspects `:workspaceId`, `:projectId`, or resource `:id` dynamically to prevent client-supplied body tampering |
| 2026-10-30 | Owner role immutable and non-removable | Protects workspace ownership integrity against rogue admins |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| `infra/realtime/realtime.gateway.ts` | Socket.io shell logger | P16 realtime lands |
| `apps/mobile/App.tsx` | Placeholder PingSchema verification screen | P10 navigation lands |

## Backlog discovered (do not build without asking)

- [ ] Automatic Play Store deployment pipeline
- [ ] AWS S3 / Cloudflare R2 production storage driver
- [ ] Email provider integration replacing console transport for invites

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
| G1 (in progress) | green so far | 2026-10-30 | P01, P02 & P03 complete; 22 unit tests passing across 9 suites; 19 Swagger endpoints registered |
