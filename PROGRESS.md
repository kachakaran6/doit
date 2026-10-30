# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 2 & 3 — Mobile Design System & App Shell
- **Last completed prompt:** P08 (green) — Gate G1 PASSED
- **Next prompt:** P09 — Mobile Design System, Theme Tokens & Component Gallery
- **Branch in flight:** `feat/p08-voice-transcription`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Play Store eligible; `samyukt.doit.app` also confirmed valid)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P08 | Completed & verified | Voice transcription pipeline: multi-engine provider interface (`LocalWhisper`, `OpenAIWhisper`, `SarvamAsr`), retryable failure state keeping audio intact, 5-min duration cap (400 rejection), `prompts/structure-bug.v1.md` LLM structuring to title/severity/steps/labels, user text correction preserving verbatim `rawTranscript`, and Bruno collection committed |
| P07 | Completed & verified | Three-step resumable upload pipeline (`POST /uploads/init`, PUT, `POST /uploads/:id/complete`), MIME whitelist and kind-based size validation (413 before byte transfer), magic-byte sniffing (422 rejection on spoofing), thumbnail background job queuing, DB constraint to exactly one of `taskId`/`bugId`/`commentId`, and queued storage object deletion on task cleanup |
| P06 | Completed & verified | Free-form notes/stickies CRUD, body max 5000 validation, pinned-first sorting, fractional indexing reorder, atomic convert-to-task (`POST /stickies/:id/convert`) linking both ways, 409 duplicate conversion rejection with task ID details, and graceful sticky deletion keeping tasks intact with nullified reference |
| P05 | Completed & verified | Workspace labels CRUD, case-insensitive collision check (409 CONFLICT), one-statement cascade detachment, search operator parser (`#label`, `@assignee`, `is:bug`, `is:done`, `due:today|overdue|week`, `project:KEY`), relevance ranking (exact title > prefix > title > bug > desc > comment), and `<mark>` snippet highlighting with PostgreSQL GIN index migration |
| P04 | Completed & verified | Task lifecycle (TODO, IN_PROGRESS, BLOCKED, DONE) with 422 state-machine validation, fractional indexing midpoint reordering, idempotency cache replay, auto-incrementing per-project numbering (`SMP-42`), checklist CRUD, and ActivityLog auditing |
| P03 | Completed & verified | Multi-tenant workspaces, projects with unique 2-5 char keys, memberships with invite token flows, `WorkspaceMemberGuard` resolving workspace context from route params and enforcing strict OWNER > ADMIN > TESTER > VIEWER role hierarchy |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Android package name set to `com.samyukt.doit` | Standard reverse-DNS Play Store convention |
| 2026-10-30 | Turborepo + pnpm hoisted node-linker | exFAT filesystem compatibility without directory symlinks |
| 2026-10-30 | WorkspaceMemberGuard route resolution | Inspects `:workspaceId`, `:projectId`, or resource `:id` dynamically to prevent client-supplied body tampering |
| 2026-10-30 | Owner role immutable and non-removable | Protects workspace ownership integrity against rogue admins |
| 2026-10-30 | In-memory upload session cache + local storage raw PUT | Allows frictionless dev testing without AWS S3 credentials |
| 2026-10-30 | Structured bug suggestion with verbatim transcript description | Human-in-the-loop review avoids accidental hallucinated bug creations |

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
| G1 | pass | 2026-10-30 | All P01-P08 endpoints in §6.2-6.8 implemented and registered in Swagger; 65 unit tests passing across 17 test suites; idempotent seed tested; Bruno collection committed; no Prisma model leaked |
