# W1 — API client, backend web-mode, authentication
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `04`, `05`.

## Task
**Backend (scoped, with tests; mobile regression-tested):** `X-Client: web` cookie mode, logout/logout-all cookie handling, CSRF (Origin allowlist + custom header), strict CORS allowlist, `GET /attachments/:id/url` signed URLs, `POST /auth/ws-ticket`, session platform info, per-IP refresh limits, `GET /me/permissions` (if missing).
**Web:** typed http client + zod parsing + error mapping + Idempotency-Key; in-memory access token; boot refresh; single-flight refresh; BroadcastChannel; Login, Register (invite aware), Forgot/Reset, Accept invite, Session-expired, Change password, Sessions page; safe `next` redirect.

## Verify (Playwright + API tests)
Login/logout; expired access → silent refresh; refresh reuse → forced logout; mobile-revoked session logs web out; CSRF attempt blocked; no tokens in storage; open-redirect blocked; mobile login still works.
