# 04 — Web Authentication & Authorisation

The mobile app uses bearer tokens in the Keychain. Browsers cannot be trusted with that, so the
web client gets a different, stricter transport for the same session model. The backend session
table does not change — only how the token travels.

---

## 4.1 Token strategy

| Token | Where it lives | Lifetime | Why |
|---|---|---|---|
| **Access** | JavaScript memory only (a module-level variable) | 15 min | Never in `localStorage` — one XSS and it is exfiltrated. Memory dies with the tab. |
| **Refresh** | `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Domain=.samyukt.com` cookie | 30 days, rotated | Unreadable by JS, so XSS cannot steal it. Scoped to the auth path so it isn't sent on every request. |

Consequence: a full page reload loses the access token, so the app calls `POST /auth/refresh`
once on boot (cookie travels automatically) and gets a fresh pair. That call is the "silent
login". A skeleton shell renders during it — never a login flash.

### Why `SameSite=Lax` and not `Strict`

`Strict` would drop the cookie when a user arrives from an email invite link, breaking invite
acceptance. `Lax` sends it on top-level navigations, which is exactly what we want, and combined
with the CSRF defence below it is safe.

### Why `Domain=.samyukt.com`

`app.samyukt.com` and `api.samyukt.com` are the same *site* (same registrable domain), so the
cookie is first-party and `SameSite=Lax` works without `None`. If you ever host the web app on a
different domain (e.g. `doit.vercel.app`), you are forced into `SameSite=None`, which browsers
treat as third-party and may block — another reason to use your own domain.

---

## 4.2 CSRF defence (double submit)

Even with `SameSite=Lax`, state-changing requests get a second check:

1. On `POST /auth/refresh` and `POST /auth/login`, the API also sets a **non-HttpOnly**
   `csrf_token` cookie (32 random bytes) and returns the same value in the response body.
2. The web client stores it in memory and sends it as `X-CSRF-Token` on every mutating request.
3. The API rejects any mutating request whose `X-CSRF-Token` does not match the cookie with
   `403 CSRF_FAILED`.

An attacker's page can cause the browser to *send* the cookie but cannot *read* it, so it cannot
set the header. Standard double-submit, no server state needed.

---

## 4.3 Login flow (web)

```
POST /api/v1/auth/web/login   { email, password, deviceName: "Chrome on macOS", platform: "web" }
  → 200
    Set-Cookie: refresh_token=…; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Domain=.samyukt.com
    Set-Cookie: csrf_token=…; Secure; SameSite=Lax; Path=/; Domain=.samyukt.com
    body: { data: { user, accessToken, expiresIn, csrfToken, memberships[] } }
```

- `platform: "web"` records the session in the same `Session` table the mobile app uses, so
  **Settings → Sessions on mobile shows the browser**, and revoking it there logs the browser out
  on its next request (`401 SESSION_REVOKED` → clear memory → `/login?reason=revoked`).
- Device name is derived from the user agent, editable in Settings.

Logout: `POST /auth/web/logout` clears the cookie server-side (revokes the session row) and the
client clears memory. Also call it on `visibilitychange` → hidden? No — that would log people out
when they switch tabs. Only on explicit logout or `SESSION_REVOKED`.

### Multi-tab consistency

Use a `BroadcastChannel('doit-auth')`:

- login / logout → broadcast so every tab updates
- refresh → the winning tab broadcasts the new access token; others adopt it instead of
  refreshing again (prevents a rotation race where tab B's refresh invalidates tab A's token)

This is not optional. Without it, two open tabs will fight over refresh rotation and one will
randomly get logged out.

---

## 4.4 Route guards

Three layers, and all three are required:

1. **Router level** — a `RequireAuth` layout route: no session → redirect to `/login` with
   `?next=<path>`. `RequireWorkspace` checks the user is a member of `:workspaceSlug`.
2. **Component level** — `usePermission()` from `@doit/contracts`'s `can(role, action, resource)`
   hides controls the role cannot use. Hidden, not disabled — a disabled Delete button on every
   row for a TESTER is noise.
