# W03 — Web App Shell + Workspace Dashboard

**Lane** W · **Depends on** W02 · **Branch** `feat/w03-web-app-shell`

## Load
- `09-PHASE2-RULES.md`
- `02-WEB-ARCHITECTURE.md` §2.3, §2.4
- `03-WEB-DESIGN-SYSTEM.md` §3.5
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.5 (`/workspaces/:id/overview`)

## Goal
Build the three-pane shell and the workspace dashboard: the frame every other web screen sits
inside.

## Deliverables
- `components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `DetailDrawer.tsx`
- `features/workspaces/` — workspace switcher, dashboard
- routes: `/w/:slug` dashboard, `/w/:slug/my-day`, `/w/:slug/inbox`, `/w/:slug/upcoming`
- `features/_template/` for web (mirror of the mobile template, with `README.md`)
- the keyboard shortcut system (`lib/shortcuts.ts` + a `?` help sheet)
- empty states wired for every list

## Requirements
- Sidebar 240 px: workspace chip, My Day, Inbox, Upcoming, then projects with their key badges,
  then Bugs / Search / Settings at the bottom. Active item gets an accent-tinted pill, not a bar.
- Topbar: breadcrumb, filter chips, search affordance (`/`), primary `+` button, avatar menu.
- Collapse to an icon rail below 1024 px; the drawer becomes a full-screen sheet below 768 px.
- The dashboard is one call to `/workspaces/:id/overview`: counts (open, overdue, bugs by
  severity), recent activity, and 3 lists (assigned to me, recently updated, unassigned).
- Shortcuts implemented per `03-WEB-DESIGN-SYSTEM.md` §3.5, never firing while focus is in an
  input.
- Every list route persists filters/sort in the query string.
- Skeletons match the final layout; no centred spinners.

## Do not
- Do not build the board or the task drawer in this prompt (W04/W05).
- Do not duplicate query keys — use the shared key factory.
- Do not hardcode workspace ids or slugs.

## Acceptance checks
- [ ] Login → dashboard renders real data from `/overview` in under 1 s.
- [ ] Workspace switcher changes the whole shell without a full reload.
- [ ] Sidebar collapses at 1024 px and 768 px breakpoints correctly.
- [ ] `⌘K` opens a placeholder palette; `?` shows the shortcuts sheet.
- [ ] Filters applied on My Day survive a page reload (they are in the URL).
- [ ] `features/_template` exists and copying it produces a compiling feature.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
