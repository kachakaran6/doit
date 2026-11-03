# P-02 — Shell — Navbar, Insets, Sheets, Header

**Depends on** P-01 · **Branch** `feat/p-02-02-shell`
**Loop target** see §Loop below · **Max iterations** 6

## Load
- `02-SURFACE-SYSTEM.md` §2.5 (blur)
- `06-COMPOSITION.md` §6.8 (header)
- `07-PLATFORM-CRAFT.md` §7.1–7.4
- `10-REVIEW.md`

## Goal
Fix the frame: a navbar that floats without overlapping, insets that are computed once, sheets
whose footer is never covered, and one header anatomy.

## Deliverables
- `ui/NavBar` — 3 destinations + centre capture action, blur, soft shadow, no border
- `layout/useBottomInsets()` — the only source of bottom offsets
- `ui/Screen` — safe area + gutter + header slot + scroll slot + navbar slot
- `ui/ScreenHeader` — eyebrow + h1 + subtitle + trailing slot, centre-aligned
- `ui/Sheet` — `@gorhom`, detents 0.5/0.9, pinned footer, dark keyboard
- removal of the separate FAB
- `keyboardAppearance="dark"` on every `TextInput`

## Requirements
- Navbar: 64 tall, pill, 16 margins, `safe + 8` bottom, blur 40 behind `surface` at 92%, shadow
  `0 8px 32px rgba(0,0,0,0.55)`. **No border.**
- Three destinations (Home · capture · Search) plus a centre 56px accent circle that sits inside
  the pill — it must not overlap the pill's edge.
- Every scroll container applies `paddingBottom` from `useBottomInsets()`. No numeric bottoms.
- Sheet footer `paddingBottom` = accessory height + 12. Nothing is ever covered.
- Every input gets `keyboardAppearance="dark"` and `selectionColor={accent}`.
- Header: trailing slot centre-aligned with the title block.

## Do not
- Do not change routes or navigation structure.
- Do not leave the FAB anywhere.
- Do not hardcode an inset.

## Loop
Iterate the shell until **≥ 18/24**:
1. Screenshot a screen with the keyboard open and a screen scrolled to the end.
2. Score lines 9 (bottom resolves), 11 (optics), 12 (platform).
3. One fix per iteration, max 6.
- [ ] Keyboard open: nothing covered, keyboard is dark (screenshot).
- [ ] Scrolled to the end: last row clears the navbar.
- [ ] Navbar has no border and floats with a shadow.
- [ ] `rg "paddingBottom: [0-9]" src/features` → 0 hits.

## Output
Reply with: (1) a 5-line summary, (2) files changed, (3) the **iteration table** (iteration ·
score · biggest failing line · what you changed), (4) the final 12-point score, (5) screenshot
paths per iteration, (6) the `PROGRESS.md` diff.
