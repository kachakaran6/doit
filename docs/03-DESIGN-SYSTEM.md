# 03 — Design System

The look: **near-planar, professional, quiet.** Flat fills, hairline borders, generous
whitespace, one accent used with restraint, elevation reserved for things that genuinely float
(navbar, sheets, overlay bubble, FAB).

---

## 3.1 Tokens

All tokens live in `packages/design-tokens/src/tokens.ts` and are consumed in the app only
through `useTheme()`. **No component may contain a raw hex, a raw px radius, or a raw shadow.**

### 3.1.1 Neutral ramp

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FFFFFF` | `#0B0C0E` |
| `bgSubtle` | `#F6F7F9` | `#131417` |
| `surface` | `#FFFFFF` | `#17181C` |
| `surfaceRaised` | `#FFFFFF` | `#1E2025` |
| `border` | `#E4E6EB` | `#26282E` |
| `borderStrong` | `#D0D3DA` | `#33363D` |
| `textPrimary` | `#101114` | `#F2F3F5` |
| `textSecondary` | `#5B616E` | `#9BA1AC` |
| `textTertiary` | `#8B919E` | `#6B7280` |
| `overlay` | `rgba(0,0,0,0.32)` | `rgba(0,0,0,0.60)` |

### 3.1.2 Semantic

| Token | Light | Dark | Use |
|---|---|---|---|
| `success` | `#0F9D58` | `#34D399` | done, synced |
| `warning` | `#B45309` | `#FBBF24` | due soon, pending |
| `danger` | `#D93025` | `#F87171` | overdue, delete, blocker |
| `info` | `#1A73E8` | `#60A5FA` | hints |

### 3.1.3 The five accents

Each accent is a family: `primary`, `onPrimary`, `container`, `onContainer`, `soft` (10% tint
for chips/badges), plus `contrast` (documented AA ratio).

| # | Name | primary | onPrimary | container (light) | container (dark) | soft (light) | soft (dark) |
|---|---|---|---|---|---|---|---|
| 1 | **Indigo** | `#4F46E5` | `#FFFFFF` | `#EEF0FE` | `#1E1B4B` | `#E8EAFD` | `#1C1B3A` |
| 2 | **Teal** | `#0D9488` | `#FFFFFF` | `#E6F7F5` | `#0B2E2B` | `#DFF3F0` | `#0C2A27` |
| 3 | **Amber** | `#B45309` | `#FFFFFF` | `#FDF3E3` | `#33230A` | `#FBEBD5` | `#2C1F0B` |
| 4 | **Rose** | `#BE123C` | `#FFFFFF` | `#FDE9EE` | `#3B0A18` | `#FBDCE4` | `#330B16` |
| 5 | **Violet** | `#7C3AED` | `#FFFFFF` | `#F2EBFE` | `#241145` | `#EBE0FD` | `#20103D` |

Default accent: **Indigo**. Persisted key: `settings.accent` = `indigo|teal|amber|rose|violet`.
Dark-mode accents must be lightened for text use (`accentText` = the accent lightened to reach
4.5:1 on `bg`); the token file exports both `accent` (for fills) and `accentText` (for text/icons).

### 3.1.4 Spacing (4 pt scale)

`xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 · 4xl 40 · 5xl 56`
Screen gutter = `lg (16)`. Card padding = `lg`. Section gap = `2xl`.

### 3.1.5 Radius

`sm 8` (inputs, chips) · `md 12` (buttons, small cards) · `lg 16` (cards) · `xl 20`
(sheets, sticky cards) · `pill 999` (nav bar, FAB, pills, avatar).

### 3.1.6 Type

Family: **Inter** (fallback: platform system). Numerals tabular for counters.

