# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 1 — Backend core
- **Last completed prompt:** P03 (green, gate not yet evaluated)
- **Next prompt:** P04 — Tasks Core
- **Branch in flight:** —
- **Blocked on:** nothing

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| — | — | — |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Used `decimal(20,10)` for `order` | matches ADR-009, no float drift |
| 2026-10-30 | Named the capture sheet `CaptureSheet` in `components/patterns` | shared by bubble, FAB, shake |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| `features/capture/CaptureSheet.tsx` | voice button is a no-op | P08 lands |
| `lib/realtime.ts` | returns a dummy socket | P16 |

## Backlog discovered (do not build without asking)

- [ ] Bulk-select tasks in list view
- [ ] Saved filter views
- [ ] CSV export of bugs

## Known issues

| # | Issue | Severity | Owner |
|---|---|---|---|
| 1 | Navbar flickers on fast scroll in Board view | P2 | — |

## Environment notes

- Node 20.11, pnpm 9, RN 0.7x, Expo SDK current, Postgres 16 local via Docker.
- Android emulator API 34 used for smoke tests; physical Pixel 6a for capture tests.

## Gate log

| Gate | Result | Date | Evidence |
|---|---|---|---|
| G0 | pass | | CI run link |
| G1 | | | |
