# 06 — Pages Spec

Common to all pages: skeleton → content, empty state with CTA, error state with Retry, responsive, keyboard accessible, URL-synced state, permission-aware actions.

## Auth & onboarding
Centered card layout (shadcn Card) with product mark "DoIt", theme toggle. Fields with inline validation. After first login with no workspace → **Onboarding**: create workspace (name, slug auto) → create first project (name + key) → land on Home. "Join with code/invite" alternative.

## Home / Dashboard
Greeting-free, Plane-style: summary cards (assigned to me, due soon, overdue, open bugs), "Your work" list (top 8), recent activity, bugs-by-severity and state charts (shadcn Chart), quick-create input (quick-add syntax with live parsed chips: `!high #label @user tomorrow bug`).

## My Work
- **My Day**: items due today/overdue/pinned; check off inline.
- **Inbox**: notifications + items assigned/mentioned; mark read/all read.
- **Upcoming**: grouped by date (this week/next).

## Projects
List/grid with progress, key, lead, visibility lock icon; create/edit dialog (name, key 2–5 chars, emoji, visibility); archive/delete (typed confirm).

## Project views (switcher: List · Board · Table)
- **Filters**: type, state, priority, assignee, label, due, text; sort; group by (state/priority/assignee/label/none); **all in URL**.
- **List**: grouped sections (collapsible), row = state icon · priority · key · title · labels · due · assignee avatar; inline edit of state/priority/assignee via popovers; keyboard (J/K move, Enter open, X select, S state, P priority, A assign, L label, D due).
- **Board (Kanban)**: columns = states; dnd-kit drag between columns + reorder (fractional order from API); optimistic move; illegal transition (e.g. BLOCKED→DONE 422) snaps back with explanation; WIP count; quick-add at the column bottom; keyboard-accessible drag.
- **Table**: TanStack Table, configurable columns, resize/reorder, virtualization, bulk select with action bar (state/priority/assignee/label/delete), CSV export.
- **Create**: `C` opens create dialog (full form) or inline quick-add.

## Item detail (peek sheet + full page `/items/APP-12`)
Header: key + type badge + copy link · big inline-editable title · markdown description (edit/preview, autosave with "Saved" indicator, conflict handling) · properties (state, priority, assignee, labels, due date, project, reporter, created/updated) · **attachments** (image gallery with lightbox, audio player + transcript) · **bug panel** (severity, reproducibility, steps, DeviceMetaPanel: model, OS, app/build, network, battery, captured at) · comments + activity (when available) · delete/duplicate/convert (task↔bug) · prev/next within the current list (`[`/`]`).

## Bug triage (`/bugs`)
Table optimized for scanning: thumbnail · title · severity · state · reporter · device · age · assignee. Filters (new/untriaged, severity, project, build, reporter, device). Split view: list left, detail right with big screenshot (lightbox zoom/pan, download), audio + transcript, device meta. **Bulk actions**; keyboard J/K/Enter, `1–4` severity, `A` assign, `S` state; "Duplicate of…" link action; "Needs info" state. Live updates when new bugs arrive from phones (toast + row highlight).

## Stickies
Personal masonry grid; color, pin, inline edit, search, convert to task (project picker), drag reorder.

## Search & Command palette
`/search?q=` with tabs (Items · Stickies · Projects · People), `#label @user` syntax, highlights. ⌘K palette: jump to project/item, create task/bug/sticky, switch workspace, toggle theme/accent, go to settings; recent items.

## Settings (personal)
Profile (name, avatar color), **Appearance** (mode + 5 accent swatches, density compact/comfortable), Security (change password, sessions list with revoke, sign out everywhere), Notifications (preferences), Data (export my data, delete account typed-confirm).

## Admin
Members · Invitations · Projects (visibility + project members) · Audit log · Workspace (rename, slug, delete). All gated by `<Can>` + route guards; clear explanations when disabled.

## Notifications
Bell with unread count, popover list, mark read, deep links; realtime; email/push preferences in settings.

## Public pages (no auth)
`/privacy`, `/terms`, `/delete-account` (how to delete + link to sign in), `/download` (Android APK/Play link + install guide + OEM battery tips). Static content, SEO meta, same theme. These satisfy Play Store policy URLs. Content marked "draft — needs legal review".

## Error pages
403 (explain + request access / switch workspace), 404, session-expired, offline banner, maintenance (from `/config`).

## Responsiveness
≥1280 full layout · 768–1279 collapsed sidebar, peek sheet full-width · <768 drawer nav, cards instead of table, board scrolls horizontally with snap, bottom-sheet pickers.