| Token | Size / line-height / weight | Use |
|---|---|---|
| `display` | 32 / 38 / 700 | screen hero numbers |
| `h1` | 24 / 30 / 600 | screen title |
| `h2` | 20 / 26 / 600 | section header |
| `h3` | 17 / 22 / 600 | card title, list row title |
| `body` | 15 / 21 / 400 | default |
| `bodyStrong` | 15 / 21 / 500 | emphasis |
| `label` | 13 / 18 / 500 | chips, meta, nav labels |
| `caption` | 11 / 15 / 500 | timestamps, counters, uppercase eyebrow (letter-spacing 0.4) |

### 3.1.7 Elevation

Flat by default. Only four things get elevation:

| Layer | Spec |
|---|---|
| `e1` (cards in a board) | `0 1px 2px rgba(16,17,20,0.06)` + `1px border` |
| `e2` (floating navbar, FAB) | `0 8px 24px rgba(16,17,20,0.14)` + `1px border` |
| `e3` (bottom sheet) | `0 -8px 32px rgba(16,17,20,0.18)` |
| `e4` (overlay bubble) | `0 6px 20px rgba(0,0,0,0.28)` |

In dark theme, shadows are nearly invisible — so elevation is expressed by `surfaceRaised` +
`borderStrong` instead. Never rely on shadow alone for separation.

---

## 3.2 Component inventory (build these once, in `components/ui/`)

`Text`, `Screen`, `Stack`, `Row`, `Spacer`, `Divider`, `Pressable` (with ripple/press-scale),
`Button` (variants: `primary`, `secondary`, `ghost`, `danger`, `icon`; sizes `sm|md|lg`;
`loading`, `disabled`), `IconButton`, `Chip` (selectable, with optional leading icon and count),
`Input`, `TextArea` (auto-grow, max 6 lines), `SearchField`, `Switch`, `SegmentedControl`,
`Avatar`, `Badge` (dot / count / label), `PriorityDot`, `LabelPill`, `SeverityBadge`,
`ProgressRing`, `Checkbox`, `Skeleton`, `EmptyState` (illustration + title + body + action),
`Toast`/`Snackbar`, `Sheet` (bottom sheet, detents `0.5` / `0.9`), `Dialog`, `Menu`
(anchored popover), `DatePickerRow`, `DurationPill`, `Waveform`, `RecordButton`,
`ScreenshotThumb`, `AttachmentRow`, `FloatingNavBar`, `KeyboardAccessoryBar`, `StickyCard`,
`TaskRow`, `BugRow`.

Rules:
- One `Text` component. No raw `<Text>` in feature code.
- Pressables always have `accessibilityLabel`, `accessibilityRole`, and a ≥44×44 hit area.
- Loading states use `Skeleton` matching the final layout — never a centred spinner for lists.
- Every component ships with a `*.stories.tsx`-equivalent demo screen under
  `app/dev/ComponentGallery.tsx` so the agent can eyeball the whole system in one place.

---

## 3.3 The floating navbar (signature element)

A pill that floats above the content, not a full-width bar.

```
┌──────────────────────────────────────────────┐
│  ⌂ Home     ▤ Tasks     ( + )     ⚑ Bugs   ⌕ │   height 64
└──────────────────────────────────────────────┘      radius pill
        margins 16 · gap 8 · blur behind · 1px border
```

Spec:
- Height `64`, horizontal margin `lg (16)`, bottom offset `safeArea.bottom + sm (8)`.
- Radius `pill`. Background `surface` at 92% opacity with a `BlurView` behind (intensity 24 in
  light, 40 in dark), `1px border` (`border`), shadow `e2`.
- Four destinations: **Home**, **Tasks**, **Bugs**, **Search**. The centre is a **raised
  capture button** (56×56, radius pill, `accent` fill, `onPrimary` icon, shadow `e2`,
  `translateY(-12)` so it overlaps the pill edge).
- Active state: icon `accentText` + filled variant + `label` in `accentText`; inactive:
  `textTertiary` + outline icon.
- Transition between active items: shared-element pill highlight sliding behind the active
  icon (spring, `damping 18`, `stiffness 180`).
