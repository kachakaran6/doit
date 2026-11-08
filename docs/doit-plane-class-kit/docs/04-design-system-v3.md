# 04 — Design System v3 (Plane-class density + Apple-grade polish)

Builds on `kit-premium` tokens (`templates/premium-tokens.json`, contrast-verified). What changes after seeing the 38 screens:

## 1. Depth: tone **plus a hairline** (fixes flat cards)
In the screenshots cards are only ~4% lighter than the canvas, so structure is hard to read. Plane keeps subtle borders. New rule:
- **Cards/sheets/inputs**: `surface1` + **1px hairline (6–8% white in dark, 8% black in light)**. Rows inside cards: inset dividers (start at the text edge). Floating (nav, FAB, menus): soft shadow + hairline.
- Never heavy/high-contrast borders; never borders on chips/badges (tonal fills).
- Raise dark `surface1` slightly (e.g., `#15151A`) if needed; re-run `scripts/contrast.py`.

## 2. Work-item row anatomy (the core of "professional")
```
[state icon 18]  Title (16/22, 1 line, ellipsis)                      [assignee stack 20]
                 GEN-12 · [priority icon] · Nov 12 · (label chip)(label chip)(+2)
```
- State icon by **group**: backlog (dashed circle), unstarted (circle), started (half), completed (check), cancelled (x) — color from tokens; tap target 44px toggles done.
- Priority = icon (4 bars/flag) + color, never "[HIGH]" text. Dates: relative ("Today", "Tomorrow", "Overdue 2d" in danger). Labels: tonal chips, max 2 + "+N". Type marker only for bugs (small bug glyph) — **bugs and tasks are visually distinct**.
- Density setting: Comfortable (2 lines) / Compact (1 line with trailing meta).
- Checkbox shape consistent: **circle everywhere** (board included).

## 3. Properties as a system
Same `PropertyRow` (icon, label, value, chevron) and the same picker sheets for State, Priority, Assignee, Labels, Start date, Due date, Estimate, Cycle, Module, Parent — used by detail, create, bulk, and filters.

## 4. Typography & headers
Scale from kit-premium (largeTitle 30/700, title 22/600, headline 16/600, body 15, meta 12.5). **Sentence case only** — remove "NO DATE", "TODAY", "ACCOUNT", "ATTACHMENTS (0)" caps headers. One **header pattern**: back button (same tonal circle everywhere) + large title collapsing to compact; subtitle = project switcher. Counts as tabular tonal pills.

## 5. Controls
- **Switch**: track = accent fill when on; thumb white; off = surface3. (Fix blue-track/teal-thumb mismatch.)
- **Accent swatches**: 28px circles with a check + ring on the selected one; include Blue as default (matches logo): Blue, Violet, Green, Orange, Rose.
- **Segmented control**: sliding thumb, selection haptic.
- **Buttons**: primary (accent fill, white text ≥ 4.5:1), secondary (tonal), plain (accent text), destructive (danger text/tonal) — max one primary per screen.
- **Chips**: tonal filled; selected = accent soft + accent text; filter chips with counts.
- **Inputs**: surface2 fill, 14 radius, visible 1px hairline, focus ring accent 1.5; **every input must be visibly an input** (fixes missing API-key/context editors).
- **Sheets**: bottom sheets with detents for pickers/switchers/create; dialogs only for confirmations. Workspace/project switchers become sheets.

## 6. Icons & illustrations
One set (Phosphor/Ionicons outline), 22–24px; custom state/priority glyph set; monochrome line illustrations for empty states (not icon-in-tile); sticky cards use pastel tints.

## 7. Motion & haptics
Per `kit-ui` (springs, press scale, sheet physics, checkbox completion animation, list layout animations, reduce-motion). Skeletons match row anatomy.

## 8. Accessibility & performance
AA contrast in all 10 combos, 48dp targets, 200% font, TalkBack labels, reduce motion/transparency; ≥ 58 fps on mid-range phones; effect tiers Full/Balanced/Lite.

## 9. Brand
Use the new logo set (`doit-brand-assets`). Product name only via wordmark/asset (never plain-text "DoIt" in Inter → "Dolt"); launcher label "DoIt" (verify rendering); About shows wordmark + "by Samyukt".

## 10. Copy
Plain, human, sentence case. "Nothing due today", "No bugs yet — shake your phone to report one", real names (never "Active User"), no slugs/IDs exposed, no dev jargon.
