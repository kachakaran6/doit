# 04 — Colour as Information

The app is ~99% greyscale. The fix is not "add colour" — it is **make colour mean something**,
then use it sparingly.

---

## 4.1 The three colour jobs

| Job | Colour source | Area budget |
|---|---|---|
| **Identity** | the one accent (user-chosen) | links, primary action, active nav, focus |
| **Meaning** | semantic scales (priority, severity, state) | small marks: 6px dots, 20px pills |
| **Content** | derived tints (stickies, labels, avatars) | larger but low-saturation blocks |

Never mix them. An "urgent" task must not be coloured with the user's accent, or changing the
accent would change the meaning.

## 4.2 Identity — the accent

Already defined in the token file (five accents, all ≥4.5:1). Usage rules:

- **One** primary button per screen region.
- **One** link colour per section (the section action).
- Active nav item: icon + label in `accent`.
- Focus ring: 2px `accent`, 2px offset.
- Selected chip: `L3` surface **plus** `accent` text — not an accent border.

> The current app outlines selected chips in violet. That is a border doing a fill's job. Fill it.

## 4.3 Meaning — semantic scales

**Priority** — a 6px dot plus an optional 12px label, both in the same colour:

| Level | Dark | Light | Ratio (dark) |
|---|---|---|---|
| Low | `#8B919E` | `#767D8B` | 5.61 |
| Medium | `#60A5FA` | `#1A73E8` | 6.98 |
| High | `#FBBF24` | `#B45309` | 10.63 |
| Urgent | `#F87171` | `#D93025` | 6.41 |

**Severity** — pills, 20 tall, radius 10:

| Level | Treatment |
|---|---|
| Blocker | solid `#DC2626`, white text — the only filled badge |
| Critical | `#F87171` text on `rgba(248,113,113,0.12)` |
| Major | `#FBBF24` on `rgba(251,191,36,0.12)` |
| Minor | `#60A5FA` on `rgba(96,165,250,0.12)` |
| Cosmetic | `#8B919E` on `rgba(139,145,158,0.12)` |

**Due state** — never colour the whole row. Colour only the due text:

| State | Colour |
|---|---|
| Overdue | `#F87171` |
| Today | `#FBBF24` |
| Tomorrow / this week | `textSecondary` |
| No date | nothing rendered |

## 4.4 Content — derived tints

**Stickies** take a tint from the accent family, at very low saturation:

| Dark | Light |
|---|---|
| bg `rgba(accent, 0.14)` | bg `accentSoft` |
| text `accentText` | text `accentText` |
| border 1px `rgba(accent, 0.24)` | none |

Plus the deterministic rotation (−1.5°…+1.5°) from `hash(id)`. A sticky that is a grey rectangle
is not a sticky.

**Labels** are 20px pills: `rgba(labelColour, 0.12)` background, `labelColour` text, radius 10.
Label colours come from the same five-accent set via `accentFor(labelId)` — not a sixth palette.

**Avatars and workspace tiles** use `accentFor(id).fill` with white initials. Two different
functions produced the olive/steel-blue/amber chaos in the last report; there must be exactly
one.

## 4.5 The 10% rule

Screenshot the screen, then mentally circle every coloured pixel. If it is more than ~10% of the
surface, you have overdone it. If it is under ~3%, the screen is probably missing meaning.

The target for a task list: 4 priority dots, 2 due-date texts, 2 label pills, 1 avatar — all
small, all meaningful. That is about 4% of the pixels and it transforms the screen.

## 4.6 What must never be coloured

- Body text (always `text` or `textSecondary`).
- Card backgrounds (always a ladder step, never a tint) — except stickies.
- Whole rows (a red row for an overdue task is a shout, not a signal).
- Buttons that are not the primary action.
- Icons in a list (they inherit `textSecondary`).

## 4.7 Dark-mode saturation

Saturated colours vibrate against a near-black canvas. Pull saturation down ~10% and lightness up
~8% versus their light-mode values — which is what the token table already does. Do not use a
light-mode hex in dark mode.
