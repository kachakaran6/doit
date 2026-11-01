# W0 — Foundation & shared shadcn design system
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `02`, `03`, `templates/`.

## Task
1. Confirm backend health: run the API + DB, hit `/health`, list available endpoints vs `docs/05`; write `docs/WEB_API_GAPS.md`.
2. Create `packages/ui-web` (`@doit/ui-web`) and `apps/web` (`@doit/web`): Vite + React + TS strict, Tailwind v4, shadcn set up per the **current official monorepo guide** (use `templates/components.json`, `templates/theme.css` as starting points).
3. Generate `theme.css` from `@doit/tokens` (light/dark × 5 accents; brand accent → `--primary`). Pre-paint inline script for mode/accent (no flash). ThemeProvider + ThemeToggle + AccentPicker.
4. Install all shadcn components listed in doc 03 into `packages/ui-web`; build the composites incrementally as needed (at least AppShell, PageHeader, EmptyState, ErrorState, PageSkeleton, ConfirmDialog, ThemeToggle, AccentPicker now).
5. `/design` gallery route (dev only) rendering every component/state in 10 themes.
6. Lint rule/script forbidding hex/rgb/arbitrary px/non-semantic Tailwind colors in `apps/web`.
7. Scripts: `dev:web`, `build:web`, `lint`, `typecheck`, `test`, `e2e`. CI skeleton.

## Verify
Gallery screenshots in all 10 themes; contrast check script passes; lint/typecheck/build pass.
