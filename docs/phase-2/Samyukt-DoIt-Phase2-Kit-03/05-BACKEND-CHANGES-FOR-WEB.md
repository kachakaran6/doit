# 05 — Backend Changes Required by the Web App

The API is complete for mobile. A browser client needs nine additions. All of them are additive —
nothing breaks the shipped mobile build.

---

## 5.1 CORS with credentials

```ts
app.enableCors({
  origin: [
    'https://app.samyukt.com',
    'http://localhost:5173',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:4173'] : []),
  ],
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Idempotency-Key','If-Unmodified-Since','X-CSRF-Token','x-request-id'],
  exposedHeaders: ['x-request-id','Idempotent-Replay','Retry-After'],
  maxAge: 600,
});
```

`credentials: true` **requires** an explicit origin list — `origin: '*'` silently breaks cookies.
Also set `app.set('trust proxy', 1)` so rate limiting sees the real client IP behind the load
balancer, and add `cookie-parser` with a secret.

## 5.2 Cookie transport for auth

Three new endpoints alongside the existing mobile ones:

| Endpoint | Purpose |
|---|---|
| `POST /auth/web/login` | sets `refresh_token` (HttpOnly) + `csrf_token` cookies, returns access token in the body |
| `POST /auth/web/refresh` | reads the cookie, rotates, sets new cookies, returns a new access token |
| `POST /auth/web/logout` | revokes the session, clears both cookies |

The existing `/auth/login` and `/auth/refresh` (body-based) stay exactly as they are for mobile.
Do not merge them — different transports, different threat models.

Implementation notes:
- Cookie options come from config, not literals: `cookie.domain`, `cookie.secure`,
  `cookie.sameSite`, `cookie.path = '/api/v1/auth'`.
- In development (`NODE_ENV !== 'production'`), `secure: false` and `domain: undefined` so
  `localhost:5173` → `localhost:3000` works.
- `csrf_token` must be `httpOnly: false` (the client has to read it) and `path: '/'`.

## 5.3 CSRF middleware

A global guard on mutating methods (`POST/PATCH/PUT/DELETE`) that:
1. skips when the request has no `refresh_token` cookie (i.e. it's a bearer/mobile request),
2. otherwise compares `X-CSRF-Token` header to the `csrf_token` cookie with a timing-safe compare,
3. rejects with `403 CSRF_FAILED`.

Never apply it to `/auth/web/login` or `/auth/web/refresh` — those are the endpoints that
establish the cookie in the first place.

## 5.4 Permissions in `/auth/me`

Extend the response so the web client never has to compute permissions itself:

```json
{ "data": {
  "user": { "id": "...", "name": "...", "email": "...", "prefs": { "theme": "dark", "accent": "teal" } },
  "memberships": [
    { "workspaceId": "...", "slug": "acme", "name": "Acme Technologies", "role": "OWNER",
      "permissions": ["task.create","task.delete","member.invite"] }
  ]
} }
```

`permissions` is `ROLE_PERMISSIONS[role]` from `@doit/contracts`. One source, server-computed.

## 5.5 Endpoints the web needs that mobile never did

| Endpoint | Why web-only |
|---|---|
| `GET /projects/:id/board` | one call returning columns + cards (id, title, priority, labels, assignee, dueAt, checklistProgress) — the board must not N+1 |
| `PATCH /tasks/:id/move` | `{status, beforeId, afterId}` in one transaction — drag across columns is two changes (status + order) and must be atomic |
| `POST /tasks/bulk` | `{ids, action: 'status'\|'assign'\|'label'\|'delete', value}` — web users multi-select with shift-click |
| `GET /workspaces/:id/overview` | dashboard counts: open, overdue, bugs by severity, activity feed — one round trip instead of six |
| `GET /workspaces/:id/activity?cursor=` | the sidebar activity feed, paginated |
| `GET /projects/:id/export?format=csv` | web users export; mobile users share markdown |
| `GET /workspaces/:id/audit?actor=&action=&from=&to=` | admin view over `ActivityLog` |
| `POST /users/me/avatar` | web profile editing (mobile can adopt later) |
| `GET /workspaces/:id/stats/bugs?from=&to=` | severity over time, for the sessions chart |

Everything else the web app needs already exists.

## 5.6 Realtime additions

The socket gateway already emits `task.*`, `comment.*`, `bug.*`, `session.*`. Web adds:

- **Presence**: `project:{id}` room tracks `{userId, name, avatarUrl, cursorTaskId?}` and emits
  `presence.updated`. The board shows avatar stacks on the cards other people are editing.
- **Conflict notice**: on `task.updated` where `updatedById !== me` and the drawer is open on that
  task, the client shows the "changed elsewhere" banner (see `04-WEB-AUTH-AND-AUTHZ.md` §4.7).
- Throttle presence to 1 update / 2 s per user; drop presence entirely if the room has >50
  members.

## 5.7 Rate limits per surface

Web clients poll more than mobile. Add a `surface` claim (`mobile|web`) to the access token and
apply separate buckets:

| Surface | Mutations | Search |
|---|---|---|
| mobile | 120 / min | 60 / min |
| web | 300 / min | 120 / min |

Same protection, fewer false positives for a desktop user with a keyboard.

## 5.8 Idempotency on the web

Keep `Idempotency-Key` mandatory on creates. Web generates one per composer open (not per
keystroke), so a double-clicked Send creates one task. On retry after a network error, reuse the
same key.

## 5.9 Migration & compatibility rules

- Add columns with defaults; never rename or drop in the same release the mobile app depends on.
- The mobile app must keep working against the new API for **at least one app-store release
  cycle** — old versions live on devices for weeks.
- Version the API path only if you break something: `/api/v1` → `/api/v2` with v1 proxied.
- Ship the backend changes (W-track prerequisite) **before** the web app, and deploy the mobile
  app's tolerance for them in the same window.

## 5.10 Definition of done

- [ ] `curl -i -X POST https://api.samyukt.com/api/v1/auth/web/login -d '{...}'` returns both
      `Set-Cookie` headers with the right flags.
- [ ] A request from `https://app.samyukt.com` with `credentials: 'include'` succeeds; from any
      other origin it is rejected by CORS.
- [ ] A mutating request without `X-CSRF-Token` → `403 CSRF_FAILED`.
- [ ] The mobile app's existing bearer flow still passes its full test suite.
- [ ] `GET /auth/me` includes `permissions` per membership.
- [ ] `GET /projects/:id/board` with 300 cards returns in < 200 ms in one query.
- [ ] `PATCH /tasks/:id/move` is atomic: a failure leaves neither status nor order changed.
