# 02 — Premium Design Language (the "Apple feel", made measurable)

Study (don't copy): **Apple Reminders/Notes/Settings, Things 3, Linear (mobile), Craft, Fantastical, Notion Calendar, Arc**. What they share: few colors, strong typographic hierarchy, tonal surfaces, generous but disciplined spacing, motion with physics, restraint.

## 1. Principles (priority order)
1. **Content first** — chrome recedes. One focal point per screen.
2. **Tone over lines** — depth from surface steps and soft shadow; hairlines only inside lists.
3. **Weight-led hierarchy** — size changes are small; weight and tone do the work (semibold titles, regular body, tertiary meta).
4. **One accent, used sparingly** — only for the primary action, selection and links.
5. **Rhythm** — 4-pt grid, one horizontal margin (20) on every screen, consistent section gaps.
6. **Information density with calm** — rows show useful meta (priority, due, labels, assignee) in a quiet second line.
7. **Motion = physics** — springs, press scale, gesture-driven sheets (see `kit-ui` motion docs).
8. **Everything is a token.** If a value isn't in the token file, it doesn't ship.

## 2. Color system (dark default, light equal) — see `templates/premium-tokens.json`
Surface ramp (dark): `canvas #0B0B0E → surface1 #141418 → surface2 #1C1C22 → surface3 #25252C`.
Each step is a clear but soft jump (~5–8% luminance). Cards sit on canvas using `surface1`; sheets/nav use `surface2`; pressed/selected/input fills use `surface3`.
Light: `canvas #F4F4F7`, cards pure white `#FFFFFF` with a soft shadow, `surface2 #F0F0F4` for inputs/chips.
Text: primary / secondary / tertiary (3 levels only). Tertiary is for meta, never for essential info.
Accent: **default Blue (matches the new logo)**; 5 options (Blue, Violet, Green, Orange, Rose). Each accent has `fill` (buttons, white text ≥ 4.5:1), `text` (links/selected labels on that mode's surface ≥ 4.5:1), `soft` (tinted background ≈ 14–16% alpha). **Never use fill color for text on dark; use the lighter `text` variant.**
Semantic: success/warning/danger each with `fill`, `text`, `soft`. Priority: urgent=danger, high=orange/warning, medium=accent-soft/yellow, low=tertiary. Bug severity: critical=danger, major=warning, minor=amber-soft, trivial=neutral.
Run `python3 scripts/contrast.py templates/premium-tokens.json` after any change: 0 failures required.
Ban list: pure `#000`/`#FFF` text on pure surfaces (use token text colors), saturated neon, gradients on surfaces (gradient only on the logo, hero progress ring, and primary FAB glow), per-component custom colors.

## 3. Typography (Inter; no SF Pro on Android)
| Style | Size/Line | Weight | Use |
|---|---|---|---|
| largeTitle | 30/36 | 700, tracking −0.5 | screen title (collapses on scroll) |
| title | 22/28 | 600 | sheet titles, section heroes |
| headline | 16/22 | 600 | row title, card title, button |
| body | 15/21 | 400 | descriptions, inputs |
| subhead | 14/19 | 400–500 | secondary lines |
| meta | 12.5/16 | 500 | due, priority, ids (tabular numbers) |
| caption | 12/16 | 500 | chips, badges |
| tab | 11/13 | 600 | nav labels (active only) |
Rules: **sentence case everywhere** (no caps labels), max 2 weights per screen region, row titles one line with ellipsis (two lines only in detail), numbers tabular, respect font scale to 200% (layouts must reflow, not clip).

## 4. Spacing & layout
4-pt grid: 4, 8, 12, 16, 20, 24, 32, 40. Screen horizontal margin **20** (every screen, via `Screen` primitive only). Card padding 16. Row min height 56 (with meta line) / 48 (single line). Section gap 28. Header top gap 8 below status bar. Bottom padding accounts for floating nav (nav height + 24 + inset). No hard-coded numbers in screens.
Dead-space rule: if > 35% of a screen is empty, add a purposeful element (hero, suggestion, illustration) or let content scale up; empty states are centered at optical center (≈ 40% from top).

## 5. Shape & depth
Radii: card 20, sheet-top 28, input 14, button 14 (height 52 primary / 44 secondary), chip pill, avatar circle or 10 for workspace tile, FAB circle. Large surfaces use continuous (squircle) corners where supported.
Depth recipe: dark = tone only (+ floating elements get a soft shadow `0 8 24 rgba(0,0,0,.45)` and a 1px inner top highlight rgba(255,255,255,.06)); light = white card + `0 1 2 rgba(0,0,0,.04), 0 8 24 rgba(0,0,0,.06)`.
**Borders**: none on cards/chips/buttons. Allowed: hairline separators inside grouped lists (inset 16 from the left text edge), focus ring on inputs (accent 1.5), and the glass nav's 0.5px edge.

## 6. Iconography
One set (Phosphor Regular or Ionicons outline), 22–24px, consistent 1.75 stroke feel, filled variant for active tab. Icons live in 44px targets. Bug icon simplified. Priority and state use dedicated glyphs (flag levels, circle states) + color, never color alone.

## 7. Components (build once, use everywhere)
`Screen`, `LargeHeader`, `Section` (title + optional action), `GroupedList` + `Row`, `Card`, `Button` (primary/secondary/tinted/plain/destructive), `Chip` (tonal filled; selected = accent soft + accent text), `Segmented`, `Checkbox` (circle), `Avatar`, `Badge`, `ProgressRing`, `EmptyState`, `Skeleton`, `Toast`, `Sheet` (detents), `GlassNav`, `Fab`, `KeyboardBar`, `PropertyRow`. Anything new must be added here first.

## 8. Voice & microcopy
Sentence case, human, short. "Nothing due today" not "All clear for today!"; "Report a bug" not "Report a Bug"; real names ("Alice") never "Active User"; no developer jargon in user UI; destructive actions say what happens ("Log out of DoIt?").

## 9. Motion & feedback (summary; details in `kit-ui/docs/03-motion-and-haptics.md`)
pressIn scale 0.97 + spring back; sheets 1:1 drag with detents; checkbox completion animation + success haptic + row slides to Done; nav pill thumb slides; list insert/remove layout animation ≤ 250 ms; skeleton → content cross-fade; Reduce Motion respected.

## 10. Dark/Light parity & accents
Every screen reviewed in dark and light and in 2 accents (Blue + one other). Accent change must not change layout or contrast pass/fail.