3. **Server level** — unchanged and authoritative. Every mutating endpoint re-checks membership
   and role. The client is a convenience, never a control.

If the UI hides something and the API allows it, that is a UI bug. If the UI shows something and
the API rejects it, that is a UX bug. Fix both; never rely on one.

---

## 4.5 Permission model (shared, single source)

`packages/contracts/src/permissions.ts`:

```ts
export type Action =
  | 'task.create' | 'task.update.own' | 'task.update.any' | 'task.delete'
  | 'bug.create'   | 'bug.update'      | 'bug.delete'
  | 'sticky.create'| 'sticky.delete'
  | 'comment.create' | 'comment.delete.own' | 'comment.delete.any'
  | 'label.manage' | 'project.manage'  | 'member.invite' | 'member.remove'
  | 'member.role.change' | 'workspace.delete' | 'session.manage'
  | 'export.data';

export const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  OWNER:  [/* everything */],
  ADMIN:  [/* everything except member.role.change, workspace.delete */],
  TESTER: ['task.create','task.update.own','bug.create','bug.update','sticky.create',
           'comment.create','comment.delete.own','export.data'],
  VIEWER: ['export.data'],
};

export const can = (role: Role, action: Action) => ROLE_PERMISSIONS[role].includes(action);
```

- The NestJS `RolesGuard` imports the same constant — one file, no drift.
- The web sidebar, the board card menu, the drawer and the bulk-action bar all call `can()`.
- Unit-test the matrix in **both** packages from the same fixture.

---

## 4.6 Sign-up, invites and verification

| Flow | Endpoint | Web behaviour |
|---|---|---|
| Register | `POST /auth/register` | creates user + personal workspace; sends a verification email |
| Verify email | `GET /auth/verify/:token` | shows a success screen, then auto-logs-in |
| Forgot password | `POST /auth/password/forgot` | always returns 200 (no account enumeration) |
| Reset | `POST /auth/password/reset` | token single-use, 30 min |
| Accept invite | `POST /memberships/accept` | `?next=/w/<slug>` preserved through the whole flow |

Invite link format: `https://app.samyukt.com/invite/<token>`. If the visitor is logged out, they
land on login **with the invite token preserved in `?next=`** and after auth are dropped straight
into the workspace. Losing the token on a login redirect is the single most common invite bug —
test it explicitly.

---

## 4.7 Failure handling

| Server response | Web action |
|---|---|
| `401 TOKEN_EXPIRED` | refresh once, replay the request, never show the user |
| `401 SESSION_REVOKED` | clear memory, broadcast, redirect `/login?reason=revoked` |
| `401 INVALID_CREDENTIALS` | inline form error |
| `403 FORBIDDEN` | toast "You don't have permission" + log to Sentry (it means the UI leaked a control) |
| `403 CSRF_FAILED` | refresh the csrf cookie once, replay, then force re-login |
| `409 STALE_WRITE` | conflict dialog: "This changed elsewhere. Reload / Overwrite" |
| `429 RATE_LIMITED` | toast with the `Retry-After` seconds |
| 5xx | toast + Sentry + keep the user's draft in the outbox |

---

## 4.8 Security checklist for the web app

- [ ] No token in `localStorage` or `sessionStorage`, ever.
- [ ] `Content-Security-Policy` header: `default-src 'self'`, no `unsafe-inline` for scripts,
      `connect-src` limited to the API and WS origins.
- [ ] `Strict-Transport-Security` with a 1-year max-age.
- [ ] `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] Rendered markdown is sanitised (task descriptions, comments) — use `DOMPurify`, never
      `dangerouslySetInnerHTML` with raw user text.
- [ ] File previews open in a sandboxed context; never `window.open` a user-supplied URL.
- [ ] The app never embeds the API token in a URL or a share link.
- [ ] Idle timeout: after 12 h of inactivity, force a refresh attempt; if it fails, log out.
- [ ] Rate-limit the login form client-side as well (disable after 5 failures for 30 s) purely as
      a UX nicety; the server is the real limit.
