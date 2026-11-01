# 01 — Product & Information Architecture

## Who uses the web
- **Team members / devs**: plan, triage bugs, manage boards.
- **Admins/owners**: members, roles, invites, audit.
- **Testers**: occasionally view their reported bugs (mobile is their main tool).

## Layout (desktop first, responsive)
- **Sidebar** (collapsible, shadcn Sidebar): workspace switcher · My Work (My Day, Inbox, Upcoming) · Projects (list + create) · Stickies · Bugs (triage) · Dashboard · Search · Settings/Admin (role-gated).
- **Top bar**: breadcrumbs, command palette trigger (⌘K), `+ New` menu (Task/Bug/Sticky), notifications bell, account menu.
- **Content**: page header (title, view switcher, filters) + body. Item detail opens as a **peek sheet** (right) or full page.
- Below 768 px: sidebar becomes a drawer, tables become cards, board scrolls horizontally.

## Routes (all under an authenticated layout unless public)
| Route | Page | Min role / rule |
|---|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/accept-invite` | Auth | public |
| `/privacy`, `/terms`, `/delete-account`, `/download` | Public pages | public |
| `/onboarding` | Create first workspace/project | authed, no workspace |
| `/w/:workspaceSlug` → redirect `/w/:slug/home` | Dashboard | member |
| `/w/:slug/my-day`, `/inbox`, `/upcoming` | My Work | member |
| `/w/:slug/projects` | Projects list | member (private projects filtered by server) |
| `/w/:slug/projects/:projectId/list|board|table` | Project views | project access |
| `/w/:slug/items/:itemKey` | Item full page (e.g. `APP-12`) | project access |
| `/w/:slug/bugs` | Bug triage | member+ (guest: own bugs) |
| `/w/:slug/stickies` | Stickies (personal) | member |
| `/w/:slug/search?q=` | Search | member |
| `/w/:slug/settings/profile|appearance|security|sessions` | Personal settings | authed |
| `/w/:slug/admin/members|invitations|projects|audit|workspace` | Admin | admin/owner |
| `/403`, `/404`, `/session-expired` | Error pages | — |
Workspace comes from the URL slug → API header `X-Workspace-Id` is set by the client. Unknown/unauthorized workspace → 404 page (don't reveal existence).

## Role summary (full matrix lives in `@doit/contracts`)
owner > admin > member > guest. Private projects need project membership (owner/admin see all). Guests see only projects they were added to and their own items.

## Cross-platform parity
Everything created on mobile (tasks, bugs with screenshots/audio/device meta, stickies) appears on web instantly (realtime or refetch), and vice-versa. Same sessions list shows both clients (`platform: web|android`). Revoking a session logs that client out.
