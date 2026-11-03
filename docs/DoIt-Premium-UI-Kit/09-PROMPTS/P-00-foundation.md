# P-00 — Foundation — Surface Ladder, Type Scale, Tokens

**Depends on** nothing · **Branch** `feat/p-00-00-foundation`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `02-SURFACE-SYSTEM.md` (the whole file)
- `03-TYPE-SYSTEM.md` (the whole file)
- `01-PREMIUM-PRINCIPLES.md` P1, P3
- `10-REVIEW.md` §10.1

## Goal
Replace the flat single-grey system with a four-step surface ladder and a real type scale. This
is the change that makes everything after it look expensive.

## Deliverables
- `packages/design-tokens/src/theme.css` — the ladder, text levels, radius-by-role, spacing
- `packages/design-tokens/src/type.ts` — the scale with **size-specific tracking**
- `components/ui/Surface.tsx` — ladder level prop + inner top highlight, no border
- `components/ui/Text.tsx` — variant-only API (`display|h1|h2|h3|body|bodyStrong|bodySmall|label|eyebrow|numeric`)
- `components/ui/Divider.tsx` — inset divider for in-card separation
- `app/dev/FoundationGallery.tsx` — ladder, type scale and colour scales on one screen
- lint rule: `fontSize` / `fontWeight` / `fontFamily` outside `Text.tsx` fails

## Requirements
- Ladder: L0 `#08090A`, L1 `#0F1012`, L2 `#16181B`, L3 `#1D2024` (dark); mirrored in light per
  `02-SURFACE-SYSTEM.md` §2.1.
- `Surface` renders a 1px `rgba(255,255,255,0.06)` highlight along the top edge, inset by the
  radius. **No border.**
- Radius by role: sm 12, md 16, lg 20, xl 28, pill 999.
- Type: tracking is computed from size (`03-TYPE-SYSTEM.md` §3.2 rule 2). Implement it as a
  function, not a hardcoded table, so a new size cannot skip it.
- `numeric` variant sets `fontVariant: ['tabular-nums']`.
- Load only Inter 400/500/600 — remove 700 from the bundle so it cannot be used accidentally.

## Do not
- Do not touch any screen yet.
- Do not keep the old token file as a fallback.
- Do not allow a component to pass a raw colour.

## Loop
Gallery iteration until **≥ 20/24**:
1. Render `FoundationGallery` in dark.
2. Score lines 1 (ladder), 5 (weight), 6 (tracking).
3. Fix the biggest failing line. Re-render.
4. Repeat, max 6.
- [ ] At 25% zoom the four ladder levels are distinguishable.
- [ ] Blurred by 10px, the gallery still shows three type levels.
- [ ] A raw `fontSize` in any component fails lint (prove it, revert).
- [ ] Every surface has the highlight and zero borders.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
