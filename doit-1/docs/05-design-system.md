# 05 — Design System (Plane-inspired, professional, consistent)

Reference: the Plane mobile screenshot — near-black canvas, soft elevated rounded cards, muted secondary text, small caps-less section headers with a caret, compact lists with leading icons + trailing count + chevron, big pill-shaped floating bottom nav with a circular active segment, a circular `+` FAB, empty states with a quiet isometric illustration + one clear CTA.

## Principles
1. Calm and dense: neutral surfaces, **accent used sparingly** (active nav, primary buttons, focus, links).
2. One radius scale, one spacing scale, one type scale. Nothing ad-hoc.
3. Every screen = Header + scrollable content + floating navbar. Same skeleton.
4. Every list has skeleton, empty, and error states.

## Tokens (in `core/theme/tokens.ts`)
**Spacing**: 2,4,8,12,16,20,24,32,40
**Radius**: sm 8, md 12, lg 16, xl 24, pill 999
**Type (Inter)**: caption 12/16, body 14/20, bodyLg 16/24, title 18/26 (600), h2 22/28 (600), h1 28/34 (700). Weights 400/500/600/700.
**Elevation**: none, card (subtle border + tiny shadow in light; border only in dark), floating (nav, FAB, sheets).
**Hit target**: min 44×44.

## Color roles (semantic, never raw hex in screens)
| Role | Dark | Light |
|---|---|---|
| background | `#101010` | `#FFFFFF` |
| surface (cards) | `#17181A` | `#F7F7F8` |
| surfaceRaised (nav, sheets) | `#1F2023` | `#FFFFFF` |
| border | `#2A2B2F` | `#E6E7EA` |
| textPrimary | `#F2F3F5` | `#111214` |
| textSecondary | `#9A9CA3` | `#5F6168` |
| textTertiary | `#6B6D74` | `#8D8F96` |
| danger / warning / success | `#F0524F / #F5A524 / #2FBF71` | slightly deeper variants |
Priority colors: urgent=danger, high=orange, medium=yellow, low=blue, none=muted.

## Accents (5) — each defines `accent`, `accentPressed`, `accentSoft` (12–16% tint bg), `onAccent`
| Name | Dark | Light |
|---|---|---|
| blue (default, like Plane) | `#3F76FF` | `#2F64F0` |
| violet | `#8B5CF6` | `#7C3AED` |
| green | `#22C55E` | `#16A34A` |
| orange | `#F97316` | `#EA580C` |
| rose | `#F43F5E` | `#E11D48` |
Verify contrast ≥ 4.5:1 for `onAccent` text; pick white/black per accent accordingly.

## Theme engine
- Modes: `system | light | dark`. Accent: one of 5. Both persisted locally and synced to `PATCH /me` preferences.
- `ThemeProvider` exposes `useTheme()` → `{ colors, spacing, radius, type, mode, accent, setMode, setAccent }`.
- Styles via `useStyles((theme) => ({...}))` helper so no screen ever touches raw values.
- Settings screen: segmented control for mode + row of 5 accent swatches with live preview.

## Component kit (`src/ui`) — build ALL of these in Phase 4
Primitives: `Text` (variants), `Box`, `Icon`, `Pressable` (haptic + pressed state), `Divider`
Inputs: `TextField`, `SearchField`, `QuickAddInput` (with mic), `Checkbox`, `Switch`, `SegmentedControl`, `DatePickerField`
Data: `Card`, `ListItem` (leading icon, title, subtitle, trailing value, chevron), `Section` (title + caret + action), `Badge`, `Chip` (label), `PriorityIcon`, `StateIcon`, `Avatar`, `AvatarStack`
Feedback: `Skeleton`, `EmptyState` (illustration slot + text + CTA), `ErrorState`, `Toast`, `Spinner`
Overlays: `BottomSheet`, `ActionSheet`, `Menu`, `ConfirmDialog`
Layout: `Screen` (safe area + header + content), `Header` (workspace switcher style / back + title + actions), `FloatingNavBar`, `Fab`
Buttons: `Button` (primary/secondary/ghost/danger, sm/md/lg, loading)

## Floating navbar (signature element)
- Pill container, `surfaceRaised`, border, floating ~16px above the bottom safe area, horizontal margin 16.
- 3–4 items: **Home, Items (inbox icon), Stickies, Search**. Active item = rounded pill segment in `surfaceRaised+`/`accentSoft` with icon (+ label on active).
- Separate circular **FAB `+`** at bottom-right above the nav (as in the screenshot) → opens Quick Add sheet. Long-press FAB → radial/quick menu: Task, Bug, Sticky, Voice.
- Hides on scroll down, reappears on scroll up and when keyboard closes. Items come from the feature manifests.
- Content bottom padding must account for nav height (provide `useScreenInsets()`).

## Contextual keyboard
Using `react-native-keyboard-controller`:
- A **sticky toolbar above the keyboard** (`KeyboardStickyView`) on any create/edit field.
- Toolbar contents change by context:
  - Quick Add title: `[Priority] [Due] [Label] [Assignee] [Project] [🎤] [Send]`
  - Description: `[B] [I] [List] [Checklist] [🎤]` (simple markdown helpers)
  - Sticky: `[Color] [Pin] [🎤]`
  - Bug form: `[Severity] [Attach] [🎤] [Send]`
- Each toolbar button opens a compact picker as a bottom sheet **without dismissing the keyboard when possible**.
- Keyboard `returnKeyType`/`inputMode` are set per field (e.g. `search`, `send`, `default`).

## Screens (POC)
Home (greeting-less, Plane style: workspace header, "Work" card, Your work, Recent activity, Stickies) · Items list (segmented: All/Mine/Bugs, filters) · Item detail (editable title, description, property rows: state, priority, assignee, labels, due, attachments with image preview + audio player) · Stickies (masonry/2-col) · Search · Quick Add sheet · Settings (appearance, sessions, logout, capture permissions) · Auth (login/register).

## Motion
Reanimated, 150–250ms, ease-out. Sheets spring. Respect reduced motion.
