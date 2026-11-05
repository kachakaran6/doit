# 02 — Web Design Language (shadcn/ui, premium)

Reference quality bar (study, don't copy): **Linear, Vercel dashboard, Raycast, Arc, Apple.com/Notes web, Notion Calendar, Height**. Common traits: tonal surfaces, tiny borders, tight type scale, crisp icons, restraint with color, fast and tactile interactions.

## 1. Principles
1. **Tone over lines** — separate with surface steps; hairlines only for table rows/inputs/dividers.
2. **Density with calm** — 14px base, 13px tables, generous but disciplined whitespace.
3. **One accent**, used sparingly (primary action, selection, focus, links).
4. **One visual per concept** — a status/priority/severity has exactly one icon+color+label everywhere.
5. **Keyboard-first, mouse-friendly** — ⌘K, shortcuts, visible focus, hover states.
6. **Content/product first** — bugs show screenshots; tasks show meaningful meta.
7. **Everything is a token/component** from `@doit/ui-web` (shadcn). No one-offs in pages.

## 2. Color — use `templates/premium-tokens.json` (same palette as mobile; contrast-verified)
Surface ramp (dark): canvas `#0B0B0E` · surface1 `#141418` · surface2 `#1C1C22` · surface3 `#25252C`. Light: canvas `#F4F4F7` · surface1 `#FFFFFF` · surface2 `#F0F0F4` · surface3 `#E8E8EE`.
Mapping to shadcn variables: `--background=canvas`, `--card/--sidebar=surface1`, `--popover=surface2`, `--muted/--secondary/--accent(hover)=surface3`, `--border=hairline`, `--primary=accent.fill`, plus custom `--primary-text` (accent.text for links/selected on dark) and `--primary-soft` (tint). Defined in `templates/theme.css`. **Default accent = Blue (matches the logo).** 5 accents (Blue, Violet, Green, Orange, Rose); run `python3 scripts/contrast.py templates/premium-tokens.json` (0 failures).
Rules: white text only on `fill`; lighter `text` accent for links on dark; no raw hex in components; no gradients on surfaces (only logo/hero chart accents).

## 3. Status / priority / severity system (single source of truth)
| Concept | Visual | Label |
|---|---|---|
| Status | 14px icon + sentence-case text: To do (dashed circle, tertiary) · In progress (half-filled circle, accent) · In review (violet) · Done (check circle, success) · Cancelled (x circle, tertiary) | "To do", "In progress", "In review", "Done", "Cancelled" |
| Priority | bars/flag icon + label: Urgent (danger) · High (warning) · Medium (accent) · Low (tertiary) · None (hidden) | sentence case |
| Bug severity | colored dot + label: Critical (danger) · Major (warning) · Minor (amber) · Trivial (neutral) | sentence case |
| Bug state | New · Triaged · In progress · Resolved · Won't fix · Duplicate | each with the same status icon family |
Presented as a **tonal badge** (soft background + text color) or icon+text in dense tables. **Raw enums never reach the UI**: one `labels.ts`/`<StatusBadge>`/`<PriorityBadge>`/`<SeverityBadge>` used by every page (`templates/badge-map.ts`).

## 4. Typography
Inter (self-hosted, `font-display: swap`; enable `tabular-nums` for numbers). Brand name only via the SVG wordmark.
| Style | Size/Line | Weight | Use |
|---|---|---|---|
| page title | 24/30, tracking −0.02em | 600 | one per page (`text-wrap: balance`) |
| section title | 15/20 | 600 | cards, groups |
| body | 14/20 | 400 | text, inputs |
| table / row | 13/18 (title 14/20 500) | 400/500 | lists |
| meta | 12/16 | 500 | ids, timestamps, helper text |
| stat number | 28/32 | 600 tabular | KPI values |
Sentence case everywhere; **no uppercase labels** (form labels 13/500 sentence case). Ellipsis for overflow with tooltip.

## 5. Layout
App shell: sidebar 248px (collapsible to 64, remembers state) · top bar 56px · content padding 32. Page container widths: **data pages** (lists, boards, overview) max 1280 centered; **forms/settings/detail** max 720–880; never both on one page. Page header: title + optional one-line plain-language description + page-specific actions on the right (never a second global create).
Spacing scale 4-pt: 4, 8, 12, 16, 20, 24, 32, 40, 48. Table row 44 (comfortable) / 36 (compact), user-selectable.
Responsive: ≥1280 full · 1024–1279 collapsed sidebar · 768–1023 drawer sidebar + peek full-width · <768 cards instead of tables, board snaps horizontally.

## 6. Shape, depth, borders
Radius: control 8, card 12, dialog/sheet 16, pill 999. Dark depth = tone + (for popovers/dialogs) soft shadow `0 12px 32px rgba(0,0,0,.5)`; light = white cards + `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`.
Borders allowed: input/outline buttons (hairline), table row dividers, sticky header underline when scrolled. **Not** on cards, KPIs, badges, nav items.

## 7. Icons
`lucide-react` only, 16px (nav 18), stroke 1.75. Status/priority icons are custom SVGs sharing the 14px grid. No red bug icon on every row (use a neutral type icon or none).

## 8. Interaction & motion
Hover: row bg surface3@60%, buttons lighten; pressed: scale .98; focus: 2px accent ring (offset 2). Transitions 120–180ms ease-out (`cubic-bezier(.2,0,0,1)`); popover/menu: fade + scale .97→1; drawer slides 220ms; skeleton shimmer; list reorder with layout animation (Motion); respect `prefers-reduced-motion`. Optimistic updates with subtle "Saved" feedback; sonner toasts bottom-right (never block).
Keyboard: `⌘/Ctrl+K` palette, `C` create menu, `/` focus search, `G then O/T/B/S` go to pages, `J/K` row nav, `Enter` open peek, `Esc` close, `?` shortcuts help. Show `<Kbd>` hints in menus/tooltips.

## 9. Components (build in `@doit/ui-web`; shadcn primitives + composites)
Shell: `AppShell`, `Sidebar`, `TopBar`, `Breadcrumbs(real route)`, `WorkspaceSwitcher`, `UserMenu`, `CommandPalette`, `CreateMenu`.
Data: `DataTable` (TanStack Table + virtualization), `FilterBar` (Linear-style "Add filter" chips, URL-synced), `ViewSwitcher` (labeled segmented: List · Board · Table), `GroupHeader`, `BulkBar`, `Pagination/InfiniteLoader`.
Domain: `StatusBadge`, `PriorityBadge`, `SeverityBadge`, `LabelChip`, `AssigneeAvatar/Picker`, `DueDate`, `TaskRow`, `BoardColumn/Card`, `PeekPanel`, `PropertyList`, `BugRow` (thumbnail), `ScreenshotViewer`, `AudioPlayer`, `DeviceMeta`, `StatCard` (value + delta + sparkline), `ActivityFeed`.
Feedback: `Skeletons`, `EmptyState` (line illustration + CTA), `ErrorState`, `Toaster`, `ConfirmDialog`, `UnsavedBar`.
Settings: `SettingsLayout` (sub-nav), `ThemeCards`, `AccentSwatches`, `DensityToggle`.

## 10. Copy
Plain, human, short. "Here's what's happening in your workspace", "No bugs yet — reports from the DoIt mobile app appear here." Verbs consistent: **New task, Report bug, New sticky**. No internal jargon ("cross-platform sync", "telemetry logs").
