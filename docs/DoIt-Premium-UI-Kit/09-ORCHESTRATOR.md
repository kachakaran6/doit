# 09 — Orchestrator (loop-engineered)

Nine prompts. Each one runs as a **closed loop**: build → screenshot → score → fix → re-score →
stop. The loop is the point; a single pass will not reach the bar.

---

## 0. The loop protocol

Every prompt below executes the same five-step cycle. The agent must not exit the loop until the
exit condition is met or the iteration cap is hit.

```
┌─ 1. BUILD ─────────────────────────────────────────────┐
│   implement the prompt's scope                          │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─ 2. CAPTURE ───────────────────────────────────────────┐
│   render the screen(s) on the emulator/device           │
│   take the 6 required shots (10-REVIEW.md §10.6)        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─ 3. SCORE ─────────────────────────────────────────────┐
│   run the 12-point review (10-REVIEW.md §10.1)          │
│   record the score and the specific failing lines        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
                    score >= 18/24 ?
                     │            │
                    yes           no
                     │            │
                     ▼            ▼
              ┌─ STOP ─┐   ┌─ 4. DIAGNOSE ──────────────┐
                            │ name the single biggest     │
                            │ failing line                │
                            └────────┬────────────────────┘
                                     ▼
                            ┌─ 5. FIX ───────────────────┐
                            │ change only what that line  │
                            │ requires                    │
                            └────────┬────────────────────┘
                                     │
                                     └──► back to 2
```

**Loop rules**

1. **One fix per iteration.** Changing three things at once means you learn nothing from the score.
2. **Fix the biggest failing line first**, not the easiest.
3. **Max 6 iterations per screen.** If you are still under 18 after six, stop and report — it
   means the system is wrong, not the screen.
4. **Never edit the review criteria to pass.** The rubric is fixed.
5. **Keep every iteration's screenshot.** `docs/premium-review/<prompt>/iter-<n>/`. The diff
   between iteration 1 and the last one is the evidence that the loop worked.
6. **If two lines conflict**, the earlier-numbered line wins (ladder before colour, colour before
   density).

---

## 1. Phase map

```
P-00  Foundation: ladder, type, tokens, Surface/Text       ← blocks everything
  │
P-01  Primitives: Button, Field, Chip, Row, SectionHeader
  │
P-02  Shell: navbar, insets, sheet, header anatomy
  │
  ├── P-03  Home
  ├── P-04  Tasks (list + board)
  ├── P-05  Bug Queue + Search
  └── P-06  Capture sheet + Settings + Account
  │
P-07  Motion & response pass (all screens)
  │
P-08  Full review + sign-off
```

## 2. Prompt index

| ID | Title | Depends on | Loop target |
|---|---|---|---|
| P-00 | Surface ladder, type scale, tokens | — | gallery ≥ 20/24 |
| P-01 | Primitives | P-00 | gallery ≥ 20/24 |
| P-02 | Shell, navbar, insets, sheets | P-01 | shell ≥ 18/24 |
| P-03 | Home | P-02 | 18/24 |
| P-04 | Tasks list + board | P-02 | 18/24 each |
| P-05 | Bug Queue + Search | P-02 | 18/24 each |
| P-06 | Capture, Settings, Account | P-02 | 18/24 each |
| P-07 | Motion & response | P-03…P-06 | 100ms test passes |
| P-08 | Full review & sign-off | P-07 | every screen ≥ 18/24 |

P-03…P-06 may run in parallel after P-02 — they touch different files. Never run two prompts that
edit `components/ui/` at once.

## 3. Gates

### G-P0 — after P-00
- [ ] Four ladder levels exist and are visibly distinct at 25% zoom.
- [ ] `Surface` renders the inner highlight and no border.
- [ ] `Text` accepts only variants; a raw `fontSize` fails lint.
- [ ] Gallery shows the ladder, the type scale and the colour scales on one screen.

### G-P1 — after P-01
- [ ] Every primitive has all five states.
- [ ] No `ui/` component accepts `style` from a caller.
- [ ] Buttons 16 radius, cards 20, inputs 48 tall — measured.

### G-P2 — after P-02
- [ ] Navbar: 3 items + centre action, blur, no overlap with content.
- [ ] Every scroll container clears the navbar.
- [ ] Sheet footer sits above the keyboard accessory bar; nothing is covered.
- [ ] `keyboardAppearance="dark"` on every input.

### G-P3 — after P-06
- [ ] Six screens each score ≥ 18/24.
- [ ] The bottom third of every screen resolves.

### G-P4 — after P-08
- [ ] All eight screens ≥ 18/24.
- [ ] Squint, grayscale and thumbnail tests pass on Home and Tasks.
- [ ] 100ms response test passes.
- [ ] `assets/BEFORE-AFTER.png` regenerated with the new build.

## 4. What the agent must never do

- Add a border to a card.
- Use a colour outside the token file.
- Set `fontSize` or `fontWeight` outside a `Text` variant.
- Leave a screen ending at 45% with nothing below.
- Ship a screen without the six review screenshots.
- "Improve" the rubric to make a screen pass.

## 5. Escalation

Stop the loop and ask when:
- a fix would change the information architecture;
- the ladder cannot be made visible without changing the canvas colour the client already approved;
- a screen cannot reach 18/24 without new content (then it needs a data decision, not a visual one);
- two prompts would edit the same file.

## 6. Definition of done

A stranger screenshots Home and Tasks, puts them next to Linear and Things 3, and cannot tell
which one was built by a three-person team in a week.
