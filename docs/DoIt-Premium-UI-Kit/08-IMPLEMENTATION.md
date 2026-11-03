# 08 — Implementation (React Native)

How to build the system in this stack without fighting it.

---

## 8.1 Packages

| Need | Package | Note |
|---|---|---|
| Styling | **NativeWind v5** | class names resolve to the shared `theme.css` tokens |
| Components | **gluestack-ui v5** | copy-paste primitives; wrap them, never use directly |
| Animation | **react-native-reanimated 3** | springs, layout animations, shared elements |
| Gestures | **react-native-gesture-handler** | |
| Sheets | **@gorhom/bottom-sheet** | detents + keyboard + scroll. One sheet system only |
| Lists | **@shopify/flash-list** | |
| Blur | **expo-blur** | navbar + sheet backdrop only |
| Haptics | **expo-haptics** | |
| Icons | **lucide-react-native** | stroke 1.75, sizes 20/24 only |
| Safe area | **react-native-safe-area-context** | |
| Gradients (optional) | **@shopify/react-native-skia** | only for the splash and the empty-state illustration |

Install the gluestack agent skill so your coding agent follows v5 conventions:

```bash
npx skills add gluestack/agent-skills --skill gluestack-ui-v5
```

## 8.2 The component set to build

Everything else composes from these.

| Component | Built on | Key contract |
|---|---|---|
| `Surface` | `View` | ladder level + inner highlight, radius by role |
| `Text` | `Text` | variant only (see type scale), never raw size |
| `Button` | gluestack Button | 4 variants × 3 sizes, 5 states, radius 16 |
| `IconButton` | `Pressable` | 40×40, radius 12 |
| `Field` | gluestack Input | 48 tall, label above, radius 12 |
| `Chip` | gluestack Badge | 32 tall, pill, selected = filled `L3` |
| `Row` | `Pressable` | the row anatomy from §6.3 |
| `SectionHeader` | `View` | eyebrow + count + action |
| `Sheet` | `@gorhom` | detents 0.5/0.9, footer pinned |
| `EmptyState` | `View` | bare icon, title, body, one action |
| `Skeleton` | Reanimated | matches the real layout |
| `Toast` | custom | one at a time, above the navbar |
| `NavBar` | custom | 3 items + centre action, blur |

## 8.3 The tokens file

One file, consumed by NativeWind and by the web app:

```css
@layer theme {
  :root {
    /* ladder */
    --color-bg: 8 9 10;
    --color-surface: 15 16 18;
    --color-surface-raised: 22 24 27;
    --color-surface-overlay: 29 32 36;

    /* text */
    --color-text: 242 243 245;
    --color-text-secondary: 154 160 170;
    --color-text-muted: 108 115 128;

    /* semantic */
    --color-priority-low: 139 145 158;
    --color-priority-medium: 96 165 250;
    --color-priority-high: 251 191 36;
    --color-priority-urgent: 248 113 113;

    /* radius by role */
    --radius-sm: 12px; --radius-md: 16px; --radius-lg: 20px;
    --radius-xl: 28px; --radius-pill: 999px;

    /* rhythm */
    --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
    --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  }
  .light { /* mirrored, see 02-SURFACE-SYSTEM.md §2.1 */ }
}
```

## 8.4 Component sketch — the row

```tsx
export function TaskRow({ task }: { task: Task }) {
  const t = useTheme();
  return (
    <Surface level={1} radius="lg" style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable hitSlop={10} style={{ width: 44, alignItems: 'center' }}>
          <Checkbox checked={task.done} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="label" color="muted">{task.humanId}</Text>
            {task.priority && <PriorityDot level={task.priority} withLabel />}
            {task.dueAt && <DueText date={task.dueAt} />}
          </View>
          <Text variant="h3" numberOfLines={2} style={{ marginTop: 8 }}
                strikethrough={task.done}>
            {task.title}
          </Text>
          {task.labels.length > 0 && <LabelPills labels={task.labels} style={{ marginTop: 10 }} />}
        </View>

        {task.assignee && <Avatar user={task.assignee} size={28} />}
      </View>
    </Surface>
  );
}
```

Note: no colour literals, no font sizes, no radii — all from the token layer. That is what makes
it consistent for free.

## 8.5 Order of work

1. Tokens + `Surface` + `Text` + `Button` → then the gallery.
2. Row, Chip, Field, SectionHeader.
3. Navbar + insets + sheet.
4. Screens, one at a time, each reviewed against `10-REVIEW.md`.
5. Motion pass last — it is easier to add springs to a finished layout than to a moving target.

## 8.6 What not to do

- Do not use `styled-components` or inline style objects per render.
- Do not install a second icon set.
- Do not use two sheet libraries.
- Do not animate `height`.
- Do not add a shadow to a static card in dark mode.
- Do not put a border on a card.
