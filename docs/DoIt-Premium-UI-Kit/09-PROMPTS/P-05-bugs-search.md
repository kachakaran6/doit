# P-05 — Bug Queue and Search

**Depends on** P-02 · **Branch** `feat/p-05-05-bugs-search`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `06-COMPOSITION.md` §6.6 (empty states)
- `04-COLOUR-AS-INFORMATION.md` §4.3 (severity)
- `10-REVIEW.md`

## Goal
Make the two sparsest screens feel designed rather than unfinished.

## Deliverables
- `features/bugs/BugQueueScreen` — severity chips, rows, empty state
- `features/search/SearchScreen` — field, operator chips, empty state with illustration
- `ui/EmptyState` used on both
- one severity vocabulary (`Cosmetic`, not `Trivial`)

## Requirements
- Bug queue empty state: bare 64 icon, `h3` title, one line of body, one action, optically centred
  between the filter row and the navbar.
- Severity chips: Blocker is the only filled badge; the rest are tinted pills.
- Search: the empty state is the primary content — illustration + title + one line + operator hint.
  Not a bare sentence in a void.
- Search field is 48 tall, radius 12, with `selectionColor` set and a 20px leading icon.

## Do not
- Do not add features.
- Do not leave the search screen as text floating in space.
- Do not use two names for one severity level.

## Loop
Iterate until **≥ 18/24** each:
1. Capture the empty state and a populated state for both.
2. Score; fix the biggest failing line; re-render. Max 6.
- [ ] Empty states are optically centred, not top-aligned.
- [ ] No grey rounded square behind an empty-state icon.
- [ ] Severity vocabulary matches the spec exactly.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
