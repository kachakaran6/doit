# P-06 — Capture Sheet, Settings, Account

**Depends on** P-02 · **Branch** `feat/p-06-06-capture-settings`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `06-COMPOSITION.md` §6.4, §6.5
- `04-COLOUR-AS-INFORMATION.md` §4.2 (accent chips)
- `07-PLATFORM-CRAFT.md` §7.1
- `10-REVIEW.md`

## Goal
Turn the composer into a sheet, and make Settings and Account read as one product.

## Deliverables
- `patterns/CaptureSheet` on `@gorhom` with a pinned footer
- `features/settings/SettingsScreen` with one `SectionHeader` style
- `features/settings/AccountSheet` with the accent picker showing **colour swatches**
- quiet destructive styling for Log Out
- dark keyboard on every field

## Requirements
- Sheet: detents 0.5/0.9, footer pinned above the accessory bar, Cancel/Create right-aligned.
- Mode switch (Task/Bug/Sticky/Voice) as a `SegmentedControl`, not four bordered chips.
- Accent chips: 12px swatch + label, selected = L3 fill + accent text.
- Section headers: one style (`eyebrow` 11/600 +0.8 uppercase `textMuted`). Replace
  `Appearance` and `Quick Capture & Hardware Integration` with it.
- Log Out: a plain row with `danger` text, 44 tall, no border, no full-width outline.
- No 900px void under the footer — the sheet is a sheet.

## Do not
- Do not change any capture behaviour.
- Do not keep a full-page modal for the composer.
- Do not leave a section header in sentence case at 26px.

## Loop
Iterate until **≥ 18/24** each:
1. Capture: sheet at both detents, with keyboard open.
2. Settings and Account: full screens.
3. Score; fix the biggest failing line; re-render. Max 6.
- [ ] Keyboard open: footer visible, nothing covered, keyboard dark.
- [ ] Accent chips show five distinct swatches.
- [ ] Log Out is the quietest element on the screen, not the loudest.
- [ ] All three screens use the same section header.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
