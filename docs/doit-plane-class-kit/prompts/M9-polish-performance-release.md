# M9 — Polish, performance, accessibility, production gates
## Before you start
Read `PLANE_CLASS_MASTER_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/06`. Update `docs/SCREEN_MATRIX.md`. End with: before|after sheets, audit outputs (dedupe/ui_audit/contrast/token lint), rubric table, tests, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `06`, `04`, plus `kit-prod` and `kit-release`.
## Task
Full recapture of all screens (dark/light, Blue+Violet, 100%/200% font, 2 phone sizes); fix anything < 47/55 or dim < 4 (max 6 iterations); dedupe/ui_audit/axe clean; 58+ fps on a mid-range device; Lite tier verified; TalkBack pass; run the production-readiness phases (security, reliability, observability, privacy, store compliance); build preview APK + Play-flavor AAB; update `STATUS.md`; write `docs/FINAL_REPORT.md` (SCREEN_MATRIX 100% verified, before|after grids, rubric table, coverage, performance, compliance, UNVERIFIED).
## GATE G4
Final evidence pack; GO/NO-GO per the production kit scorecard. Wait for approval.
