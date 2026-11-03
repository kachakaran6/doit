# 03 — Type System

The app currently uses one heavy weight at every size, with zero tracking adjustment. That is
why it reads as a form rather than a composition.

---

## 3.1 The scale

| Token | Size | Line | Weight | Tracking | Colour | Use |
|---|---|---|---|---|---|---|
| `display` | 40 | 46 | 600 | −1.0 | `text` | hero numbers only |
| `h1` | 30 | 36 | 600 | −0.6 | `text` | screen title — **one per screen** |
| `h2` | 24 | 30 | 600 | −0.3 | `text` | sheet title, section hero |
| `h3` | 18 | 24 | 600 | −0.1 | `text` | card title, row title |
| `body` | 15 | 22 | 400 | 0 | `text` | default |
| `bodyStrong` | 15 | 22 | 500 | 0 | `text` | emphasis |
| `bodySmall` | 13 | 19 | 400 | 0 | `textSecondary` | helper text |
| `label` | 12 | 16 | 500 | +0.2 | `textSecondary` | meta row |
| `eyebrow` | 11 | 14 | 600 | +0.8 | `textMuted` | section labels, uppercase |
| `numeric` | 15 | 20 | 600 | 0 | `text` | counters, **tabular** |

## 3.2 The three rules that fix the flatness

**Rule 1 — one weight jump per screen.**
Title 600. Everything else 400 or 500. If a title needs emphasis, change its size, not its weight.
Never 700 anywhere except a hero number.

**Rule 2 — tracking is size-dependent.**
Type is drawn for 16px. Scaled up it looks loose; scaled down it looks cramped. Correct it:

```
size >= 32  →  tracking −1.0
size 24–31  →  tracking −0.4
size 18–23  →  tracking −0.2
size 15–17  →  tracking  0
size 12–14  →  tracking +0.2
size <= 11  →  tracking +0.8   (uppercase labels only)
```

**Rule 3 — hierarchy is carried by size and colour together, never weight alone.**

| Level | Size | Colour |
|---|---|---|
| Screen title | 30 | `text` |
| Section label | 11 uppercase | `textMuted` |
| Row title | 18 | `text` |
| Row meta | 12 | `textSecondary` |
| Helper | 13 | `textSecondary` |

## 3.3 Numerals

All counters, IDs and dates use `fontVariant: ['tabular-nums']`. Without it, a counter going
`9 → 10` shifts every element to its right by 4px — a small thing that makes a UI feel unstable.

## 3.4 Section headers — one component

The app currently has three styles (`YOUR WORK`, `Appearance`, `Quick Capture & Hardware
Integration`). Replace all three with:

```
YOUR WORK   ②                              Add task
─────────────────────────────────────────────────────
```

| Part | Spec |
|---|---|
| Label | `eyebrow` — 11/600, +0.8, uppercase, `textMuted` |
| Count | 20×20 pill, `L2`, `label` size, `textSecondary`, tabular |
| Action | `label` 12/500, `accent`, right-aligned |
| Height | 32, margin-bottom 12, margin-top 32 |

The action is optional. The count is optional. The **style is not**.

## 3.5 Font

Keep Inter — it is the right choice. Two adjustments:

- Load **only** the weights you use (400, 500, 600) to cut the bundle and prevent accidental 700.
- Set `fontFamily` explicitly on every text token. Do not rely on the system default, or Android
  falls back to Roboto and the whole app shifts weight.

If you want a more distinctive feel, **Instrument Sans** or **Geist** are drop-in alternatives
with the same metrics philosophy. Do not mix families.

## 3.6 Copy is part of type

- Sentence case for titles and buttons ("Add task", not "Add Task").
- Uppercase **only** for eyebrow labels, max 3 words.
- Numbers spelled correctly: "1 sticky", "2 stickies".
- Never truncate a title to fit — clamp to 2 lines and let the row grow.

---

## Before / after on one element

**Now:** `Tasks` at 34/700, tracking 0, next to a 12px grey ID.

**After:** `Tasks` at 30/600, tracking −0.6, with `GENERAL` above it at 11/600 +0.8 in `textMuted`,
and a 12px meta row inside each card. Same words, three levels of hierarchy instead of one.
