# W06 — Bugs, Sessions, Stickies on Web

**Lane** W · **Depends on** W05 · **Branch** `feat/w06-web-bugs-sessions-stickies`

## Load
- `09-PHASE2-RULES.md`
- `02-FEATURE-SPEC.md` (Phase 1) F5, F8, F9
- `06-API-CONTRACT.md` (Phase 1) §6.5, §6.6

## Goal
The triage surfaces: a bug queue that a lead can actually work, session reports, and the sticky
wall.

## Deliverables
- `features/bugs/` — `BugQueue`, `BugFilters`, `SeveritySummary`, session grouping
- `features/sessions/` — `SessionList`, `SessionReport` (timeline of bugs, severity split,
  device info, markdown export)
- `features/stickies/` — `StickyWall` (masonry, drag, recolour, convert-to-task)
- `/w/:slug/bugs`, `/w/:slug/sessions`, `/w/:slug/sessions/:id`, `/p/:key/stickies`

## Requirements
- Bug queue: table with columns (severity, title, app, device, session, age, assignee), sortable,
  filterable, keyboard-navigable with `j`/`k`. Bulk severity change and bulk assign.
- Severity summary strip at the top: counts per level as clickable filters.
- Session report: a vertical timeline of bugs in capture order, with the device block, the
  duration, and a "Download markdown" button. This is the artefact a tester sends to a client.
- Sticky wall: CSS-columns masonry, drag to reorder, hover recolour, `Convert to task` creating
  the task and linking both ways, with a toast that links to the new task.
- Everything reuses `TaskDrawer` for the detail view — no second implementation.

## Do not
- Do not build a separate bug detail page; open the drawer.
- Do not let the sticky wall lose position on reorder failure.
- Do not show severity colours that differ from mobile.

## Acceptance checks
- [ ] Bug queue with 100 bugs filters by severity + session in under 200 ms.
- [ ] `j`/`k` moves selection; `Enter` opens the drawer.
- [ ] Session report renders all its bugs in order and exports a correct markdown file.
- [ ] Sticky wall: convert to task → both linked → toast navigates to the task.
- [ ] Recolouring a sticky to each of the 5 accents works and persists.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
