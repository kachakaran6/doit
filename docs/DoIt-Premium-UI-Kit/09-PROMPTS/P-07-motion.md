# P-07 — Motion and Response

**Depends on** P-03, P-04, P-05, P-06 · **Branch** `feat/p-07-07-motion`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `05-MOTION.md` (the whole file)
- `10-REVIEW.md` §10.5

## Goal
Make it feel alive: every tap answers in under 100ms, everything settles with physics.

## Deliverables
- `hooks/usePressScale` — the press primitive, applied to every tappable
- `Arrive` stagger on list mounts (max 6 items, 20ms)
- checkbox/tab/selection `Settle` spring
- two shared elements: row → sheet, sticky → editor
- haptics at the five specified moments
- skeletons replacing every spinner
- reduced-motion handling

## Requirements
- Press: scale 0.97, 90ms, plus an L3 overlay at 60%.
- Springs for finger-released motion (`damping 20, stiffness 200`); timings for system-driven.
- Nothing exceeds 320ms.
- Only `transform` and `opacity` are animated.
- Skeletons match the real row layout; no centred spinners anywhere.
- Haptics never on scroll or mount.

## Do not
- Do not add decorative animation.
- Do not animate `height` or `top`.
- Do not use a linear curve for anything touch-driven.

## Loop
Loop on the **100ms test**:
1. Record at 60fps; tap every interactive element.
2. Any response later than 6 frames is a failure — fix that one element.
3. Repeat until zero failures.
- [ ] 100ms test: zero failures across all screens.
- [ ] Scroll at 60fps on a mid-range Android.
- [ ] Reduced motion disables springs but keeps layout.
- [ ] No spinner exists in the codebase (`rg "ActivityIndicator"` → 0).

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
