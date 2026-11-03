# P-08 — Full Review and Sign-off

**Depends on** P-07 · **Branch** `feat/p-08-08-review`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `10-REVIEW.md` (the whole file)
- `01-PREMIUM-PRINCIPLES.md`
- `00-DIAGNOSIS.md` — the 20 observations, to confirm each is closed

## Goal
Run the gate on every screen and prove the app reached the bar.

## Deliverables
- the 12-point score for all 8 screens
- six screenshots per screen, per §10.6
- squint / grayscale / thumbnail / 100ms test results
- a regenerated `assets/BEFORE-AFTER.png` from the current build
- `docs/PREMIUM-SIGNOFF.md`

## Requirements
- Score every screen honestly against §10.1. A screen below 18 goes back to its prompt — do not
  sign with a known failure.
- Confirm each of the 20 observations in `00-DIAGNOSIS.md` is closed, with a screenshot.
- Run the three visual tests on Home and Tasks.
- Compare side by side with a reference app at the same scale and answer the three questions from
  §10.7 in writing.

## Do not
- Do not re-score generously.
- Do not skip a screen because it "looks fine".
- Do not declare done without the before/after image.

## Loop
Final loop:
1. Score all 8 screens.
2. For any screen < 18, return to its prompt and run its loop again.
3. Re-score. Repeat until all ≥ 18 or the iteration cap is hit.
- [ ] All 8 screens ≥ 18/24.
- [ ] All 20 diagnosis observations closed with evidence.
- [ ] Squint, grayscale and thumbnail tests pass on Home and Tasks.
- [ ] `BEFORE-AFTER.png` regenerated.
- [ ] `docs/PREMIUM-SIGNOFF.md` committed.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
