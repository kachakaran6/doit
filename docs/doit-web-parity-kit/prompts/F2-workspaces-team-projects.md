# F2 — Workspaces, Team, Invitations, Projects
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02` (Workspaces, Members, Invitations, Projects), `04` §B–§D, `01` (C1, C2, C6).
## Task
Build against the real endpoints: workspace create/switch/join dialogs; **Projects index + New project dialog + project switcher + project settings (general, visibility, members & roles, archive/unarchive, delete with typed confirm)**; **Team** page (Members table with role change/suspend/remove + guardrails, Invitations tab with Invite people dialog, link/code/QR, revoke/resend, Roles matrix tab); public accept-invite page polish. Permission gating for all four roles; handle 403/404/409 gracefully.
## Verify
Playwright: create project → set private → add member → archive; invite second user (second context) → accept → role limits; remove member → access lost; last-owner protection. Update coverage report.
