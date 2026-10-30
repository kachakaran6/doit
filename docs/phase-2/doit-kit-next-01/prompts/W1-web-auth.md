# W1 — Web Auth + Backend Cookie Mode (Backend + Web)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `14` (all).

## Task
**Backend**: implement `X-Client: web` cookie mode, CSRF/origin checks, strict CORS allowlist, `POST /auth/ws-ticket`, session platform info, per-IP refresh limit. Mobile behavior must remain unchanged (regression tests).
**Web**: login, register (invite aware), forgot/reset password, accept-invite, silent refresh on load with mutex, in-memory access token, BroadcastChannel logout sync, route guards with return URL, 403/404 pages, workspace switcher + create/join, `/me/permissions` + `useCan`, change password, sessions page.

## Verify
Playwright: login/logout, expired token → silent refresh, refresh reuse → logout, mobile-revoked session logs web out, CSRF attempt blocked, assert nothing sensitive in localStorage/sessionStorage.
