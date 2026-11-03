# 06 — Composition & Density

The app's most visible flaw is that every screen stops at about 45% height and leaves black below.
This file is how to fix that and how to make rows earn their space.

---

## 6.1 The bottom-third rule

> Every screen must have a deliberate answer to *"what fills the bottom third?"*

The five valid answers (from `01-PREMIUM-PRINCIPLES.md` P5):

| Answer | When | Example |
|---|---|---|
| **Content fills** | lists with 6+ items | Tasks, Bugs |
| **Terminal block** | short content | Home → recent activity feed |
| **Centred empty state** | genuinely empty | Bug queue with no bugs |
| **Sticky footer** | a form | New Task sheet |
| **Large element** | a hero moment | project overview numbers |

Invalid: content ends and nothing follows. If a screen has 3 items, it needs a terminal block.
On Home that block is **recent activity** — it is already in your data model and it makes the
screen feel like a workspace rather than a list.

## 6.2 Vertical rhythm

One cadence, everywhere:

| Gap | Value |
|---|---|
| Between sections | 32 |
| Between a section header and its first row | 12 |
| Between rows inside a group | 12 |
| Between a row and its helper text | 4 |
| Between a label and its field | 8 |
| Between field groups | 20 |
| Screen top to first element | 16 (plus safe area) |
| Last element to navbar | 24 |

**No element may have a one-off margin.** If a gap is not on this list, the layout is wrong.

## 6.3 Row anatomy (the density fix)

A row must carry at least four information elements or it looks empty.

```
┌────────────────────────────────────────────────────────┐
│  [cb]   GEN-1                                          │
│         ● High   ·  Due today                  ( A )   │
│         Verify task screenshot                         │
│         [overlay] [android]                            │
└────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Checkbox | 28 visual, 44 hit area, left, vertically centred |
| Meta row | `label` 12/500 — ID in `textMuted`, priority dot + name, due text |
| Title | `h3` 18/600, `text`, max 2 lines |
| Labels | 20px pills, only if present |
| Avatar | 28, right, only if assigned |
| Padding | 16 |
| Min height | 96 (meta + title), 124 with labels |

Current rows show ID + title only. That is why they read as placeholders.

## 6.4 Card padding and inner spacing

- Card padding 16 all round.
- Inside a card: 8 between meta and title, 10 between title and labels.
- A divider between rows *inside one card* is inset 16 from the left and right — never full width.

## 6.5 Grouping

Related things share a card; unrelated things get separate cards.

| Screen | Grouping |
|---|---|
| Home | one card per section |
| Tasks | one card per task (they are peers, not a group) |
| Activity | **one** card containing all rows, divided |
| Settings | one card per settings group |

Home currently has a card per task *and* a section header — that is two grouping levels for two
items. Use one card containing both rows, divided.

## 6.6 Empty states

```
        ┌─────────┐
        │  icon   │   64px, textMuted, bare — NO rounded container
        └─────────┘
      No bugs reported
   Everything is clear in this view.
        [ Report a bug ]
```

| Part | Spec |
|---|---|
| Icon | 64, `textMuted`, no background box |
| Gap | 20 |
| Title | `h3` 18/600, `text` |
| Body | `body` 15, `textSecondary`, max 2 lines, centred |
| Gap | 20 |
| Action | one `secondary` button, 40 tall |
| Position | centred in the space between the filter row and the navbar |

The grey rounded square around your empty-state bug icon reads as a disabled button. Remove it.

## 6.7 The board

Columns currently have borders, and the cards inside them have borders — nested outlines.

| Element | Treatment |
|---|---|
| Column | `L1` surface, radius 20, padding 12, **no border** |
| Column header | `eyebrow` + count pill, 32 tall |
| Card | `L2` surface, radius 16, padding 12 |
| Gap between cards | 8 |
| Column width | 280, gap 12, horizontal scroll with 16 leading inset |

Nested borders disappear; the lightness difference does the work.

## 6.8 Header composition

```
GENERAL
Tasks                                   [List | Board]
2 open
```

| Element | Spec |
|---|---|
| Eyebrow | `eyebrow`, `textMuted` — project key + name |
| Title | `h1` 30/600, tracking −0.6 |
| Subtitle | `bodySmall` 13, `textSecondary` — count, human words |
| Trailing | `SegmentedControl` or a single `Button size="md"`, **centre-aligned with the title** |

No "+ New" pill next to a 30px title — use the centre capture action in the navbar for creation,
and keep the header trailing slot for a view switch.

## 6.9 What to do when a screen has very little content

Three options, in order of preference:

1. **Add the next real thing** (activity, summary, related items). Best.
2. **Make the existing thing large** — a hero number, a big card.
3. **Centre an empty state** and accept the space.

Never leave a screen with a header and two rows ending at 45%.
