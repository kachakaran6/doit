# 03 — Design System: shared shadcn/ui

## Principle
**One component library for every web surface.** All shadcn components are installed in `packages/ui-web` and re-exported. Apps never run `shadcn add` into their own folders. Consistency = same components, same tokens, same theme file.

## Look
Plane/Linear-like: calm, dense, neutral, accent used sparingly; dark default (follow system), light supported; 5 accents. Matches mobile (same semantic names from `@doit/tokens`).

## Token mapping (important naming trap)
shadcn's `--accent` means a **subtle hover surface**, not the brand color. Our brand "accent" maps to shadcn **`--primary`**.
| `@doit/tokens` | shadcn CSS variable |
|---|---|
| background / foreground | `--background` / `--foreground` |
| surface | `--card` (+ `--popover`) |
| surfaceRaised | `--popover`, `--sidebar` |
| mutedSurface / mutedText | `--muted` / `--muted-foreground` |
| border / input | `--border` / `--input` |
| **accent (brand)** / onAccent | **`--primary`** / `--primary-foreground` |
| accentSoft | `--accent` (hover/selected surface, tinted) |
| focus ring | `--ring` (= brand) |
| danger / success / warning | `--destructive` / `--success` / `--warning` |
`@doit/tokens` is the source; a build script emits `theme.css`. `templates/theme.css` shows the target shape.

## Theming mechanics
- `<html class="dark" data-accent="violet">`. Mode = `light | dark | system`; accent ∈ blue/violet/green/orange/rose. Persist in localStorage + synced to `PATCH /me` preferences. Inline script in `index.html` sets class/attribute **before first paint** (no flash).
- Contrast ≥ 4.5:1 for all text pairs in all 10 combinations (automated check).
- Radius token `--radius` (0.75rem default), shadows subtle (borders over shadows in dark).

## shadcn components to install (shared package)
Button, Input, Textarea, Label, Form, Select, Combobox (Popover+Command), Checkbox, Switch, RadioGroup, Toggle, ToggleGroup, Slider(optional), Calendar, DatePicker, Popover, Dialog, AlertDialog, Sheet, Drawer, DropdownMenu, ContextMenu, Command, Tabs, Table, Badge, Avatar, Card, Separator, ScrollArea, Skeleton, Tooltip, HoverCard, Progress, Breadcrumb, Pagination, Sidebar, Resizable, Collapsible, Accordion, Sonner, Chart, Kbd (custom), Alert, Empty (custom).

## Our composites (also in `@doit/ui-web`, built only from the above)
| Composite | Notes |
|---|---|
| `AppShell`, `PageHeader`, `ViewSwitcher` | layout primitives used by every page |
| `WorkspaceSwitcher`, `ProjectSwitcher` | popover + command list, create/join actions |
| `DataTable` | TanStack Table wrapper: sorting, column visibility, row selection, bulk bar, virtualization, density |
| `FilterBar` | state/priority/assignee/label/due/type filters bound to URL search params; saved views later |
| `StateIcon`, `PriorityIcon`, `TypeIcon`, `SeverityBadge`, `LabelChip` | semantic colors from tokens, always icon + text (not color alone) |
| `AssigneePicker`, `LabelPicker`, `DatePicker`, `StatePicker`, `PriorityPicker` | command-style pickers with keyboard support |
| `PropertyList` | label/value rows for item detail |
| `BoardColumn`, `BoardCard` | dnd-kit based, accessible keyboard drag |
| `MarkdownView`, `MarkdownEditor` | sanitized render; editor with toolbar + preview |
| `FileDropzone`, `UploadProgress` | image/audio drop, paste-from-clipboard screenshots |
| `ImageLightbox`, `AudioPlayer` | zoom/pan, waveform-lite, playback speed |
| `DeviceMetaPanel` | bug meta display (device, OS, app, network, battery) |
| `EmptyState`, `ErrorState`, `PageSkeleton` | consistent states |
| `Can` / `PermissionGate` | permission-aware wrapper (hide or disable) |
| `ConfirmDialog` (typed confirm variant) | destructive actions |
| `CommandPalette` | navigation, create, search, switch workspace, theme |
| `ThemeToggle`, `AccentPicker` | mode + 5 swatches, live preview |
| `KbdHint`, `ShortcutsDialog` | `?` opens shortcuts |

## Rules
- Pages use only `@doit/ui-web` exports + semantic Tailwind classes.
- Variants via `cva`; no one-off class soup in pages.
- Every composite has a **Storybook-lite gallery route `/design`** (dev only) rendering all states in all 10 themes.
- ESLint/stylelint rule + script: fail on hex colors, `rgb()`, arbitrary `[...]` px values, and non-semantic Tailwind color classes (`bg-blue-500`) in `apps/web`.
- Accessibility inherited from Radix; don't break it (labels, focus management, aria).
