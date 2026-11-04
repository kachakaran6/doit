# Project: DoIt UI Premium Loop Kit Implementation

## Architecture
- **Target Tech Stack**:
  - Mobile App: React Native (0.76.9 / Expo SDK 52) with TypeScript in `apps/mobile/src/...`
  - Design Tokens: Shared package `packages/design-tokens` (`@doit/tokens`)
  - Tooling & Monorepo: pnpm workspace, Turborepo
  - Navigation: React Navigation (Native Stack + Bottom Tabs)
  - Animation & Physics: React Native Reanimated 3, Gesture Handler
  - Icons: Lucide React Native (`lucide-react-native`)
  - State & Data: Zustand stores + TanStack React Query

- **Design Philosophy (Apple Feel on Android)**:
  1. Content First: Chrome recedes; exactly one clear visual focal point per screen.
  2. Tone Over Outlines: Zero 1px borders on cards, chips, or buttons. Depth via an 8% luminance ladder (`canvas` -> `surface1` -> `surface2` -> `surface3`).
  3. Weight-Led Hierarchy: Inter typography scale with sentence case everywhere (no ALL-CAPS labels); secondary/tertiary metadata creates visual calm.
  4. Brand Blue & 5 Verified Accents: Default brand blue (`#2F5BEA` light / `#3A66F2` dark), contrast-guaranteed violet, green, orange, and rose.
  5. Strict 20pt Margins: Unified `Screen` component with 20pt horizontal margin fixing edge-flush defects.
  6. Detached Floating Shell: 4-tab pill (Home, Tasks, Bugs, Search) with independent 56px circular '+' FAB with soft glow.
  7. Physics & Haptics: Damped springs, 0.97 press scale on all touchables, 180ms checkbox sequence, and native haptic feedback.
  8. Zero Raw Values: Every single color and dimension strictly referenced from `@doit/tokens`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Baseline Setup & Loop Log | Initialize baseline records, documentation, and defect tracking | M1 | L0 / Audit |
