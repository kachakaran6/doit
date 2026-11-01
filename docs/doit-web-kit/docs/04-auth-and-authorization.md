# 04 — Authentication & Authorization (web)

Same accounts, sessions, roles as mobile. Web differs only in **where tokens live**.

## Token model
- **Access token** (≤ 15 min): JS memory only (module variable / store). Never localStorage/sessionStorage/IndexedDB, never in URL.
- **Refresh token**: `HttpOnly; Secure; SameSite=Strict` cookie scoped to the auth path (e.g. `/api/v1/auth`), rotating, with reuse detection → session revoked.
- **Boot sequence**: app loads → `POST /auth/refresh` (cookie) → access token + user → render; failure → `/login?next=…`. Show a splash skeleton during boot.
- **Single-flight refresh**: all 401s share one refresh promise; retry the original request once.
- **Multi-tab**: `BroadcastChannel('doit-auth')` for logout/login events (optionally share the fresh access token so tabs don't all refresh).
- **Inactivity**: optional idle timeout (e.g. 8 h) → sign-out; "Remember this device" off = session cookie.

## Backend additions required for web (small, scoped; implement in W1 with tests)
1. `X-Client: web` on `/auth/login|register|refresh` → response sets the refresh cookie, body returns `accessToken` + `user` only. Mobile behavior unchanged (regression-tested).
2. `/auth/logout` clears the cookie and revokes the session; `/auth/logout-all`.
3. **CSRF**: cookie-authenticated endpoints (`/auth/refresh`, `/auth/logout`) require (a) `Origin` in the allowlist and (b) custom header `X-Requested-With: doit-web`. SameSite=Strict as defense in depth. Bearer calls aren't CSRF-prone.
4. **CORS**: strict origin allowlist; unnecessary in prod if the web container proxies `/api` same-origin. `credentials: true` only for allowlisted origins.
5. **Attachment access**: `<img>`/`<audio>` can't send Authorization headers and the refresh cookie is path-scoped. Add `GET /attachments/:id/url` → short-lived (≤ 5 min) signed URL (or authorized stream with a short-lived query token). Web uses these for display and download.
6. **WebSocket ticket**: `POST /auth/ws-ticket` → single-use, 30 s; the socket connects with the ticket.
7. Session records include `platform: web` + browser/OS; `GET /auth/sessions` marks the current session.
8. Rate limits on refresh/login per IP+account; generic error messages.

## Auth screens & flows
Login (generic lockout/rate-limit messages), Register (invite-token aware), Forgot/Reset password (generic success), Accept invite (works logged-in or new user), Change password (revokes other sessions), Sessions page (device, platform, last used, revoke, "this device"), Sign out / Sign out everywhere, Delete account (typed confirm), Session-expired page. Email verification and 2FA/passkeys: backlog (leave UI slots).
UX: show/hide password, strength hint, correct `autocomplete` attributes, Enter submits, focus first invalid field, return-URL after login (accept only same-origin paths → no open redirect).

## Authorization model (mirror of server)
- `@doit/contracts` exports the **permission matrix** (`can(role, action, resource?)`) and action names (`work_item:update`, `member:remove`…). Web imports it; **never re-implement rules locally**.
- Load `GET /me/permissions` for the current workspace at boot/switch; treat it as the authoritative UI hint (includes project-level grants); use the shared matrix for optimistic checks.
- `useCan(action, resource?)` and `<Can action=… fallback=…>`: hide when irrelevant, **disable with an explanatory tooltip** when useful ("Only admins can…").
- **Route guards** (router `beforeLoad`): authenticated → workspace membership → role/permission for admin routes → resource access. Failures: unauthenticated → `/login?next`; unauthorized → `/403`; unknown or other-workspace resource → `/404` (no existence leak).
- Workspace context comes from the URL slug; the client sets `X-Workspace-Id`. Switching workspace: clear query cache, close WS, reload permissions.
- Never trust hidden UI: every mutation handles 403 (toast + refetch permissions) and 404.
- Role changes apply immediately: realtime `membership.updated` → refetch permissions; if removed from the workspace → redirect with a notice.

## Admin surfaces (role-gated)
Members (role badges; change role/suspend/remove/transfer ownership with guardrails: can't change own role, last-owner protection, admins can't modify owners/admins), Invitations (create/revoke, role, expiry, projects, copy link/QR), Projects (visibility, members, archive), Audit log (filters), Workspace (rename, delete with typed confirm).

## Security hygiene (web)
CSP + security headers (doc 08), sanitized markdown, no `dangerouslySetInnerHTML` on raw input, external links `rel="noopener noreferrer"`, same-origin return URLs only, dependency audit in CI, no secrets in the bundle (public config only), source maps not publicly served (upload to Sentry only), log scrubbing.

## Tests (must exist)
Login/logout/refresh (expired access → silent refresh) · refresh reuse → forced logout · session revoked on mobile → web signs out · CSRF attempt without header blocked · nothing sensitive in web storage (assert) · route guards per role · IDOR via URL tampering (other workspace/project/item ids → 404) · permission-gated buttons per role · invite accept flows · password change revokes other sessions · open-redirect attempt rejected.
