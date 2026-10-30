# P03 — Workspaces, Projects, Memberships, Roles

**Lane** A · **Depends on** P02 · **Branch** `feat/p03-workspaces-roles`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.3
- `05-DATA-MODEL.md` §5.2 (`Workspace`, `Membership`, `Project`)

## Goal
Multi-tenancy. A user can belong to many workspaces with a role in each; projects live inside a
workspace. Every later endpoint must be workspace-scoped and role-guarded.

## Deliverables
- `modules/workspaces/`, `modules/projects/`, `modules/members/`
- `common/guards/WorkspaceMemberGuard` + `@RequireRole()` decorator
- invite flow (email + tokenised deep link) with accept endpoint
- unit tests for the full role × endpoint matrix
- e2e: two workspaces, cross-tenant access attempts must 403

## Requirements
- `WorkspaceMemberGuard` resolves the workspace from the resource in the route (project →
  workspace, task → project → workspace), never from the request body.
- Role matrix (enforce exactly):

| Action | OWNER | ADMIN | TESTER | VIEWER |
|---|---|---|---|---|
| read anything | ✓ | ✓ | ✓ | ✓ |
| create task/bug/sticky/comment | ✓ | ✓ | ✓ | ✗ |
| edit own item | ✓ | ✓ | ✓ | ✗ |
| edit others' items | ✓ | ✓ | ✗ | ✗ |
| delete task/bug/sticky | ✓ | ✓ | ✗ | ✗ |
| manage labels/projects | ✓ | ✓ | ✗ | ✗ |
| invite/remove members | ✓ | ✓ | ✗ | ✗ |
| change roles / delete workspace | ✓ | ✗ | ✗ | ✗ |

- A user may never have two memberships in the same workspace; re-inviting returns `409`.
- Project `key` is uppercase 2–5 chars, unique per workspace; generating a default from the name
  is fine but must handle collisions.
- Deleting a workspace is a soft archive requiring the owner to type the workspace name.

## Do not
- Do not implement UI.
- Do not allow a user to escalate their own role.
- Do not leak the existence of a workspace the caller isn't in — return 403, not 404 with detail.

## Acceptance checks
- [ ] OWNER can do everything; TESTER gets 403 on delete and on member management; VIEWER gets
      403 on every mutation. Verified by an automated matrix test.
- [ ] Cross-workspace request with a valid token → `403 NOT_WORKSPACE_MEMBER`.
- [ ] Invite → accept → membership active → `GET /auth/me` shows the new workspace.
- [ ] Project key collision returns `409 CONFLICT` with the offending field.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
