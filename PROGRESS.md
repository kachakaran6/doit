# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase:** 0 — Foundations
- **Last completed prompt:** P00 (in progress)
- **Next prompt:** P01 — Backend Foundation
- **Branch in flight:** `feat/p00-bootstrap`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Play Store eligible; alternative `samyukt.doit.app` also confirmed valid)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P00 | Monorepo scaffolding | Setting up pnpm workspace, turbo, contracts, tokens, config, api, mobile, ci |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| 2026-10-30 | Android package name set to `com.samyukt.doit` | User requested `com.samyukt.doit` or `samyukt.doit.app`; `com.samyukt.doit` is the standard reverse-DNS convention for Play Store |
| 2026-10-30 | Turborepo + pnpm workspaces | Standard monorepo tooling adhering to kit architecture specification |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| `apps/mobile/App.tsx` | Placeholder PingSchema verification screen | P10 navigation lands |
| `packages/design-tokens/src/tokens.ts` | Placeholder tokens | P09 design system lands |

## Backlog discovered (do not build without asking)

- [ ] Automatic Play Store deployment pipeline

## Known issues

| # | Issue | Severity | Owner |
|---|---|---|---|
| — | None | — | — |

## Environment notes

- Node 24.13.0, pnpm 11.9.0, TypeScript 5.8+, Turbo 2.4+.
- Target Android Package Name: `com.samyukt.doit`.

## Gate log

| Gate | Result | Date | Evidence |
|---|---|---|---|
| G0 | in progress | 2026-10-30 | Initial bootstrap |

