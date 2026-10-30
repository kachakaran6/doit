# 14 — Web Auth, Authorization & Security

## Principle
Web and mobile share accounts, sessions, roles and permissions. Web differs only in **how tokens are held**.

## Token handling on web
- **Access token**: short-lived (≤15 min), kept **in memory only**. Never localStorage/sessionStorage/IndexedDB.
- **Refresh token**: `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` cookie (use `__Host-`/`__Secure-` prefix where the path rules allow). Rotation + reuse detection as on mobile.
- On page load the app silently calls `POST /auth/refresh` (cookie) to obtain an access token, then boots. Single in-flight refresh (mutex) to avoid rotation races across requests.
- Multi-tab: `BroadcastChannel` to share logout and (optionally) the new access token.

## API changes required (Backend, in W1)
1. `POST /auth/login|register|refresh` accept `X-Client: web` → set refresh cookie, return only `accessToken` (+user) in body; mobile behavior unchanged.
2. `POST /auth/logout` clears cookie and revokes session.
3. **CSRF**: because the refresh cookie is sent automatically, protect cookie-authenticated endpoints: require `Origin`/`Referer` match allowlist AND a custom header (`X-Requested-With: doit-web`) on `/auth/refresh` and `/auth/logout`; SameSite=Strict as defense in depth. Bearer-authenticated API calls are not CSRF-prone.
4. **CORS**: explicit origin allowlist (no `*` with credentials), `credentials: true` only for web origins. Prefer same-origin via the web container's `/api` proxy so CORS isn't needed in production.
5. **WebSocket auth**: `POST /auth/ws-ticket` → short-lived (30 s), single-use ticket; WS connects with the ticket, never with the long-lived token in the URL.
6. Session records show `platform: web` + browser/OS; revocable from either client.
7. Rate-limit and lockout remain; add per-IP limits on refresh.

## Security headers (web container)
`Content-Security-Policy` (default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' only if unavoidable; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' wss:; frame-ancestors 'none'; base-uri 'none'; object-src 'none'), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (microphone only if web voice is added), `Cross-Origin-Opener-Policy: same-origin`.

## XSS hygiene
- Render markdown with a sanitizer (no raw HTML), uploads served with `Content-Disposition` and correct `Content-Type`, `X-Content-Type-Options: nosniff`.
- No `dangerouslySetInnerHTML` without sanitized input.
- Dependency audit in CI.

## Authorization on web
- Source of truth = server. Client mirrors the **shared permission matrix** from `@doit/contracts` and loads `GET /me/permissions`.
- Route guards (`beforeLoad`): unauthenticated → login with return URL; unauthorized → 403 page (not blank).
- `useCan(action, resource)` hides/disables controls; every mutation still handles 403 gracefully (toast + refetch permissions).
- Workspace context: `X-Workspace-Id` header set by the API client; switching workspace clears the query cache and WS subscriptions.

## Auth screens
Login, register (with invite token support), forgot/reset password (generic responses), change password, session list with "this device" marker, "sign out everywhere". Show lockout messages generically.

## Tests required (Playwright + API)
Login/refresh/logout flows; expired access token → silent refresh; refresh-token reuse → forced logout; revoked session from mobile logs out web; CSRF attempt without header rejected; role matrix per page (owner/admin/member/guest); cross-workspace IDOR attempts via URL tampering; CSP header present; no token in storage (assert).
