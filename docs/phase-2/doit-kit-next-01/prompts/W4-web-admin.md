# W4 — Admin, Roles, Audit, Settings (Web)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `13` pages 10–11, original `10` (permission matrix). Prerequisite: P21 complete.

## Task
Members list (role badges, change role, suspend, remove, leave, transfer ownership) · invitations (create with role/expiry/projects, copy link, revoke) · project members & project roles · audit log viewer with filters · settings (profile, appearance with 5 accents, password, sessions, leave workspace, delete account/export data). All controls gated by `useCan`; verify the server rejects tampered requests.

## Verify
Playwright role matrix (owner/admin/member/guest) per page and action; IDOR attempts via URL tampering return 404/403; last-owner protection visible in UI.

## GATE G11
Demo + role matrix results; wait for human OK.
