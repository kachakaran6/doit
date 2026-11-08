# M0 — Baseline & capture harness
## Before you start
Read `PLANE_CLASS_MASTER_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/06`. Update `docs/SCREEN_MATRIX.md`. End with: before|after sheets, audit outputs (dedupe/ui_audit/contrast/token lint), rubric table, tests, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `01`, `03`, `06`.
## Task
1. Seed realistic data (≥3 projects, 6 members, 40 work items with varied states/priorities/dates/labels/assignees, 10 bugs with real screenshots/audio/telemetry, notifications, stickies).
2. Create Maestro flows for **every existing screen** and the **U (unverified)** ones using `templates/maestro/*` (add stable accessibility ids/labels to the app where needed, e.g. `create-button`). Each flow: navigate → assertVisible unique text → screenshot (dark and light).
3. Run flows into `shots/before`; run `python3 scripts/dedupe_check.py shots/before` → must pass. Investigate and report: does the Quick-capture mode switch (Bug/Voice/Sticky) actually work? Is severity defaulted on bugs? Why do bugs appear in Tasks?
4. Generate `docs/SCREEN_MATRIX.md` from `docs/03`; fill current status/screenshots; score existing screens with the /55 rubric; write `docs/BASELINE_REPORT.md`.
5. Run `api_coverage.mjs` for mobile and web; commit baselines.
