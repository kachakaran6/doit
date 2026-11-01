# 05 — API Integration

## Client
- Single typed `http` wrapper over `fetch`: base URL `/api/v1` (same-origin proxy), `Authorization: Bearer <in-memory token>`, `X-Workspace-Id`, `X-Client: web`, `Idempotency-Key` on creates, request id logging in dev.
- Response parsing through `@doit/contracts` zod schemas (dev: throw on mismatch; prod: report to Sentry + show a generic error).
- Error mapping from the standard envelope `{statusCode, code, message, details?}`:
| Status | Behavior |
|---|---|
| 401 | single-flight refresh → retry once → else `/session-expired` |
| 403 | toast "You don't have permission", refetch `/me/permissions` |
| 404 | resource page → 404 state; mutation → toast |
| 409 | conflict toast with "reload" action (stale edit) |
| 422 | field errors mapped into react-hook-form; state-machine errors shown inline (e.g. invalid transition) |
| 429 | respect `Retry-After`; friendly "slow down" toast |
| 5xx/network | retry with backoff for GET; error state with Retry; offline banner |

## Query conventions
- Keys: `[feature, workspaceId, params]`. Central `keys.ts` per feature.
- Lists use `useInfiniteQuery` (cursor); URL search params ↔ filters (TanStack Router validated search schema).
- Optimistic mutations for state/priority/assignee/labels/board moves/checkbox; rollback on error; always invalidate on settle.
- Prefetch on hover for item links; prefetch project views on sidebar hover.
- Cache cleared on logout and workspace switch.

## Endpoints used (from the existing API)
Auth + sessions · `/me`, `/me/permissions` · workspaces, members, invitations · projects (+ members, archive) · work-items (filters, quick, summary) · labels · stickies (+ convert) · attachments (upload, signed URL, delete) · audit-log · notifications (if present) · health. If a needed endpoint is missing, list it in `docs/WEB_API_GAPS.md`, add it to the backend + contract with tests, never work around it in the client.

## Uploads
- Drag-drop, file picker, **paste screenshot from clipboard**. Validate type/size client-side (same limits as server). Show progress (XHR or fetch streams), cancel, retry. Upload first → attach ids on create (same flow as mobile).
- Image thumbnails via signed URLs; lightbox loads the full-size on open.
- Audio: signed URL + `<audio>` custom player (speed 1×/1.5×/2×), transcript beneath if present.

## Realtime
- WS client with ticket auth, heartbeat, reconnect with exponential backoff + jitter, resubscribe after workspace switch.
- Events (names to match backend gateway): `work_item.created|updated|deleted`, `comment.created`, `sticky.*`, `membership.updated`, `notification.created`, `session.revoked`.
- Handlers patch the Query cache (setQueryData) or invalidate; ignore events caused by the current client (avoid flicker); show a subtle "Updated just now" highlight on remote changes.
- `session.revoked` → immediate sign-out UI.

## Config
Runtime public config via `/config.json` (version, minAppVersion, feature flags, Sentry DSN public key). No secrets in the bundle. API URL is relative (same-origin).

## Observability
Sentry (release + source maps), web-vitals reporting, structured console logs only in dev, error boundary per route with "Report a problem" (includes request id).