| 2 | Surface Luminance Ramp | 8% luminance ladder: canvas, surface1, surface2, surface3, hairline | M1 | L1 / Tokens |
| 3 | Text Hierarchy Tokens | Primary, secondary, tertiary text color tokens passing WCAG AA 4.5:1 | M1 | L1 / Tokens |
| 4 | 5 Verified Accents | Blue (default), Violet, Green, Orange, Rose with light/dark contrast | M1 | L1 / Tokens |
| 5 | Inter Typography Ladder | 8-style type scale with tabular numbers and sentence case | M1 | L1 / Tokens |
| 6 | Contrast Verification Automation | Automation script validation ensuring 0 contrast failures | M1 | L1 / Tokens |
| 7 | Token Check Script Compliance | Strict zero raw color literal enforcement in codebase | M1 | L1 / Scripts |
| 8 | Screen Container Primitive | Universal screen wrapper with consistent 20pt margin and safe area | M2 | L2 / Primitives |
| 9 | LargeHeader Component | Large title collapsing into inline navigation bar on scroll | M2 | L2 / Primitives |
| 10 | Borderless Card & Section | Tonal surface cards without 1px borders; soft shadow on light mode | M2 | L2 / Primitives |
| 11 | Borderless Button Component | 5 variants (primary, secondary, subtle, danger, ghost) without outlines | M2 | L2 / Primitives |
| 12 | Borderless Filter & Label Chips | Tonal chips with active surface state and sentence case labels | M2 | L2 / Primitives |
| 13 | Circular Animated Checkbox | 22px circular completion control with 180ms check animation | M2 | L2 / Primitives |
| 14 | ProgressRing SVG Primitive | Circular progress indicator with brand gradient for Today hero | M2 | L2 / Primitives |
| 15 | EmptyState, Skeleton, Badge | Refined feedback and loading primitives | M2 | L2 / Primitives |
| 16 | GroupedList & GroupedRow | Grouped container with 1px inset hairlines between items | M2 | L2 / Primitives |
| 17 | Floating 4-Tab Navigation Bar | 4 tabs (Home, Tasks, Bugs, Search) with sliding active capsule | M3 | L3 / Shell |
| 18 | Detached 56px Circular FAB | Independent floating '+' action button with brand glow | M3 | L3 / Shell |
| 19 | Detented Bottom Sheet System | Native gesture-driven sheet with 45% half and 92% full detents | M3 | L3 / Shell |
| 20 | Project & Workspace Switchers | Clean bottom sheet switchers replacing inline overflow pills | M3 | L3 / Shell |
| 21 | Gate 1 Review & Approval | Verification of shell, navigation, headers, and sheets | M3 | Gate 1 |
| 22 | Home Screen Redesign | Today hero, progress ring, quick stats, pastel stickies, work card | M4 | L4 / Screens |
| 23 | Tasks Screen Redesign | Due date grouping, rich secondary metadata, swipe actions, board view | M4 | L4 / Screens |
| 24 | Bugs Screen Redesign | Severity chips, screenshot thumbnails, quick triage actions | M4 | L4 / Screens |
| 25 | Search Screen Redesign | Large auto-focused input, recents history, search filter chips | M4 | L4 / Screens |
| 26 | New Item Creation Sheet | Bottom sheet with single keyboard accessory bar as sole controller | M5 | L5 / Forms |
| 27 | Account Menu Sheet | Professional profile sheet, sign-out, removing dev/server jargon | M5 | L5 / Account |
| 28 | Settings Screen Redesign | Inset grouped cards, 20pt margin fixing A1/A2, clean microcopy | M5 | L5 / Settings |
| 29 | Android Quick Capture Overlay | Refined floating bubble and capture overlay styling | M5 | L5 / Overlay |
| 30 | Gate 2 Review & Approval | Verification of main screens, creation flow, and settings | M5 | Gate 2 |
| 31 | Press Scale Physics & Feedback | 0.97 press scale on all touchables with damped spring motion | M6 | L6 / Motion |
| 32 | Checkbox Completion Animation | 180ms sequence: scale bounce, stroke draw, text fade | M6 | L6 / Motion |
| 33 | List Layout Transitions | Smooth Reanimated transitions (<=250ms) for item reordering | M6 | L6 / Motion |
| 34 | Native Haptic Feedback | Light/medium impact haptics on actions with settings toggle | M6 | L6 / Haptics |
| 35 | Visual Rubric Audit | 10-dimension audit scoring >=43/50, no dimension <4.0 | M7 | L7 / Polish |
| 36 | Five Visual Quality Checks | Squint test, grayscale test, 5-sec test, alignment, dead space | M7 | L7 / Polish |
| 37 | Gate 3 Review & Approval | Verification of motion, visual polish, and rubric scores | M7 | Gate 3 |
| 38 | Static Token Audit | 0 raw hex or rgba literals verified via `scripts/check-tokens.mjs` | M7 | L8 / Delivery |
| 39 | Accessibility & Touch Targets | Screen reader labels and 48dp minimum touch target validation | M7 | L8 / Delivery |
| 40 | Final Delivery Report | Comprehensive `docs/UI_FINAL_REPORT.md` and verification artifact | M7 | L8 / Delivery |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation: Tokens & Typography | L0 (Setup, Baseline) & L1 (Tokens, Typography, Contrast scripts) | none | DONE |
| M2 | Borderless UI Primitives | L2 (Screen, LargeHeader, Card, Button, Chip, Checkbox, ProgressRing, GroupedList) | M1 | IN_PROGRESS |
| M3 | Navigation Shell & Global Sheets | L3 (Floating 4-tab bar, 56px FAB, Sheet, Switchers) + Gate 1 | M2 | PLANNED |
| M4 | Core Experience & Main Screens | L4 (Home, Tasks, Bugs, Search screens) | M3 | PLANNED |
| M5 | Creation, Account & Settings | L5 (New Item Sheet, Account Sheet, Settings Screen, Quick Capture) + Gate 2 | M4 | PLANNED |
| M6 | States, Motion & Haptics | L6 (Press scale 0.97, checkbox animation, transitions, haptics) | M5 | PLANNED |
| M7 | Polish, Quality Gates & Delivery | L7 (Rubric audit, visual checks) & L8 (Token audit, accessibility, final report) + Gate 3 | M6 | PLANNED |

