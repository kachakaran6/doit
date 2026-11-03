# P-04 — Tasks — List and Board

**Depends on** P-02 · **Branch** `feat/p-04-04-tasks`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `06-COMPOSITION.md` §6.3, §6.7, §6.8
- `04-COLOUR-AS-INFORMATION.md` §4.3
- `10-REVIEW.md`

## Goal
Make the task list dense and calm, and the board free of nested borders.

## Deliverables
- `features/tasks/TaskListScreen` on `ui/Screen`
- `patterns/TaskRow` per §6.3 (44 checkbox column, meta row, 2-line title, labels, avatar)
- board: columns as L1 surfaces (no border), cards as L2 (no border), 280 wide
- header: eyebrow + h1 + `SegmentedControl` (List | Board) in the trailing slot
- filter chips: selected = filled L3 + accent text
- done rows: strikethrough + `textMuted`

## Requirements
- Row min height 96 / 124 with labels. Two heights only.
- Priority: dot + label in the priority colour. Due: `Overdue` red, `Today` amber, else secondary.
- Board columns: no border, radius 20, padding 12; cards radius 16, padding 12, gap 8.
- The list must reach the navbar when there are 6+ rows; with fewer, add a terminal block or
  centre the empty state.
- Header trailing slot centre-aligned with the title.

## Do not
- Do not change the data layer or filters.
- Do not use a variable row height.
- Do not nest a bordered card inside a bordered column.

## Loop
Iterate each screen (list, board) until **≥ 18/24**:
1. Render 6 rows minimum for the list; 3 columns for the board.
2. Score; fix the biggest failing line; re-render. Max 6 each.
- [ ] Rows measure exactly 96 or 124.
- [ ] Checkbox column x-position identical across rows.
- [ ] Four priorities render four distinct colours.
- [ ] Board has zero borders (screenshot).

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
