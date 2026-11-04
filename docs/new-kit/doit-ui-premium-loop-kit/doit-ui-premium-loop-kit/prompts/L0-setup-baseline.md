# L0 — Setup & baseline
## Before you start
Read `PREMIUM_UI_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work inside the loop from `docs/04` (capture → audit → critique → score → plan → fix → verify → recapture). End with before/after contact sheet, audit output, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04`, `05`.

## Task
1. Install the skills in `docs/05` and read each SKILL.md; record versions/ADRs.
2. Make sure a device/emulator runs a dev/preview build (not Expo Go) with seeded realistic data (8–12 tasks with priorities/due dates/labels, 5 bugs with screenshots, 4 stickies) — realistic data is required to judge the design.
3. Add deep links or Maestro flows so `scripts/capture_screens.sh` can capture every screen; run it for dark and light into `shots/before/`.
4. Run `ui_audit.py` on every screen; write `docs/UI_BASELINE.md` with the audit results and a rubric score per screen (expect ~20–28/50).
5. Create `docs/UI_LOOP_LOG.md`. Commit the baseline.
