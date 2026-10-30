# 13 — DoIt Web App (React + shadcn)

## Goal
A professional web client for the same API: Trello-style boards + Plane-style lists, bug triage with screenshots/audio, and full admin/RBAC. Mobile = capture; web = plan, triage, manage.

## Stack
| Concern | Choice |
|---|---|
| Build | Vite + React + TypeScript strict (SPA; no SSR needed behind login) |
| UI | **shadcn/ui** (Radix) + Tailwind CSS v4 |
| Routing | TanStack Router (or React Router; ADR) |
| Server state | TanStack Query |
| Forms | react-hook-form + zod (schemas from `@doit/contracts`) |
| Tables | TanStack Table (+ virtualization for big lists) |
| Drag & drop | dnd-kit (board + list reorder, fractional ordering as API) |
| Command palette | cmdk (⌘K / Ctrl+K) |
| Toasts | sonner |
| Charts | Recharts |
| Dates | date-fns |
| Realtime | native WebSocket to existing gateway (ticket auth, see doc 14) |
| Tests | Vitest + Testing Library, Playwright e2e |
| Icons | lucide-react |
| Font | Inter |
Location: `apps/web`, package `@doit/web`. Imports `@doit/contracts` and `@doit/tokens` only.

## Layout
- **Left sidebar**: workspace switcher, My Work (My Day, Inbox, Upcoming), Projects (+ create), Stickies, Bugs (triage), Search, Settings; collapsible; mobile-width drawer.
- **Top bar**: breadcrumbs, ⌘K search, "+ New" (task/bug/sticky), notifications, avatar menu.
- Content: page header + view switcher.

## Pages
1. **Auth**: login, register, forgot/reset password, accept invite, session-expired.
2. **Dashboard**: my work, due soon, overdue, bugs by severity/state (charts), recent activity.
3. **Projects**: list, create/edit, visibility, members, archive.
4. **Project views**: **List**, **Board (Kanban by state)**, Table. Group/sort/filter (state, priority, assignee, label, due, type). Saved filter persisted per user (URL = source of truth).
5. **Work item detail**: side peek drawer + full page. Editable title, rich-ish description (markdown with preview), properties (state, priority, assignee, labels, due, severity), attachments (image gallery, audio player), activity, delete.
6. **Bug triage**: table of incoming bugs; screenshot lightbox with zoom; audio player + transcript; device/meta panel (model, OS, app, network, battery); bulk assign/severity/state; keyboard navigation (J/K, Enter).
7. **Stickies**: board/grid, pin, color, convert to task.
8. **My Day / Inbox / Upcoming**.
9. **Search**: global (items, stickies) with `#label @user` syntax; ⌘K palette also runs commands.
10. **Admin** (permission-gated): members & roles, invitations, project members, audit log.
11. **Settings**: profile, appearance (light/dark/system + 5 accents), password, active sessions (revoke), workspace leave.

## Quality bars
- Responsive: desktop first, usable on tablet and phone width.
- WCAG AA: focus rings, labels, keyboard operable, reduced motion.
- Shortcuts: `C` create, `/` or ⌘K search, `G` then `M|I|U|B` navigation, `?` shortcuts help.
- Perf: route-level code splitting, list virtualization > 200 rows, Lighthouse perf ≥ 90 on a built bundle.
- Every view: skeleton, empty, error + retry.
- Optimistic updates for state/priority/assignee/board moves with rollback on error.
- Permission-aware UI via `useCan` (shared matrix), server always enforces.

## Deployment
Static build served by a small nginx/Caddy container that **also reverse-proxies `/api` and `/ws` to the API** so the browser sees one origin (simplifies cookies/CORS). Coolify resource `doit-web`.
