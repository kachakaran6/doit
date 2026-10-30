# P01 — Contract & Scaffold (Architect)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `02`, `03`, `04`.

## Task
1. Create the monorepo exactly as in `docs/02`: pnpm workspaces, root eslint/prettier/tsconfig base, `apps/api` (Nest), `apps/mobile` (Expo with dev client, expo-router, TS strict), `packages/shared`.
2. In `packages/shared`: all enums from `docs/04`, zod schemas + inferred types for every request/response, the pure **quick-add parser** with unit tests (jest/vitest), and a build setup consumable by both apps.
3. Create `apps/mobile` skeleton folders from `docs/02` (empty `index.ts` where needed) and root scripts: `dev:api`, `dev:mobile`, `lint`, `typecheck`, `test`, `gen:feature` (stub).
4. Add `.env.example` files, `.gitignore`, `.editorconfig`, root `README.md` skeleton.

## Verify
`pnpm install && pnpm lint && pnpm typecheck && pnpm test` all pass. API boots (empty), mobile bundles.

## GATE G1
Update STATUS.md, list demo commands, wait for human OK.
