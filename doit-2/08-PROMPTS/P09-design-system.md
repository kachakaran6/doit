# P09 — Design System, Theme Engine, Component Gallery

**Lane** B · **Depends on** P00 · **Branch** `feat/p09-design-system`

## Load
- `09-AGENT-RULES.md`
- `03-DESIGN-SYSTEM.md` (whole file — this prompt implements it)
- `04-ARCHITECTURE.md` §4.3

## Goal
Build the complete design system as code, and a gallery screen that renders every component in
every theme and accent. After this prompt, no screen ever needs to invent a style.

## Deliverables
- `packages/design-tokens/src/tokens.ts` — the full token set from `03-DESIGN-SYSTEM.md`,
  typed, with the five accents and both themes, and contrast ratios as comments
- `apps/mobile/src/theme/ThemeProvider.tsx` + `useTheme.ts` — resolves `system|light|dark` and
  `indigo|teal|amber|rose|violet`, persists to MMKV, hydrates **before first paint**
- `apps/mobile/src/components/ui/` — every component in §3.2
- `apps/mobile/src/app/dev/ComponentGallery.tsx` — scrollable gallery, theme + accent switcher
  in the header, one section per component with all variants
- `apps/mobile/src/components/ui/__tests__/` — render tests for Button, Chip, Input, Sheet, Text
- `scripts/check-tokens.mjs` — CI script that fails if a hex/rgba literal appears outside
  `theme/` and `components/ui/`'s own token usage

## Requirements
- Typography: a single `Text` component with `variant` (`display|h1|h2|h3|body|bodyStrong|label|caption`),
  `color` (`primary|secondary|tertiary|accent|danger`), `align`, `numberOfLines`. It must respect
  dynamic type.
- Buttons: `primary` (accent fill), `secondary` (surface + border), `ghost`, `danger`, `icon`.
  Sizes `sm 36 / md 44 / lg 52`. Every variant has `loading` and `disabled` states, and a press
  scale of 0.97 over 90 ms.
- `Sheet`: bottom sheet with detents 0.5/0.9, drag-to-dismiss, backdrop fade, keyboard-aware
  (content scrolls, header sticks). Built on Reanimated + Gesture Handler, no third-party sheet
  library unless it supports both platforms equally.
- `EmptyState`: takes `illustration`, `title`, `body`, `action`. Include five isometric SVG
  illustrations in `assets/illustrations/` (no tasks, no stickies, no bugs, no results, offline)
  drawn in the flat single-accent style.
- `Skeleton`: shimmer via Reanimated, respects reduced motion.
- Icons: `lucide-react-native`, stroke 1.75, sized from the type scale.
- Every component file exports a typed props interface and has a JSDoc line describing when to
  use it vs. the nearest alternative.

## Do not
- No component may hardcode a colour, radius, spacing value, or shadow — everything comes from
  `useTheme()`.
- No component may use `Platform.OS` except `Sheet` (detent height) — and even there, prefer a
  measurement.
- Do not build screens in this prompt beyond the gallery.
- Do not use `Animated` (the old API) anywhere.

## Acceptance checks
- [ ] Gallery renders all components in light and dark, and cycles all 5 accents live.
- [ ] `node scripts/check-tokens.mjs` exits 0 on a clean tree and exits 1 when a hex is added
      to `screens/` (prove it by temporarily adding one, then revert).
- [ ] Theme + accent survive a cold restart.
- [ ] No flash of wrong theme on launch (verified on a real device, both modes).
- [ ] Render tests pass; no component logs a React warning.
- [ ] Every accent pair documented with its measured contrast ratio (≥4.5:1 for text).

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
