# P-01 — Primitives

**Depends on** P-00 · **Branch** `feat/p-01-01-primitives`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `03-TYPE-SYSTEM.md`, `04-COLOUR-AS-INFORMATION.md`
- `06-COMPOSITION.md` §6.3 (row anatomy)
- `08-IMPLEMENTATION.md` §8.2, §8.4
- `10-REVIEW.md`

## Goal
Build the component set everything else composes from, so screens stop inventing styles.

## Deliverables
- `ui/Button` (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16)
- `ui/IconButton` (40×40, radius 12)
- `ui/Field` (48 tall, radius 12, label above, error state, `selectionColor` = accent)
- `ui/Chip` (32 tall, pill, selected = filled L3 + accent text — **not an outline**)
- `ui/AccentChip` (12px colour swatch + label)
- `ui/Row` — the §6.3 anatomy: 44 checkbox column, meta row, title, labels, trailing avatar
- `ui/Checkbox` (28 visual, 44 hit area)
- `ui/PriorityDot`, `ui/DueText`, `ui/SeverityBadge`, `ui/LabelPill`
- `ui/Avatar`, `ui/WorkspaceTile` (both via `accentFor`)
- `ui/SectionHeader` (eyebrow + count pill + optional action)
- `ui/EmptyState` (bare 64 icon, **no rounded container**)
- `ui/Skeleton` (matches the real row layout)
- gallery entries for every variant × state

## Requirements
- All five states on every interactive component: rest, pressed (scale 0.97/90ms + L3 overlay),
  focused, disabled, loading.
- Selected chips fill `L3` and colour the text with the accent. **No accent borders anywhere.**
- Row: min height 96 (124 with labels), 16 padding, 12 gap between meta and title.
- EmptyState icon is bare at 64 in `textMuted`. The grey rounded square reads as a disabled
  button — remove it.
- No `ui/` component accepts `style` or `className` from a caller.
- Every colour, radius, gap and font comes from the token layer.

## Do not
- Do not touch screens.
- Do not add a variant that is not specified.
- Do not use a border to indicate selection.

## Loop
Gallery iteration until **≥ 20/24**:
1. Render the gallery in dark + light.
2. Score lines 2 (no card borders), 4 (colour means something), 10 (states).
3. One fix per iteration, max 6.
- [ ] Every component × variant × state renders.
- [ ] A selected chip is filled, not outlined (screenshot proof).
- [ ] Checkbox hit area measures 44.
- [ ] Passing `style` into `ui/Button` fails lint.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
