# W07 — Search, Command Palette, Notifications

**Lane** W · **Depends on** W06 · **Branch** `feat/w07-web-search-command-palette`

## Load
- `09-PHASE2-RULES.md`
- `06-API-CONTRACT.md` (Phase 1) §6.9
- `02-FEATURE-SPEC.md` (Phase 1) F12, F14
- `03-WEB-DESIGN-SYSTEM.md` §3.5

## Goal
Make the app navigable at speed: a real search page and a `⌘K` palette that becomes the primary
way power users move.

## Deliverables
- `features/search/` — `SearchScreen`, `ResultGroup`, `SearchFilters`, `RecentSearches`
- `components/patterns/CommandPalette.tsx` using `cmdk`
- `features/notifications/` — inbox dropdown + a full page, mark-read, deep links
- operator chips in the search field (`#label`, `@assignee`, `is:bug`, `due:today`)

## Requirements
- Palette sections: Navigate (routes, projects), Actions (create task, create bug, switch
  workspace, toggle theme, change accent), Recent (recently viewed tasks/bugs), Search results.
- Debounced 200 ms, cancel in-flight requests, keyboard-first (arrows + Enter).
- Search results grouped by type with the matched snippet highlighted (`<mark>` from the API).
- Notifications: unread badge on the topbar avatar, dropdown shows the last 10, page shows all
  with pagination, `Mark all read`.
- Deep links from a notification open the right drawer over the right board.

## Do not
- Do not build a second search implementation for the palette — reuse the same query hook.
- Do not run a search on every keystroke without debounce and abort.
- Do not make the palette modal-only — it must be dismissible with `Esc` and restore focus.

## Acceptance checks
- [ ] `⌘K` opens the palette in under 100 ms; typing filters live.
- [ ] Arrow keys + Enter navigate; `Esc` closes and restores the previous focus.
- [ ] A search with 3 operators returns the right subset and highlights matches.
- [ ] Unread badge matches the API count; "Mark all read" clears it everywhere.
- [ ] A notification deep-links to the exact bug and opens the drawer.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
