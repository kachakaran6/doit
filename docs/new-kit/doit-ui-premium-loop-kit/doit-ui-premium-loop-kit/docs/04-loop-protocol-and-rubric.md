# 04 — The Loop Protocol & Scoring Rubric

> Quality comes from iterating against **evidence**, not from one big rewrite. The agent must *look at real screenshots* every iteration.

## 1. The loop (per screen or per component group)
```
┌─► CAPTURE   screenshot (PNG) + uiautomator XML, dark AND light, accent Blue + one other
│   AUDIT     python3 scripts/ui_audit.py (layout bugs)  +  python3 scripts/contrast.py (tokens)  +  token lint
│   CRITIQUE  open the image; write findings against the rubric (cite audit IDs A1…F5 and rubric dims)
│   SCORE     0–5 per dimension, total /50, with one-line justification each
│   PLAN      pick the top 3–5 defects by impact (hierarchy → spacing → type → color → polish)
│   FIX       change tokens/primitives first, screens last; no raw values
│   VERIFY    typecheck + lint + token lint + tests
└── RECAPTURE ──► compare before/after (scripts/contact_sheet.py) ──► repeat
EXIT when: automated audit has 0 ERRORs, no dimension < 4, average ≥ 4.3 on that screen,
           contrast script 0 fails, dark + light both pass. Max 6 iterations per screen; then escalate with notes.
```
Each iteration logs one row in `docs/UI_LOOP_LOG.md`:
`iteration | screen | before score | after score | defects fixed (IDs) | defects remaining | evidence paths`.

## 2. Mandatory visual checks (do them, don't skip)
- **Squint test**: blur/downscale the screenshot — is there one clear focal point and a clear order of reading?
- **Grayscale test**: convert to grayscale — does hierarchy still work (weight/tone, not hue)?
- **5-second test**: can a stranger say what the screen is for and what the primary action is?
- **Alignment sweep**: left edges line up on one x; right edges line up; icon/text baselines consistent.
- **Dead-space sweep**: any region > 35% empty without purpose?
- **Dark/light parity**: same layout, both polished.
- **Large font (200%)** and **small phone (360×640)**: nothing clips or overlaps.
- **Reference comparison**: place next to `reference/TARGET-plane-home-dark.jpg` (structure) and the design spec (docs 02–03).

## 3. Rubric (0–5; descriptors for 1 / 3 / 5)
| # | Dimension | 1 (bad) | 3 (acceptable) | 5 (premium) |
|---|---|---|---|---|
| 1 | **Hierarchy** | everything same weight, no focal point | clear title, some grouping | one focal point; order of reading obvious in 2 s |
| 2 | **Spacing & rhythm** | irregular, flush edges, dead zones | mostly on grid | strict 4-pt grid, one margin, balanced whitespace |
| 3 | **Typography** | many sizes, caps labels, oversized | single scale, mostly consistent | weight-led hierarchy, tight tracking on titles, tabular numbers |
| 4 | **Color & contrast** | flat/washed, accent overused, fails AA | consistent palette, AA mostly | tonal depth, accent sparing, AA everywhere, semantic colors systematic |
| 5 | **Surfaces & depth** | border-on-everything | some tonal depth | borderless tonal layers, soft shadows only where floating |
| 6 | **Iconography & imagery** | mixed sets/weights | one set | consistent stroke, optical alignment, tasteful illustrations |
| 7 | **Component consistency** | one-offs per screen | shared components mostly | every pattern from the kit; zero one-offs |
| 8 | **Motion & feedback** | none/jarring | basic press states | springs, gestures, haptics, interruptible, reduced-motion safe |
| 9 | **States & content** | missing empty/loading/error, test copy | present but plain | designed, human copy, realistic data |
| 10 | **Platform polish** | insets/keyboard/back glitches | works | edge-to-edge, keyboard-synced, system back, no clipping at 200% font |
Total /50. Screen passes at ≥ 43 with no dimension < 4.

## 4. Automated checks
| Check | Command | Must be |
|---|---|---|
| Layout audit (edge-flush text, overlap, clipping, 48dp targets) | `python3 scripts/ui_audit.py shots/<screen>.xml --density $(adb shell wm density …)` | 0 ERROR (review WARN) |
| Palette contrast | `python3 scripts/contrast.py templates/premium-tokens.json` | 0 failures |
| Token lint | repo's `check-tokens` script (no raw colors/sizes/durations in screens) | 0 violations |
| Typecheck / lint / tests | `pnpm typecheck && pnpm lint && pnpm test` | pass |
| Before/after sheet | `python3 scripts/contact_sheet.py shots/before shots/after review.png` | attach to log |
| Perf | scroll/gesture fps (see kit-ui doc 07) | ≥ 58 fps mid-range |

## 5. Human gates
After **L3 (shell+primitives)**, **L5 (key screens)** and **L7 (polish)**: produce a contact sheet and a 60 s screen recording; stop and wait for the owner's approval. Taste is validated by a person; the rubric prevents regressions and obvious flaws.

## 6. Anti-patterns that made it look cheap (never reintroduce)
Borders on every card · caps+tracking labels · many button styles · lavender-on-dark links · full-screen forms with all fields visible · duplicate controls for one action · developer data in user UI · skewed/rotated cards · text flush to edges · oversized regular-weight titles · icon-in-tinted-square empty states · "All clear!" exclamation copy.

## 7. Evidence rule
No "done" without: before/after contact sheet, audit output, rubric table, and a note of anything unverified (e.g., "not tested on Samsung One UI").
