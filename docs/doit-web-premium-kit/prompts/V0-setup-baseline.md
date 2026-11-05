# V0 — Setup & baseline
## Before you start
Read `WEB_PREMIUM_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/04`. End with the contact sheet, `report.json` summary, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04`, `05`.
## Task
1. Install the skills in `docs/05` (read each SKILL.md; vet audit badges); record ADRs.
2. Seed **realistic demo data** in staging: 25+ tasks across statuses/priorities/assignees/labels/due dates, 10 bugs with real screenshots, voice notes, device meta, 3 members, 6 stickies. Without it the design can't be judged.
3. Set up Playwright + axe; adapt `scripts/capture.spec.ts` (routes, login selectors, theme/accent switching) and run it to `shots/before/`. Fix script assumptions; run `dom-audit.js`.
4. Write `docs/UI_BASELINE.md`: audit findings summarized by code, rubric score per page (expect ~20–28/50), and what each screenshot is missing vs the page specs. Create `docs/UI_LOOP_LOG.md`.
