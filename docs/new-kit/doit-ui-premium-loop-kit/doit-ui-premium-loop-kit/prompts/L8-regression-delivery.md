# L8 — Regression & delivery
## Before you start
Read `PREMIUM_UI_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work inside the loop from `docs/04` (capture → audit → critique → score → plan → fix → verify → recapture). End with before/after contact sheet, audit output, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04` §4.

## Task
Run `pnpm lint && pnpm typecheck && pnpm test && node scripts/check-tokens.mjs`, Maestro flows, overlay manual script on a real device, widgets, offline queue, auth/role flows. Verify accessibility (TalkBack labels, 48dp targets, contrast, reduce motion/transparency). Update `STATUS.md`, write `docs/UI_FINAL_REPORT.md` (before/after grids, rubric table, perf numbers, ADRs, remaining issues, UNVERIFIED items). Rebuild preview APK for testers.
