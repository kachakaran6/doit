# W04 — Board — drag, filters, URL state, virtualisation

**Lane** W · **Depends on** W03 · **Branch** `feat/w04-web-board`

## Load
- `09-PHASE2-RULES.md`
- `02-WEB-ARCHITECTURE.md` §2.7
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.5 (`/board`, `/move`, `/bulk`)
- `02-FEATURE-SPEC.md` (Phase 1) F3, F4

## Goal
Build the kanban board — the screen a lead will live in. Drag between columns, filter, and
every state shareable by URL.

## Deliverables
- `features/board/` — `BoardScreen`, `Column`, `BoardCard`, `BoardToolbar`, `BulkActionBar`
- drag with `@dnd-kit` including the **keyboard sensor**
- view switch: board / list (virtualised) / compact
- `PATCH /tasks/:id/move` wiring with optimistic update and rollback
- multi-select with shift-click + `BulkActionBar` calling `POST /tasks/bulk`
- URL state: `?status=&priority=&label=&assignee=&q=&sort=&view=`

## Requirements
- Columns: TODO / IN PROGRESS / BLOCKED / DONE, with WIP count in the header and an "add card"
  composer at the bottom of each.
- Drag must be atomic: one `PATCH /move` per drop carrying `{status, beforeId, afterId}`. On
  failure, the card animates back and a toast explains.
- Keyboard drag: focus a card, `Space` to pick up, arrows to move, `Space` to drop, `Esc` to
  cancel. Announce moves via an ARIA live region.
- Optimistic updates everywhere; the board must feel instant on a 300-card project.
- Card content: title, human id (`SMP-42`), priority dot, labels, assignee avatar, due chip
  (danger when overdue), checklist progress, bug indicator.
- Hover reveals: open, assign, move menu. Never permanently visible.
- Filters are chips in the toolbar; each chip is removable; "Clear all" appears when any is set.
- Column collapse, and a horizontal scroll that never traps the page scroll.

## Do not
- Do not implement drag with HTML5 drag events — they are inaccessible and janky.
- Do not fetch per column — one `/board` call.
- Do not lose the scroll position when the drawer opens.
- Do not allow a TESTER to see delete/bulk-delete controls.

## Acceptance checks
- [ ] 300 cards: board interactive in under 1 s; drag at 60 fps.
- [ ] Drag across columns persists after reload.
- [ ] Keyboard-only: move a card between columns without a mouse.
- [ ] Filters + sort survive reload and are shareable via URL.
- [ ] Shift-click selects a range; bulk status change works and is optimistic.
- [ ] A TESTER sees no delete controls; an ADMIN does.
- [ ] Simulated API failure rolls the card back with a toast.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