## Interface Contracts
### `@doit/tokens` -> `apps/mobile/src/theme/useTheme.ts`
- Exports:
  - Surface Ramp: `canvas`, `surface1`, `surface2`, `surface3`, `hairline`
  - Text Levels: `text.primary`, `text.secondary`, `text.tertiary`
  - Semantic: `success`, `warning`, `danger` (each with `fillLight`, `fillDark`, `textLight`, `textDark`)
  - Accents: `blue` (default), `violet`, `green`, `orange`, `rose` (each with light/dark contrast pairs)
  - Typography: `largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `caption`, `tab`
  - Spacing: 4-pt grid (4, 8, 12, 16, 20, 24, 32, 40, 48)
  - Radius: `sm` (8), `md` (12), `lg` (16), `xl` (20), `pill` (999)

### `apps/mobile/src/components/ui/` -> Feature Screens
- `Screen`: `{ children: ReactNode; scrollable?: boolean; style?: ViewStyle; contentContainerStyle?: ViewStyle }` enforces 20pt horizontal padding.
- `LargeHeader`: `{ title: string; subtitle?: string; rightAction?: ReactNode; scrollY?: SharedValue<number> }` provides collapsing header.
- `Card`: `{ children: ReactNode; variant?: 'surface1' | 'surface2'; style?: ViewStyle; onPress?: () => void }` provides borderless tonal container.
- `Button`: `{ variant: 'primary' | 'secondary' | 'subtle' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; title: string; icon?: LucideIcon; onPress: () => void }`.
- `Checkbox`: `{ checked: boolean; onChange: (checked: boolean) => void; size?: number; label?: string }` provides 22px circular animated control.
- `ProgressRing`: `{ progress: number; size?: number; strokeWidth?: number; gradient?: boolean }`.
- `GroupedList`: Container for `GroupedRow` with inset 1px hairlines.

### `apps/mobile/src/navigation/`
- `FloatingNavBar`: 4 tabs (`home`, `tasks`, `bugs`, `search`) + detached 56px circular floating `+` FAB with soft glow.

## Code Layout
- `packages/design-tokens/`:
  - `src/tokens.ts`: Surface ramp, text hierarchy, accents, typography, spacing, shadows.
  - `src/type.ts`: TypeScript token definitions.
- `apps/mobile/src/`:
  - `theme/`: `ThemeProvider.tsx`, `useTheme.ts`, token consumption.
  - `components/ui/`: `Screen.tsx`, `LargeHeader.tsx`, `Card.tsx`, `Button.tsx`, `Chip.tsx`, `Checkbox.tsx`, `ProgressRing.tsx`, `GroupedList.tsx`, `EmptyState.tsx`, `Skeleton.tsx`.
  - `navigation/`: `FloatingNavBar.tsx`, `TabsNavigator.tsx`, `RootNavigator.tsx`.
  - `features/`:
    - `home/screens/HomeScreen.tsx`, `components/`: Today hero, stickies, stats.
    - `tasks/screens/TaskListScreen.tsx`, `components/`: Tasks list, metadata, board.
    - `bugs/screens/BugQueueScreen.tsx`, `components/`: Bug queue, severity, thumbnails.
    - `search/screens/SearchScreen.tsx`: Search input, recents, suggestions.
    - `settings/screens/SettingsScreen.tsx`: Inset grouped settings, 20pt margin.
    - `capture/`: `CaptureModal.tsx` / `NewItemSheet.tsx`, keyboard accessory bar.
    - `account/`: `AccountMenuSheet.tsx`.
