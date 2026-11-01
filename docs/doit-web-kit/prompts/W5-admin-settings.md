# W5 — Admin & settings
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `04` (Authorization, Admin surfaces), `06` (Admin, Settings).

## Task
Members (role badges; change role/suspend/remove/transfer ownership with all guardrails) · Invitations (create/revoke/copy link/QR, role/expiry/projects) · Project members & roles · Audit log with filters · Workspace settings (rename/slug/delete typed confirm) · Settings: Appearance (mode, 5 accents, density), Security (change password, sessions revoke, sign out everywhere), Notifications prefs, Data (export, delete account typed confirm). Everything gated by `<Can>` + route guards; disabled states explain why.

## Verify
Playwright: second browser context joins via invite; role limits per action; removed member loses access immediately (realtime + on next request); last-owner protection; changing password revokes other sessions; audit entries appear.
