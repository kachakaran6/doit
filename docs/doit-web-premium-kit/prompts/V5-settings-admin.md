# V5 — Settings & admin
## Before you start
Read `WEB_PREMIUM_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/04`. End with the contact sheet, `report.json` summary, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `03` (Settings), `01` (A7, E5, E6), `kit-web` auth/authorization docs.
## Task
Nested Settings layout with sub-nav (Profile, Appearance, Notifications, Security, Sessions, Workspace, Members, Invitations, Audit log, Data & privacy), 720px content, sentence-case labels, helper text, inline validation, UnsavedBar. Appearance: 3 theme preview cards, 5 accent swatches with check + ring + live preview, density toggle. Security/Sessions (this device marker, revoke, sign out everywhere), Members/Invitations/Audit tables with role badges and guarded actions (`<Can>`; disabled states explain why). Data & privacy: export, delete account (typed confirm).
## Verify
Playwright role matrix still passes; permission-gated UI correct for owner/admin/member/guest.
