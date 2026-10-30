# 12 — Mobile UI on gluestack-ui v5

## Setup
1. Install the skill: `npx skills add gluestack/agent-skills --skill gluestack-ui-v5` and **read its SKILL.md fully**. It overrides generic habits.
2. Follow current official docs/CLI for init and `add` (commands and flags change between alpha/stable; verify). v5 is Tailwind CSS v4 (CSS-first, no `tailwind.config.js`).
3. Styling engine: NativeWind v5 (documented as the recommended default; Expo + RN CLI) or UniWind (Expo only, simpler setup). Run a 1-hour spike on our dev build (including the separate **Quick Capture RN root** and Android widgets bridge), then record an ADR. Default: NativeWind v5 unless the spike shows problems.

## Rules from the skill (enforced)
- Use gluestack components instead of raw RN primitives.
- Component props (`size`, `variant`, `space`) before `className`; `className` before inline `style`.
- **Semantic tokens ONLY** (`bg-background`, `text-foreground`, `bg-primary`, `border-border` …), with alpha when needed. **Never** numbered/generic colors (`blue-500`, `gray-*`, `typography-*`) and never hex.
- Spacing from the scale, not arbitrary pixels.
- Components are copied into the repo (`src/ui/gluestack/`); we own them. Remove unused ones.
- Composable sub-components.

## Keep our product design (from the original kit)
The design language does not change; only the implementation foundation does:
- Plane-like calm neutral surfaces; accent used sparingly
- **5 accents** (blue default, violet, green, orange, rose) × **light/dark/system**, switchable at runtime, persisted
- Floating pill navbar (64pt) + 56×56 raised capture button + FAB behavior
- Keyboard accessory bar (contextual chips + pinned Send)
- Loading/empty/error states, haptics, reduced motion

## Token architecture (shared with web)
- `@doit/tokens` is the single source. It emits: (a) mobile CSS variables for gluestack/Tailwind v4 theme, (b) web CSS variables for shadcn, (c) TS constants for native bits (Android widget colors, status bar).
- Use **shadcn-compatible semantic names** so both platforms match: `background, foreground, card, card-foreground, popover, muted, muted-foreground, border, input, ring, primary, primary-foreground, accent, accent-foreground, destructive, success, warning` plus priority/state colors.
- Accent switching: 10 combinations (2 modes × 5 accents). Implement via the engine's runtime variable/theme mechanism; if runtime variable swap isn't supported, define 10 named themes. No reload allowed on switch.
- Contrast ≥ 4.5:1 for text pairs (keep existing WCAG checks, extend them to the new token set).

## Migration plan
1. Branch `ui/gluestack-v5`. Keep old UI components until replaced.
2. Provider + theme wiring; verify in Gallery screen.
3. Replace `src/ui` primitives/inputs/feedback/overlays/data one group at a time with gluestack-based versions behind the **same public API** (`src/ui/index.ts` exports unchanged) so screens don't break.
4. Rebuild FloatingNavBar, Fab, KeyboardToolbar on gluestack primitives (Reanimated animations preserved).
5. Update `check-tokens.mjs`: ban hex colors, `rgb()`, numbered Tailwind colors, inline `style={{color…}}`; allow semantic classes only.
6. Gallery shows every component × 10 theme combinations; capture screenshots before/after for visual diff.
7. Verify Quick Capture activity and widgets still render with the new theme.
8. Delete dead old components.

## Acceptance
Typecheck/lint/token-lint green · Gallery screenshots 10 themes · all screens visually equal or better than before · no hardcoded colors · bundle size and cold-start not worse by > 10%.
