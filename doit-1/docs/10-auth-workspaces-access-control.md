# 10 — Authentication, Workspaces, Projects & Access Control

This document is authoritative for identity, tenancy and permissions. If it conflicts with other docs, this wins (update the others).

## 1. Tenancy model
```
User ──< Membership >── Workspace ──< Project ──< WorkItem
                                  │        └──< ProjectMember (for private projects)
                                  ├──< Label, Sticky(owner-scoped), Invitation, AuditLog
```
- A user can belong to **many workspaces** (team A, client B). Mobile has a **workspace switcher** (header "Karan-new ⌄" like Plane).
- Every request that touches tenant data carries `X-Workspace-Id`. A global `WorkspaceGuard` verifies the caller has an active Membership in it and attaches `{workspace, membership}` to the request. Missing/invalid/non-member → 403 (never reveal existence → use 404 for resources in other workspaces).
- **Every query is scoped by workspaceId at the service layer** (use a Prisma extension or repository helper that forces the filter; add a test that fails if a query forgets it).

## 2. Roles
**Workspace roles**: `owner` (exactly ≥1, billing/transfer/delete), `admin`, `member`, `guest` (read + comment/create bugs only in projects they're added to).
**Project roles** (only meaningful for `private` projects, or to restrict guests): `project_admin`, `project_member`, `project_viewer`.
Project `visibility`: `workspace` (all non-guest members can access) | `private` (only ProjectMembers + workspace owner/admin).

## 3. Permission matrix (implement as data, not scattered ifs)
| Action | owner | admin | member | guest |
|---|---|---|---|---|
| Delete workspace / transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Rename workspace, manage invites, change roles (below own), remove members | ✅ | ✅ | ❌ | ❌ |
| Create project | ✅ | ✅ | ✅ | ❌ |
| Edit/delete project | ✅ | ✅ | project_admin only | ❌ |
| Manage project members | ✅ | ✅ | project_admin | ❌ |
| Create work item (incl. bugs) | ✅ | ✅ | ✅ (in accessible projects) | ✅ bug/task only in added projects |
| Edit work item | ✅ | ✅ | ✅ | only own items |
| Delete work item | ✅ | ✅ | own items | ❌ |
| Manage labels | ✅ | ✅ | create only | ❌ |
| Stickies | personal: own only, always |  |  |  |
| View audit log | ✅ | ✅ | ❌ | ❌ |
Rules: nobody can change their own role; admins cannot modify owners or other admins' roles; last owner can't leave/demote (must transfer first).

## 4. Implementation: central policy
- `PolicyService.can(actor, action, resource?) → boolean` with action strings like `project:create`, `work_item:update`, `member:remove`. Matrix lives in `common/policy/permissions.ts` as a typed map. Also export it via `packages/shared` so the **mobile app hides actions with `useCan('work_item:delete', item)`** (UI hiding is cosmetic; server always enforces).
- Decorator `@Can('work_item:update')` + `PolicyGuard` loads the resource (via a resolver per resource type) and checks. Services never trust the controller alone for object-level checks (prevent IDOR).
- Unit-test the matrix exhaustively (table-driven: role × action × ownership). Add e2e tests for IDOR: user in workspace A cannot read/write workspace B resources by id.

## 5. Authentication (full list)
- Register (creates user + first workspace as owner, or joins via invite token).
- Login, refresh (rotating, reuse detection), logout, logout-all, sessions list/revoke (with device name, last used, current marker).
- **Change password** (requires current password; revokes other sessions).
- **Forgot / reset password**: single-use hashed token, 30-min expiry, email via SMTP (`MAIL_*` env). In dev with no SMTP, log the link to console. Rate limited, never reveals whether an email exists.
- Email verification: BACKLOG (flag `emailVerifiedAt` exists but not enforced).
- Password policy: ≥ 8 chars, not in a small common-password list; argon2id.
- Brute-force protection: throttler on auth routes + per-account progressive lockout (5 fails → 15 min) with generic error message.
- JWT claims: `sub`, `sid` (session id), `iat`, `exp`. **Access token is validated against the session** (cached check that session isn't revoked) so logout/revoke takes effect quickly. Don't put roles in the JWT; roles come from Membership per request (so role changes apply immediately).
- Mobile: tokens only in SecureStore; biometrics app-lock is BACKLOG.
- All sensitive actions write an **AuditLog** row.

## 6. Invitations
- Admin creates invite: `{email?, role, projectIds?, expiresAt}` → returns link/code `samyukt://join?token=…` + 8-char code. Single use or multi-use link (admin choice), revocable, expires (default 7 days). Tokens stored hashed.
- Accept: logged-in user → `POST /invitations/accept`; new user → register with token. Email must match if the invite was email-bound.
- Seats: no limit in POC.

## 7. Data model additions (also reflected in doc 04)
- `Role` → `owner|admin|member|guest`
- `Membership`: add `status (active|suspended)`, `invitedById`, `joinedAt`
- `Project`: add `visibility (workspace|private)`, `archivedAt`, `leadId?`
- `ProjectMember`: projectId, userId, role (`project_admin|project_member|project_viewer`) — unique(projectId,userId)
- `Invitation`: workspaceId, email?, role, tokenHash, code, maxUses, usedCount, expiresAt, revokedAt, createdById, projectIds[]
- `PasswordReset`: userId, tokenHash, expiresAt, usedAt
- `AuditLog`: workspaceId?, actorId, action, targetType, targetId, meta(json), ip, createdAt
- `User`: add `emailVerifiedAt?`, `failedLoginCount`, `lockedUntil?`

## 8. Endpoint additions (prefix `/api/v1`)
Workspaces: `GET /workspaces` (mine), `POST /workspaces`, `GET/PATCH/DELETE /workspaces/:id`, `POST /workspaces/:id/transfer-ownership`, `POST /workspaces/:id/leave`
Members: `GET /members`, `PATCH /members/:userId` {role|status}, `DELETE /members/:userId` (uses `X-Workspace-Id`)
Invitations: `GET /invitations`, `POST /invitations`, `DELETE /invitations/:id`, `POST /invitations/accept`, `GET /invitations/preview?token=` (public, shows workspace name + role only)
Project members: `GET/POST /projects/:id/members`, `PATCH/DELETE /projects/:id/members/:userId`; `POST /projects/:id/archive|unarchive`
Auth: `POST /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password`
Audit: `GET /audit-log?cursor&limit&action&actorId`
Permissions: `GET /me/permissions` → role + allowed action list for current workspace (mobile can use it for UI gating on load).
Remove old `POST /workspaces/join` (replaced by invitations/accept).

## 9. Mobile requirements (feature folders: `workspaces`, `members`, `projects`)
- Workspace switcher sheet (list, create new, join by code). Persist last workspace; interceptor sets `X-Workspace-Id`; switching clears React Query cache.
- Members screen: list with role badges, change role / suspend / remove via ActionSheet (only shown if `useCan`), invite sheet (role picker, copy/share link).
- Project screens: list, create/edit, visibility toggle, project members screen, archive.
- Role-aware UI everywhere using `useCan`; **403 handling**: toast "You don't have permission" + refresh permissions; **401 handling**: refresh once, else go to login.
- Settings: change password, active sessions, logout all, workspace leave.
- Bug capture overlay: Quick Capture shows the current workspace + project; guests only see projects they were added to.

## 10. Security tests required
Table-driven permission tests; IDOR e2e; refresh reuse; revoked-session token rejected; lockout; reset token single use & expiry; invite expiry/revocation/single-use; last-owner protection; guest limits.
