# F0 — Setup, inventory & identity fix
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `01`, `02`, `05`.
## Task
1. Run the API and fetch its OpenAPI JSON. Tune `scripts/api_coverage.mjs` to the repo's client style (generated client? `api.ts` helpers?) until it reports sensible results; copy `templates/api-waivers.json` to `docs/api-waivers.json`. Generate the **baseline** `docs/API_COVERAGE.md` (web) and `docs/API_COVERAGE_MOBILE.md` (mobile) and summarize: coverage % per tag, top 10 missing capabilities by user value.
2. **Identity bug (A1)**: reproduce "Account / U" (web) and "Active User" (mobile). Inspect `GET /me` response vs client mapping; check registration stores the name; fix at the root (API/contracts/client), then show real name, email, role in the sidebar footer and user menu. Add API + Playwright tests (name appears after login, after refresh, after profile edit).
3. Seed realistic staging data (projects, members, invitations, labels, 30+ items, bugs with screenshots/audio, notifications, audit entries). Verify bugs vs tasks type separation (A4).
4. Adapt `capture.spec.ts` (routes, selectors); run it for the baseline (`shots/before`) including the new layout/identity audits; write `docs/UI_BASELINE_R2.md`.
## Exit
Coverage baseline committed; identity fixed with tests; baseline audit report.
