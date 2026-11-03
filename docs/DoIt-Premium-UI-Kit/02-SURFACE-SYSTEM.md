# 02 — Surface System (the biggest single win)

This one change does more for the app than everything else combined.

---

## 2.1 The ladder

Four surfaces. Each step is 4–8% lighter than the one below. Nothing else may be a background.

| Level | Token | Hex | Used for |
|---|---|---|---|
| **L0** | `bg` | `#08090A` | the canvas — nothing sits on it directly except sections |
| **L1** | `surface` | `#0F1012` | cards, list rows, project card |
| **L2** | `surfaceRaised` | `#16181B` | inputs, chips, stat tiles, popovers |
| **L3** | `surfaceOverlay` | `#1D2024` | selected chips, pressed states, sheet handles |

Light theme mirrors it:

| Level | Token | Hex |
|---|---|---|
| L0 | `bg` | `#FFFFFF` |
| L1 | `surface` | `#FFFFFF` + hairline shadow |
| L2 | `surfaceRaised` | `#F6F7F9` |
| L3 | `surfaceOverlay` | `#ECEEF2` |

In light mode the ladder is achieved with **tint**, not lightness (you cannot go lighter than
white). Cards get a 1px `#E4E6EB` border **and** a 1px shadow — the only place borders survive.

## 2.2 The inner highlight (replaces the border)

Every L1 and L2 surface gets a 1px line of `rgba(255,255,255,0.06)` along its **top edge only**,
inset by the corner radius.

```tsx
// components/ui/Surface.tsx
<View style={[styles.base, { backgroundColor: t.surface }]}>
  <View style={styles.topHighlight} pointerEvents="none" />
  {children}
</View>

const styles = StyleSheet.create({
  base: { borderRadius: 20, overflow: 'hidden' },
  topHighlight: {
    position: 'absolute', top: 0, left: 20, right: 20, height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
```

That is the entire trick. It gives the eye an edge to catch without drawing a box.

## 2.3 Where borders are still allowed

Only four places:

| Element | Border |
|---|---|
| Inputs (rest) | 1px `border` — a field needs to be locatable |
| Dividers between rows inside one card | 1px `rgba(255,255,255,0.05)`, inset 16 from the text edge |
| Focus ring | 2px `accent`, 2px offset |
| Destructive zones | 1px `danger` at 30% |

**Cards, chips, navbars, sheets, buttons: no border.** This removes ~12 of the ~15 outlines per
screen.

## 2.4 Shadows

In dark mode shadows are nearly invisible, so they are used for **separation from content beneath
a floating element**, never for depth on a static card.

| Element | Shadow |
|---|---|
| Floating navbar | `0 8px 32px rgba(0,0,0,0.55)` |
| FAB / centre action | `0 6px 20px rgba(0,0,0,0.45)` |
| Sheet | `0 -12px 40px rgba(0,0,0,0.6)` |
| Toast | `0 8px 24px rgba(0,0,0,0.5)` |

Static cards: **no shadow**. They get the ladder + highlight only.

## 2.5 Materials (blur)

Exactly two surfaces use blur, both via `expo-blur`:

| Surface | Blur |
|---|---|
| Floating navbar | `intensity 40`, `tint dark`, 92% opacity `surface` on top |
| Sheet backdrop | `intensity 20`, `tint dark` |

Android note: `expo-blur` falls back to a solid colour on older devices. Set a solid fallback of
`#181A1E` at 96% so it never looks broken — do not attempt a third-party blur library.

## 2.6 Radius — four values, by role

| Radius | Value | Applies to |
|---|---|---|
| `sm` | 12 | inputs, small chips, label pills |
| `md` | 16 | buttons, stat tiles |
| `lg` | 20 | **cards, list rows** |
| `xl` | 28 | sheets, the project hero card |
| `pill` | 999 | avatars, filter chips, navbar, FAB |

Cards at 20 and buttons at 16 is the pairing that reads modern. A 12px card next to a 999px
button is what reads "assembled".

## 2.7 The rule that replaces everything else

> **If two surfaces touch, they must differ by at least one ladder step. If they are the same
> level, separate them with an inset divider — never a full border.**

Apply that and the wireframe look disappears.
