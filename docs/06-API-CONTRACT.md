# 06 — API Contract

Base: `/api/v1`. JSON only. Auth: `Authorization: Bearer <accessToken>`.
OpenAPI generated at `/docs`. Every endpoint has an example request and response.

---

## 6.1 Envelopes

**Success**
```json
{ "data": { }, "meta": { "requestId": "..." } }
```
List responses add pagination:
```json
{ "data": [ ], "meta": { "nextCursor": "eyJpZCI6..." , "hasMore": true, "total": 128 } }
```
Cursor pagination everywhere (`?cursor=&limit=`, default 20, max 100). No offset pagination.

**Error**
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found.",
    "details": [ { "field": "title", "issue": "too_short" } ],
    "requestId": "01J..."
  }
}
```

### Error codes (client switches on `code`, never on `message`)

| HTTP | code | Meaning |
|---|---|---|
| 400 | `VALIDATION_FAILED` | zod rejected the body/query |
| 401 | `TOKEN_EXPIRED` | access token expired → refresh |
| 401 | `INVALID_CREDENTIALS` | bad login |
| 401 | `SESSION_REVOKED` | device session revoked → full logout |
| 403 | `FORBIDDEN` | role insufficient |
| 403 | `NOT_WORKSPACE_MEMBER` | cross-workspace access attempt |
| 404 | `*_NOT_FOUND` | resource missing or not visible |
| 409 | `CONFLICT` | unique violation (label name, project key) |
| 409 | `STALE_WRITE` | `updatedAt` mismatch on a `PATCH` with `If-Unmodified-Since` |
| 413 | `PAYLOAD_TOO_LARGE` | upload over limit |
| 422 | `UNPROCESSABLE` | semantically invalid state transition |
| 429 | `RATE_LIMITED` | includes `Retry-After` |
| 500 | `INTERNAL` | generic; details only in logs |

---

## 6.2 Auth

| Method | Path | Body / Notes |
|---|---|---|
| POST | `/auth/register` | `{email, password, name}` → `{user, accessToken, refreshToken, expiresIn}` |
| POST | `/auth/login` | `{email, password, deviceName, deviceId, platform, appVersion}` |
| POST | `/auth/refresh` | `{refreshToken}` → new pair (rotation) |
| POST | `/auth/logout` | revokes current session |
| POST | `/auth/logout-all` | revokes all sessions of the user |
| GET | `/auth/sessions` | list device sessions |
| DELETE | `/auth/sessions/:id` | revoke one |
| POST | `/auth/password/forgot` | `{email}` → always 200 |
| POST | `/auth/password/reset` | `{token, password}` |
| GET | `/auth/me` | `{user, memberships[]}` |

Token rules: access 15 min; refresh 30 days, rotated on every use; reuse of a consumed refresh
token revokes the whole `familyId`.

---

## 6.3 Workspaces & projects

| Method | Path |
|---|---|
| GET | `/workspaces` |
| POST | `/workspaces` `{name}` |
| GET | `/workspaces/:id` |
| PATCH | `/workspaces/:id` |
| GET | `/workspaces/:id/members` |
| POST | `/workspaces/:id/members/invite` `{email, role}` |
| POST | `/memberships/accept` `{token}` |
| PATCH | `/memberships/:id` `{role}` |
| DELETE | `/memberships/:id` |
| GET | `/workspaces/:id/projects` |
| POST | `/workspaces/:id/projects` `{name, key, color}` |
| PATCH | `/projects/:id` |
| DELETE | `/projects/:id` |

Role requirement is listed per endpoint in Swagger as `@Roles(...)`.

---

## 6.4 Tasks

| Method | Path | Notes |
|---|---|---|
| GET | `/projects/:id/tasks` | `?status=&priority=&label=&assignee=&due=overdue|today|week&type=&q=&cursor=&limit=&sort=order|-dueAt` |
| GET | `/tasks/my-day` | assigned to me, due today or overdue |
| GET | `/tasks/inbox` | unassigned, newest first |
| POST | `/projects/:id/tasks` | create (idempotent) |
| GET | `/tasks/:id` | full detail incl. labels, checklist, attachments, bug, activity |
| PATCH | `/tasks/:id` | partial; supports `If-Unmodified-Since` for conflict detection |
| DELETE | `/tasks/:id` | soft delete |
| POST | `/tasks/:id/status` | `{status}` — validates transitions |
| POST | `/tasks/:id/reorder` | `{beforeId?, afterId?}` → returns new `order` |
| POST | `/tasks/:id/assign` | `{assigneeId | null}` |
| POST | `/tasks/:id/labels` | `{labelIds: []}` replaces set |
| POST/DELETE | `/tasks/:id/checklist` `/checklist/:itemId` | |
| PATCH | `/checklist/:itemId` | `{text?, done?}` |
| GET/POST | `/tasks/:id/comments` | |
| DELETE | `/comments/:id` | |
| GET | `/tasks/:id/activity` | |

**Create task body**
```json
{
  "title": "Login button unresponsive on slow 3G",
  "description": "Tapping login does nothing for ~8s",
  "status": "TODO",
  "priority": "HIGH",
  "dueAt": "2026-11-02T12:00:00.000Z",
  "assigneeId": null,
  "labelIds": [],
  "checklist": ["Reproduce on 3G", "Check console"],
  "source": "OVERLAY"
}
```
Header `Idempotency-Key: <uuid>` is **required** on all `POST` create endpoints.

**Status transitions allowed:** `TODO→IN_PROGRESS→DONE`, `TODO→BLOCKED`, `IN_PROGRESS→BLOCKED`,
`BLOCKED→IN_PROGRESS`, `DONE→TODO` (reopen). Anything else → `422 UNPROCESSABLE`.

---

## 6.5 Bugs & sessions

| Method | Path | Notes |
|---|---|---|
| POST | `/projects/:id/bugs` | creates Task(`type=BUG`) + BugReport atomically |
| GET | `/projects/:id/bugs` | `?severity=&status=&sessionId=` |
| PATCH | `/bugs/:id` | severity, steps, expected, actual, frequency |
| GET | `/bugs/:id/export?format=md` | markdown export |
| POST | `/projects/:id/sessions` | `{appUnderTest, appVersion, deviceInfo}` |
| PATCH | `/sessions/:id` | `{state: "ENDED"}` → computes summary |
| GET | `/sessions/:id` | session + its bugs |
| GET | `/projects/:id/sessions` | |

**Create bug body**
```json
{
  "title": "Checkout crashes on apply coupon",
  "description": "Verbatim tester words or transcript",
  "severity": "CRITICAL",
  "steps": ["Open cart", "Apply COUPON10", "Observe crash"],
  "expected": "Discount applied",
  "actual": "App closes",
  "frequency": "always",
  "sessionId": "uuid-or-null",
  "voiceNoteId": "uuid-or-null",
  "attachmentIds": ["uuid"],
  "autoContext": { "deviceModel": "Pixel 7", "osVersion": "Android 14" }
}
```

---

## 6.6 Stickies & labels

| Method | Path |
|---|---|
| GET | `/projects/:id/stickies` |
| POST | `/projects/:id/stickies` `{body, color, pinned}` |
| PATCH | `/stickies/:id` |
| DELETE | `/stickies/:id` |
| POST | `/stickies/:id/convert` `{projectId}` → creates a task, links both ways |
| POST | `/stickies/:id/reorder` |
| GET/POST | `/workspaces/:id/labels` |
| PATCH/DELETE | `/labels/:id` |

---

## 6.7 Uploads (three-step, resumable)

1. `POST /uploads/init` → `{contentType, sizeBytes, purpose}`
   returns `{uploadId, putUrl, storageKey, expiresAt, headers}` (presigned PUT; local-disk driver
   in dev returns a local PUT URL).
2. Client `PUT`s bytes directly to `putUrl` (with progress; resumable via ranged PUT).
3. `POST /uploads/:uploadId/complete` → `{attachmentId, url, thumbUrl}`.
   Server verifies size/mime, generates thumbnail for images/video, queues virus scan in prod.

Limits: image 12 MB, video 120 MB / 60 s, audio 25 MB / 5 min, file 25 MB. Reject by
`Content-Length` before accepting.

---

## 6.8 Voice

| Method | Path | Notes |
|---|---|---|
| POST | `/voice` | multipart audio + `{language}` → `{voiceNoteId, state:"TRANSCRIBING"}` |
| GET | `/voice/:id` | `{state, rawTranscript, text}` — poll every 1.5 s while `TRANSCRIBING`, max 20 s, then fall back to the on-device transcript |
| PATCH | `/voice/:id` | `{text}` user correction |
| POST | `/voice/:id/attach` | `{taskId? | commentId?}` |

Transcription runs in a BullMQ worker: `ffmpeg` normalise → provider (whisper local / openai /
saarika) → persist `rawTranscript` + `engine`. Failures set `FAILED` with a retryable flag.

---

## 6.9 Search, notifications, misc

| Method | Path |
|---|---|
| GET | `/search?q=&types=task,bug,sticky,comment&cursor=` |
| GET | `/notifications?unreadOnly=` |
| POST | `/notifications/read` `{ids:[]}` |
| POST | `/devices` `{fcmToken, platform}` |
| GET | `/health`, `/health/ready` |
| GET | `/me/export` (GDPR dump, queued) |
| DELETE | `/me` (account deletion, 30-day grace) |

---

## 6.10 Cross-cutting requirements

- **Rate limits:** auth 10/min/IP, mutations 120/min/user, uploads 30/min/user, search 60/min/user.
- **Validation:** every body/query parsed with a zod schema from `packages/contracts`. Unknown
  keys rejected (`strict()`).
- **Workspace scoping:** `WorkspaceMemberGuard` resolves the workspace from the route resource
  and asserts membership + role. Never trust a `workspaceId` in the body.
- **Idempotency:** `Idempotency-Key` stored 24 h in Redis with the response body; replay returns
  the stored response with header `Idempotent-Replay: true`.
- **Timestamps:** ISO-8601 with `Z`. Clients never send `createdAt`.
- **Pagination stability:** cursor encodes `(order, id)` so results don't shift mid-scroll.
- **Realtime:** after any mutation, emit the matching socket event with the same DTO as REST.
