# P21 — Access-Control & Security Audit (Backend + QA)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: original kit `10-auth-workspaces-access-control.md` (authoritative), `14`.

## Task
1. Compare the implemented model against `docs/10`: roles (owner/admin/member/guest vs current OWNER/TESTER), multi-workspace, `X-Workspace-Id`, private projects + project members, invitations, password reset/change, lockout, session-validated access tokens, audit log, `/me/permissions`, last-owner protection.
2. Write `docs/ACCESS_AUDIT.md`: each requirement → implemented / partial / missing, with file references. Then implement everything missing or partial, with a DB migration that safely maps old roles (e.g. TESTER → member) and keeps seeded users working.
3. Export the permission matrix to `@doit/contracts` (needed by web `useCan`).
4. Tests: table-driven role × action, IDOR across two workspaces, revoked session rejection, refresh reuse, invite flows, upload authorization, rate limits.
5. Dependency audit; secrets scan; verify production env validation refuses weak/default secrets.
6. Add **account deletion** and **data export** endpoints (store requirement).

## Verify
All new tests pass; manual attack attempts with two accounts documented.

## GATE G8 (with P20)
Present audit + device matrix; wait for human OK.
