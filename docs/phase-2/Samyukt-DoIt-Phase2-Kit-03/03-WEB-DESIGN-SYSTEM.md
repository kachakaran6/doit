# 03 — Web Design System (shadcn + the shared token file)

The whole point: **one file of design tokens, consumed by both the mobile app (NativeWind v5) and
the web app (Tailwind v4).** Change an accent once, both surfaces change.

---

## 3.1 The shared token file

`packages/design-tokens/src/theme.css` — the single source of truth. It replaces the TS token
object for *values*, while `tokens.ts` keeps the typed accessors mobile components already use.

```css
@layer theme {
  :root {
    /* surfaces */
    --color-bg:           255 255 255;
    --color-bg-subtle:    246 247 249;
    --color-surface:      255 255 255;
    --color-surface-raised: 255 255 255;
    --color-border:       228 230 235;
    --color-border-strong: 208 211 218;

    /* text */
    --color-text:          16 17 20;
    --color-text-secondary: 91 97 110;
    --color-text-tertiary: 139 145 158;

    /* semantic */
    --color-success: 15 157 88;
    --color-warning: 180 83 9;
    --color-danger:  217 48 37;
    --color-info:    26 115 232;

    /* accent — overridden by [data-accent] */
    --color-accent:            79 70 229;
    --color-accent-on:         255 255 255;
    --color-accent-container:  238 240 254;
    --color-accent-soft:       232 234 253;
    --color-accent-text:       79 70 229;

    /* radius, space, type — same numbers as mobile */
    --radius-sm: 8px;  --radius-md: 12px; --radius-lg: 16px;
    --radius-xl: 20px; --radius-pill: 999px;
    --space-xs: 4px;  --space-sm: 8px;  --space-md: 12px; --space-lg: 16px;
    --space-xl: 20px; --space-2xl: 24px; --space-3xl: 32px;
    --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  }

  .dark {
    --color-bg:           11 12 14;
    --color-bg-subtle:    19 20 23;
    --color-surface:      23 24 28;
    --color-surface-raised: 30 32 37;
    --color-border:       38 40 46;
    --color-border-strong: 51 54 61;
    --color-text:          242 243 245;
    --color-text-secondary: 155 161 172;
    --color-text-tertiary: 107 114 128;
    --color-success: 52 211 153;
    --color-warning: 251 191 36;
    --color-danger:  248 113 113;
    --color-info:    96 165 250;
    --color-accent-text: 165 180 252;   /* lightened for 4.5:1 on dark bg */
  }
}

@theme inline {
  --color-bg: rgb(var(--color-bg));
  --color-surface: rgb(var(--color-surface));
  --color-border: rgb(var(--color-border));
  --color-text: rgb(var(--color-text));
  --color-accent: rgb(var(--color-accent));
  --radius-lg: var(--radius-lg);
  /* …one line per token */
}
```

### The five accents

`styles/accents.css`, imported after the token file:

```css
[data-accent="indigo"] { --color-accent: 79 70 229;  --color-accent-container: 238 240 254; --color-accent-soft: 232 234 253; --color-accent-text: 79 70 229; }
[data-accent="teal"]   { --color-accent: 13 148 136; --color-accent-container: 230 247 245; --color-accent-soft: 223 243 240; --color-accent-text: 13 148 136; }
[data-accent="amber"]  { --color-accent: 180 83 9;   --color-accent-container: 253 243 227; --color-accent-soft: 251 235 213; --color-accent-text: 180 83 9; }
[data-accent="rose"]   { --color-accent: 190 18 60;  --color-accent-container: 253 233 238; --color-accent-soft: 251 220 228; --color-accent-text: 190 18 60; }
[data-accent="violet"] { --color-accent: 124 58 237; --color-accent-container: 242 235 254; --color-accent-soft: 235 224 253; --color-accent-text: 124 58 237; }

.dark[data-accent="indigo"] { --color-accent-text: 165 180 252; }
.dark[data-accent="teal"]   { --color-accent-text:  94 234 212; }
.dark[data-accent="amber"]  { --color-accent-text: 252 211 77; }
.dark[data-accent="rose"]   { --color-accent-text: 253 164 175; }
.dark[data-accent="violet"] { --color-accent-text: 196 181 253; }
```

Applied by writing two attributes on `<html>`: `data-accent` and `class="dark"`. Persisted in
`localStorage` and, when the user is logged in, in `user.prefs` so it follows them between
devices and between web and mobile.

---

## 3.2 shadcn variable mapping

shadcn components expect its own variable names. Map them to ours so you never maintain two
palettes:

```css
:root {
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --popover: var(--color-surface-raised);
  --popover-foreground: var(--color-text);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-accent-on);
  --secondary: var(--color-bg-subtle);
  --secondary-foreground: var(--color-text);
  --muted: var(--color-bg-subtle);
  --muted-foreground: var(--color-text-secondary);
  --accent: var(--color-accent-soft);
  --accent-foreground: var(--color-accent-text);
  --destructive: var(--color-danger);
  --border: var(--color-border);
  --input: var(--color-border);
  --ring: var(--color-accent);
  --radius: var(--radius-md);
}
```

