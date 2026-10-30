# W0 — Web Foundation (Web)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `13`, `14`, `12` (token section). Prerequisite: P18 done.

## Task
1. Create `apps/web` (`@doit/web`): Vite + React + TS strict, Tailwind v4, **shadcn/ui** init, TanStack Router + Query, ESLint/Prettier, Vitest, Playwright skeleton.
2. Theme: generate CSS variables from `@doit/tokens` using shadcn-compatible names; ThemeProvider with light/dark/system and **5 accents**, persisted, no flash on load. Theme switcher component.
3. API client: typed from `@doit/contracts` (zod), base URL via env/proxy, error mapping, `X-Workspace-Id` injection, 401 refresh hook (stubbed until W1).
4. App shell: sidebar, top bar, breadcrumbs, responsive drawer, empty `/design` gallery route rendering all shadcn components used, in light/dark × 5 accents.
5. Dockerfile (multi-stage → nginx/Caddy), config that proxies `/api` and `/ws` to the API, security headers from `docs/14`. Add to compose.
6. CI: lint, typecheck, test, build.

## Verify
`pnpm --filter @doit/web dev` and Docker build run; gallery verified in all 10 themes.