- **Scroll behaviour:** hides on scroll-down (`translateY(+88)`, 200 ms `ease-out`), shows on
  scroll-up. Never hides while the keyboard is open.
- **Keyboard behaviour:** the navbar lifts above the keyboard with the accessory bar, or hides
  entirely if the screen is a full-screen composer. One behaviour per screen, declared in the
  screen's config — never mixed.
- Long-press on the capture button = open the bug composer directly (skip the chooser).
- Never render two navbars. Nested stacks hide the parent's navbar.

## 3.4 The keyboard accessory bar (contextual)

A 44 pt row pinned directly above the keyboard, replacing the need to reach for form fields.

```
┌────────────────────────────────────────────────────────────┐
│ [Today] [Tomorrow] [Fri] │ [P2 ▾] [Label ▾] │ [🎤] [📎] [Send]│
└────────────────────────────────────────────────────────────┘
```

- Background `bgSubtle`, `1px` top border, horizontally scrollable, chips `sm` radius.
- **It is contextual to the focused field.** The bar reads the screen's composer context and
  renders a different chip set per field:

| Focused field | Chips shown |
|---|---|
| Task title | Due: Today / Tomorrow / pick · Priority · Label · Voice · Send |
| Task description | Voice · Attach · Checklist · Send |
| Bug description | Severity · Screenshot · Recording · Voice · Send |
| Comment | Voice · Mention · Send |
| Sticky body | 5 colour swatches · Convert to task · Done |
| Search | Recent · Filters · Clear |

- Chips that mutate data apply immediately and show a 150 ms `success` flash; they never
  navigate away from the composer.
- Implementation: iOS `InputAccessoryView`; Android a `View` positioned with
  `useAnimatedKeyboard()` (Reanimated) inside a `KeyboardAvoidingView` — must not double-shift.
- The bar is a single shared component driven by a `KeyboardContext` provider. Screens opt in
  by declaring `keyboardContext: 'task' | 'bug' | 'comment' | 'sticky' | 'search'`.

## 3.5 Sticky visual language

- Card radius `xl (20)`, padding `lg`, min-height `120`.
- Light theme: pastel surface derived from accent (`soft`), text `textPrimary`.
- Dark theme: deep tinted surface, text `textPrimary`, `1px border` in the accent at 24% alpha.
- Rotation: `((hash(id) % 5) - 2) * 0.75°` → deterministic, between −1.5° and +1.5°.
- Pinned stickies get a small filled pin in the corner and sort first.
- One line of "converted" state: a small arrow chip linking to the created task.

## 3.6 Motion

| Interaction | Spec |
|---|---|
| Press feedback | scale 0.97, 90 ms |
| Screen push | platform default (iOS slide, Android fade-through) |
| Sheet open | 240 ms, `ease-out`, backdrop fades to `overlay` |
| Bubble appear | spring, `damping 14`, `stiffness 160`, scale 0→1 |
| Chip apply | 150 ms flash to `accent.soft` |
| List item enter | 180 ms fade + 8 px rise, staggered 20 ms, cap 6 items |

Respect `prefers-reduced-motion`: disable stagger and springs, keep opacity fades.

## 3.7 Accessibility

- Contrast ≥ 4.5:1 for text, ≥ 3:1 for icons and borders.
- Dynamic type supported to 130% without truncation of primary actions.
- Every icon-only button has a label. Every list row reads as one sentence to a screen reader.
- The capture flow must be completable with a screen reader in ≤ 4 actions.
- Haptics: light impact on capture start, success notification on submit, warning on failure.
  Respect the OS haptics setting.

## 3.8 The empty-state illustration

Flat isometric line art, single accent tint, transparent background, consistent stroke weight
(1.5 px at 1×). One per context: no tasks, no stickies, no bugs, no search results, offline.
Export as SVG, render via `react-native-svg`. Never use a photographic image or an emoji.