shadcn components then inherit the theme automatically, including the five accents.

---

## 3.3 Type scale (web is denser than mobile)

| Token | Size / line / weight | Use |
|---|---|---|
| `display` | 30 / 36 / 700 | dashboard hero numbers |
| `h1` | 22 / 28 / 600 | page title |
| `h2` | 17 / 24 / 600 | section |
| `h3` | 14 / 20 / 600 | card title |
| `body` | 13 / 20 / 400 | default UI text |
| `body-strong` | 13 / 20 / 500 | emphasis |
| `label` | 12 / 16 / 500 | chips, meta |
| `caption` | 11 / 14 / 500 | timestamps, counters |
| `mono` | 12 / 18 / 400 | ids, device strings |

Numbers use `font-variant-numeric: tabular-nums`.

---

## 3.4 Component parity table

Same name, same meaning, different primitives. This table is the contract — if a component
exists on mobile, it must look and behave like its sibling on web.

| Concept | Mobile | Web | Notes |
|---|---|---|---|
| Button | `ui/Button` | shadcn `Button` + variants | identical variants: primary/secondary/ghost/danger/icon |
| Chip | `ui/Chip` | shadcn `Badge` + custom `Chip` | selectable, with count |
| Input | `ui/Input` | shadcn `Input` | same heights: sm 32 / md 36 / lg 44 (web is denser) |
| Sheet | `ui/Sheet` | shadcn `Sheet` (right side) | web drawer slides from the right |
| Dialog | `ui/Dialog` | shadcn `Dialog` | |
| Menu | `ui/Menu` | shadcn `DropdownMenu` | |
| Toast | `ui/Toast` | `sonner` | |
| Avatar | `ui/Avatar` | shadcn `Avatar` | |
| Priority | `PriorityDot` | `PriorityDot` | same colours, same dot size |
| Severity | `SeverityBadge` | `SeverityBadge` | 5 levels, same labels |
| Label pill | `LabelPill` | `LabelPill` | accent-tinted |
| Task row | `TaskRow` | `TaskRow` | mobile: 2 lines; web: 1 line + hover actions |
| Sticky | `StickyCard` | `StickyCard` | same rotation formula, same pastel |
| Empty state | `EmptyState` | `EmptyState` | **same SVG illustrations** from `@doit/tokens/assets` |
| Navbar | `FloatingNavBar` (pill) | `Sidebar` + `Topbar` | web does not float — it docks |

The last row matters: **do not** put a floating pill navbar on the web. It is a thumb-reach
pattern. Web gets a docked sidebar, which is the desktop equivalent of the same information.

---

## 3.5 Keyboard model (web's superpower)

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | command palette: search, navigate, create, switch workspace |
| `c` | create task in the current context |
| `b` | report a bug |
| `g` then `b`/`m`/`i`/`u` | go to board / my day / inbox / upcoming |
| `/` | focus search |
| `j` / `k` | move selection down/up in a list |
| `Enter` | open selected |
| `Esc` | close drawer / clear selection |
| `?` | shortcuts sheet |
| `⌘Enter` | submit the open composer |

Never fire a shortcut while focus is in a text field. Show a `?` hint in the corner on first
visit.

---

## 3.6 Accessibility

- Radix gives focus traps, roving tabindex and ARIA for free — do not hand-roll dialogs.
- Every icon-only button gets `aria-label`.
- Board drag-and-drop must work from the keyboard (`@dnd-kit` keyboard sensor) — this is the
  thing most kanban clones get wrong.
- Focus ring: `2px` `--color-accent` with `2px` offset, always visible on `:focus-visible`.
- Contrast: the same token pairs as mobile, verified by a script in CI.
- `prefers-reduced-motion` disables the drawer slide and card lift.

---

## 3.7 The lint rule (evolves from `check-tokens.mjs`)

Mobile's rule was "no hex outside `theme/`". With Tailwind that becomes:

- ✅ `className="bg-surface text-text-secondary border-border"`
- ✅ `className="bg-accent text-accent-on"`
- ❌ `className="bg-[#4F46E5]"` — arbitrary colour
- ❌ `style={{ color: '#4F46E5' }}` — inline colour
- ❌ `className="text-blue-500"` — a Tailwind palette colour that bypasses our tokens

Add to the existing script: fail on `bg-[#`, `text-[#`, `border-[#`, `style={{` containing a
colour, and any `(bg|text|border|ring)-(slate|gray|zinc|blue|green|red|amber|violet|indigo)-\\d`.

---

## 3.8 What "professional" means concretely

- 1 px hairline borders everywhere, never shadows on flat content.
- Hover states on every interactive row (desktop users expect them; mobile does not have them).
- Row hover reveals row actions; they are not permanently visible.
- No rounded-2xl cards on web — `--radius-md` (12 px) for cards, `--radius-lg` for sheets.
- Tables and lists align to a baseline grid; numbers are tabular.
- Empty states use the same isometric illustrations, at 160 px, centred, with one primary action.
- Loading is a skeleton matching the final layout, never a spinner in the middle of the page.
