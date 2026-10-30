# Authentication, Authorization & Security

## Required behavior
- Inspect actual auth endpoints, token claims, expiry, refresh rotation and revocation.
- Support login/logout/session restoration using browser-appropriate storage.
- Do not store long-lived credentials in localStorage/sessionStorage.
- Clear user/workspace cache on logout or account switch.
- Handle expired/revoked sessions safely.
- Frontend route guards are not security boundaries.
- Backend validates workspace membership, role and resource scope for every request.
- Never trust browser-supplied workspace, role, owner or assignee without server validation.

## Negative tests
- Anonymous access to protected routes.
- User in workspace A attempts to access/update/delete workspace B data.
- Tester attempts owner/admin-only actions.
- Invalid task state transition.
- Expired, revoked, malformed or reused refresh token.
- Upload with spoofed MIME, invalid magic bytes, oversized file or unsupported extension.
- Direct attachment URL access without permission.
- Workspace switch with stale cached data.
- WebSocket auth failure or cross-workspace subscription.

## Controls
HTTPS; strict CORS allowlist; secure cookies and CSRF defense if cookie auth is used; rate limits; server-side input validation; no unsafe HTML rendering; private uploads and expiring signed URLs; log redaction; `.env.example` placeholders only; dependency audit. Never log passwords, tokens, audio payloads or private attachment URLs.
