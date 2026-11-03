# 10 — The Premium Review

This is the gate. It is not a lint rule — it is a visual judgement made against a fixed standard,
on screenshots, every time.

---

## 10.1 The 12-point review

Score each screen 0–2 per line (0 = absent, 1 = partial, 2 = right). **18/24 is the pass mark.**
Anything below means the screen is not done.

| # | Check | What "2" looks like |
|---|---|---|
| 1 | **Ladder** | You can count 3+ distinct surface levels without squinting |
| 2 | **No card borders** | Cards are separated by lightness + highlight only |
| 3 | **One accent** | The accent appears on ≤3 elements: primary action, active nav, one link |
| 4 | **Colour means something** | Every coloured pixel carries information; nothing is decorative |
| 5 | **One weight jump** | Title 600, content 400/500 — nothing else is bold |
| 6 | **Tracking** | Large text looks tight, small caps look open |
| 7 | **Rhythm** | Gaps come from the 4pt scale; no one-off margins |
| 8 | **Density** | Every row carries 4+ information elements |
| 9 | **The bottom resolves** | The screen has a deliberate ending, not a trailing void |
| 10 | **States** | Press, selected, disabled, empty and loading all look designed |
| 11 | **Optics** | Title, action and first card share one left edge; header action is centre-aligned |
| 12 | **Platform** | Keyboard is dark, status bar matches, safe areas respected |

## 10.2 The squint test

Blur the screenshot by 10px (or squint). You should see:

- three distinct levels of lightness,
- one clear focal point,
- no bright rectangle competing with the primary action.

If the blurred image looks like uniform mush, the ladder is too shallow. If two areas glow equally,
there are two primaries.

## 10.3 The grayscale test

Desaturate the screenshot. If the screen loses no meaning, colour was decoration. If it loses
priority/severity/state information, colour is doing its job.

## 10.4 The thumbnail test

Shrink to 25%. At that size:

- the title should still be readable as a shape,
- the primary action should still be findable,
- the layout should still look intentional.

If it turns into grey soup, contrast between levels is too low.

## 10.5 The 100ms test

Record the screen at 60fps and tap each interactive element. Every tap must produce a visible
change within 6 frames (100ms). Anything slower reads as broken.

## 10.6 Before / after, mandatory

Every screen prompt must produce:

| Shot | Purpose |
|---|---|
| before | from the current build |
| after — dark, accent 1 | the default state |
| after — dark, accent 3 (amber) | proves the palette holds |
| after — light | proves the ladder mirrors |
| after — empty state | proves the state exists |
| after — keyboard open (composers) | proves nothing is covered |

Six screenshots per screen. Store in `docs/premium-review/<prompt>/`.

## 10.7 The reference test

Put your screenshot next to Linear's mobile app at the same scale. Ask three questions:

1. Which one has more visual noise?
2. Which one has a clearer focal point?
3. Which one would you pay for?

You will not match Linear on the first pass. But if the answer to #1 is "mine", the ladder or the
borders are wrong. If #2 is "theirs", the type hierarchy is wrong.

## 10.8 Sign-off

| Screen | Score /24 | Reviewed by | Date |
|---|---|---|---|
| Home | | | |
| Tasks (list) | | | |
| Tasks (board) | | | |
| Bug Queue | | | |
| Search | | | |
| New Task sheet | | | |
| Settings | | | |
| Account sheet | | | |

The build is not shippable until every row is ≥18.
