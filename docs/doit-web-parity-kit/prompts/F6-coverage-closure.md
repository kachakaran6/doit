# F6 — Coverage closure loop
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02`, `05`.
## Task
Re-run `api_coverage.mjs` for web. For every ❌: build the UI to the standards (or propose a waiver with reason). Loop until the matrix is 100% ✅/waived. Verify each ✅ with a Playwright test (maintain `docs/api-to-test-map.md` listing operation → test file). Run mobile coverage and list parity gaps (what exists on web but not mobile and vice versa) in `docs/PARITY_GAPS.md`.
## GATE 3
Final `docs/API_COVERAGE.md`, waiver list for the owner's approval, e2e report, rubric table for all pages. Wait for approval.
