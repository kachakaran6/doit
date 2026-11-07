# F7 — Polish loop & regression
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `05`, premium kit `04` (rubric, anti-patterns).
## Task
Full capture (3 viewports × dark/light × Blue/Violet); score every page; fix any < 43/50 or dim < 4 (max 6 iterations); verify container widths consistent, no dead strips, no placeholder identity, no raw enums; axe clean; Lighthouse; run the full e2e + security header + cookie/CSRF checks; deploy to staging, then production; smoke test; update `STATUS.md`; write `docs/UI_FINAL_REPORT_R2.md` (coverage 100%, before/after grids, rubric table, test report, UNVERIFIED such as Safari/Firefox).
