# P-03 — Home

**Depends on** P-02 · **Branch** `feat/p-03-03-home`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `06-COMPOSITION.md` §6.1, §6.5, §6.9
- `04-COLOUR-AS-INFORMATION.md` §4.4 (sticky tints)
- `10-REVIEW.md`

## Goal
Make Home a composed workspace: depth, colour where it means something, and a bottom third that
resolves.

## Deliverables
- `features/home/HomeScreen.tsx` rebuilt on `ui/Screen`
- project hero card (L1, radius 28) with three stat tiles (L2) using **numbers first**
- `Your Work` as **one card with divided rows**, not one card per task
- stickies as tinted, deterministically rotated cards
- a **recent activity** terminal block so the screen resolves
- skeleton, empty and error states

## Requirements
- Section headers use `ui/SectionHeader` (eyebrow + count + action). No `▾` carets.
- Stat tiles: number at `h2` 24/600, label at `label` 12 in `textSecondary`, coloured 8px dot.
  "1 sticky", not "1 Stickies".
- Task rows follow §6.3 exactly: ID, priority dot + name, due text, title, trailing avatar.
- Stickies: `rgba(accent,0.14)` background, 1px `rgba(accent,0.24)` border, `accentText` text,
  rotation from `hash(id)`.
- Recent activity: one L1 card, three divided rows, coloured 6px marker per action type.
- The bottom third is the activity block — no trailing void.

## Do not
- Do not redesign the information architecture.
- Do not leave a grey sticky.
- Do not use one card per task under a section header.

## Loop
Iterate until **≥ 18/24**:
1. Six screenshots per `10-REVIEW.md` §10.6.
2. Score all 12 lines; fix the biggest failing line; re-render.
3. Max 6 iterations.
- [ ] Squint test: three distinct levels visible.
- [ ] Grayscale test: priority dots and sticky tints still carry meaning.
- [ ] The screen resolves at the bottom (no void > 120px).
- [ ] Every section header is visually identical.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
