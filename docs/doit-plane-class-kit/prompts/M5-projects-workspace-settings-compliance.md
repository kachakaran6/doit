# M5 — Projects, workspace, team, account settings, compliance (T1 close-out)
## Before you start
Read `PLANE_CLASS_MASTER_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/06`. Update `docs/SCREEN_MATRIX.md`. End with: before|after sheets, audit outputs (dedupe/ui_audit/contrast/token lint), rubric table, tests, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `03` (S49–S77), `05` (Settings hub, Project settings), `07`.
## Task
Projects list/create/settings/members/labels/archive/delete; workspace create/join/settings/audit/integrations; Team (roles, invites, suspend/remove); **Settings hub restructure** (Log out in Account group), Profile edit, Appearance (theme cards, accent swatches with check, density, haptics, reduce effects), Notification prefs, Security (password, sessions, devices), **Data & privacy (export, delete account)**, Help, About with wordmark/diagnostics, Legal. Fix Project context editor, AI provider input, Quick capture prefs. **Resolve the AccessibilityService risk**: implement build flavors (`play` vs `direct`) or remove; update permission wizard, consent screens, privacy policy text.
## Verify
Role matrix flows; export/delete tests; flavor builds install and the Play flavor has no AccessibilityService in its manifest; all T1 screens verified (≥ 47/55) in SCREEN_MATRIX.
