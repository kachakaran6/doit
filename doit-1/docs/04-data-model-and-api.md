# 04 — Data Model & API Contract (source of truth)

> Identity, tenancy, roles, permissions: `10-auth-workspaces-access-control.md` takes precedence.

## Enums (in `packages/shared`)
- `WorkItemType`: `task | bug | todo`
- `WorkItemState`: `backlog | todo | in_progress | done | cancelled`
- `Priority`: `none | low | medium | high | urgent`
- `Severity` (bugs): `minor | major | critical | blocker`
- `AttachmentKind`: `image | audio | file`
- `Role`: `owner | admin | member | guest`
- `ProjectRole`: `project_admin | project_member | project_viewer`
- `ProjectVisibility`: `workspace | private`
- `AccentColor`: `blue | violet | green | orange | rose`
- `StickyColor`: `yellow | blue | green | pink | purple | gray`

## Entities (Prisma)
All ids `uuid`. All have `createdAt`, `updatedAt`.

**User**: email (unique), name, passwordHash, avatarColor, preferences(json: theme, accent)
**Session**: userId, refreshTokenHash, deviceName, platform, ip, userAgent, lastUsedAt, expiresAt, revokedAt
**Workspace**: name, slug (unique), inviteCode
**Membership**: workspaceId, userId, role, status, invitedById, joinedAt — unique(workspaceId,userId)
**ProjectMember / Invitation / PasswordReset / AuditLog**: see `10-auth-workspaces-access-control.md` §7 (authoritative)
**Project**: workspaceId, name, identifier (e.g. `APP`), emoji, itemCounter
**WorkItem**: projectId, sequenceId (per-project int, display `APP-12`), type, title, description (text/markdown), state, priority, dueDate?, assigneeId?, reporterId, severity?, sortOrder, `meta` json
  - `meta` for bugs: `{ deviceModel, osVersion, appPackage, appVersion, appName?, buildNumber?, screenSize, locale, networkType, batteryPct, capturedAt, stepsToReproduce?, transcript? }`
**Label**: workspaceId, name, color — unique(workspaceId,name)
**WorkItemLabel**: workItemId, labelId
**Attachment**: workItemId? , stickyId?, uploaderId, kind, mimeType, sizeBytes, storageKey, durationMs?, width?, height?, transcript?
**Sticky**: workspaceId, ownerId, title?, body, color, pinned, convertedToWorkItemId?

Indexes: WorkItem(projectId,state), WorkItem(assigneeId), WorkItem(dueDate), Session(userId), Session(refreshTokenHash).

## REST API (prefix `/api/v1`, JSON, Bearer auth except auth routes)
Pagination: `?cursor=&limit=20` → `{ items: [], nextCursor: string|null }`.
Error shape: `{ statusCode, code, message, details? }`.

### Auth
- `POST /auth/register` {email,name,password,workspaceName? | inviteCode?} → {user, accessToken, refreshToken}
- `POST /auth/login` {email,password,deviceName?,platform?} → same
- `POST /auth/refresh` {refreshToken} → {accessToken, refreshToken}
- `POST /auth/logout` → 204 (revokes current session)
- `POST /auth/logout-all` → 204
- `GET /auth/sessions` / `DELETE /auth/sessions/:id`
- `GET /me`, `PATCH /me` (name, preferences)

### Workspace, members, invitations, access control
See `10-auth-workspaces-access-control.md` §8 (authoritative). All tenant routes require header `X-Workspace-Id`.

### Projects
- `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id`

### Work items
- `GET /work-items?projectId&type&state&priority&assigneeId&labelId&dueBefore&q&cursor&limit&mine=true`
- `POST /work-items` {projectId, type, title, description?, state?, priority?, dueDate?, assigneeId?, labelIds?, severity?, meta?, attachmentIds?}
- `GET /work-items/:id`, `PATCH /work-items/:id`, `DELETE /work-items/:id`
- `POST /work-items/quick` {text, projectId?, type?} → server parses quick-add syntax (same parser also in `packages/shared` for client preview)
- `GET /work-items/summary` → counts by state/type for Home

### Labels
- `GET /labels`, `POST /labels`, `PATCH /labels/:id`, `DELETE /labels/:id`

### Stickies
- `GET /stickies`, `POST /stickies`, `PATCH /stickies/:id`, `DELETE /stickies/:id`
- `POST /stickies/:id/convert` {projectId, type?} → work item

### Attachments
- `POST /attachments` multipart: `file`, `kind`, optional `durationMs`, `transcript` → {id,url,...}
  (upload first, then pass `attachmentIds` when creating the item — works well with the overlay: upload screenshot + audio in parallel while user types)
- `GET /attachments/:id` (authorized stream) ; `DELETE /attachments/:id`
- Limits: image ≤ 10 MB (jpeg/png/webp), audio ≤ 20 MB (m4a/aac/mp3/wav/ogg).

### Health
- `GET /health` → {status:'ok', db:'up'}

## Quick-add syntax (shared parser)
`Fix login crash !urgent #android @karan tomorrow bug`
- `!urgent|high|medium|low`, `#label`, `@member`, `type words: bug|task|todo`, dates: `today, tomorrow, mon..sun, next week, 12 nov`.
Parser is pure, unit-tested, lives in `packages/shared/src/quick-add.ts`.
