# F5 — Account & workspace admin panels
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04` §A, §D, §F, §G; `02` (Auth, Profile, Notifications, Audit, Integrations, System).
## Task
Account area (Profile, Preferences, Notifications, Security with sessions + change password, Devices, Data & privacy with export/delete) and Workspace settings (General, Labels, Integrations incl. SMTP + test email, Audit log with filters/export, About with system status admin-only, Danger zone: transfer ownership/leave/delete). Sticky UnsavedBar, sub-nav layout, role gating, onboarding checklist on Overview for new workspaces.
## Verify
Playwright role matrix across every settings page; account deletion blocked for sole owner with guidance; export job completes; SMTP test email result shown.
