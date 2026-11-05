# V8 — Regression & delivery
## Before you start
Read `WEB_PREMIUM_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/04`. End with the contact sheet, `report.json` summary, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04` §2, original web kit `07`/`08`.
## Task
Run lint, typecheck, unit, token lint, Playwright e2e (auth, role matrix, CRUD, board DnD, triage, admin), axe, Lighthouse CI, security-header checks on the built container. Verify cookie/CSRF flows and realtime unchanged. Deploy to staging then production via Coolify; smoke test. Update `STATUS.md`; write `docs/UI_FINAL_REPORT.md` (before/after grids, rubric table, perf, ADRs, remaining issues, UNVERIFIED such as Safari/Firefox).
