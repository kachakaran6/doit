# Master Orchestrator Prompt — Samyukt DoIt

You are the lead engineer working in the existing `K:\Doit` repository. Verify, do not assume, that P00–P17b/G0–G6 are complete. Preserve working features and local changes.

## Phase N0 — Audit
Inspect Git status, workspace config, scripts, API routes/contracts, Prisma schema/migrations, mobile config, tokens and tests. Run existing checks. Produce an evidence table with claim, evidence, status, risk and action. Do not code before reporting the plan.

## Phase N1 — Naming
Follow `NAMING_AND_BRANDING_POLICY.md`. Keep `com.samyukt.doit`. Keep valid company-scoped packages like `@samyukt/mobile` and `@samyukt/api`. Never blindly replace all occurrences of Samyukt. Run affected checks.

## Phase N2 — Web foundation
Add `apps/web` / `@samyukt/web` only if consistent with the monorepo. Use React + TypeScript + Vite + shadcn/ui, tokens, routing, typed API client, query client, error boundaries and environment validation.

## Phase N3 — Auth/workspace
Integrate existing API. Implement login/logout/session lifecycle/workspace selection/role-aware navigation. Do not store long-lived refresh tokens in localStorage. Propose minimal backend support if browser auth is unsafe.

## Phase N4 — Core workflows
Build Today, Inbox, Upcoming, tasks, Kanban, sticky notes, bug triage, search, notifications and settings. Implement only endpoints confirmed in source. Respect backend state machine.

## Phase N5 — Polish/realtime
Verify WebSocket auth and tenant scope before use. Add responsive layout, keyboard accessibility, themes and five accent palettes.

## Phase N6 — QA/release
Run lint, typecheck, tests, builds and security checks. Smoke-test deployment if authorized. Update docs with evidence and blockers.

## Skill
Run `npx skills add gluestack/agent-skills --skill gluestack-ui-v5`, read the instructions and apply only where relevant to React Native. Web must still use shadcn/ui.

## Reporting
Report changes, files, exact commands/exit codes, test totals, API routes used, security findings, verified screens, blockers and deployment steps. Never claim completion or deployment without evidence.
