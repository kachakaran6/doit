# 01 — The Principles (what the good ones actually do)

Decomposed from Linear, Things 3, Arc, Raycast, Apple's own first-party apps, and Vercel's
dashboard. These are transferable rules, not styles to copy.

---

## P1 — Depth is lightness, not lines

A premium dark UI has a **ladder** of 4 surfaces. Adjacent steps differ by 4–8% lightness — enough
to read instantly, never enough to look like two different materials.

Borders then become almost unnecessary. What replaces them is an **inner top highlight**: a 1px
line of white at 6% opacity along the top edge of every raised surface. It reads as a light
source above the screen and gives the card a physical edge without an outline.

> Test: remove every card border. If the layout collapses visually, the ladder is too shallow.

## P2 — One accent, used like punctuation

A single accent colour, used on: the primary action, the active nav item, one link per section,
and focus rings. Nothing else.

Everything else that needs colour is **semantic** — priority, severity, state, label categories —
and each semantic colour is used at small area (a 6px dot, a 20px pill, a 24px tint).

> Test: screenshot the screen, desaturate it. If it still reads, the colour was decorative. If it
> loses meaning, the colour was doing work.

## P3 — Type: size carries hierarchy, weight carries emphasis

- Titles 600, content 400–500, meta 500. **Never** 700 on a title.
- Exactly one `h1` per screen.
- Tracking is size-dependent: −0.8 at 32px, −0.4 at 24px, 0 at 15px, +0.6 at 11px.
- Numbers are tabular so counters do not jitter.
- Line-height 1.35 for titles, 1.5 for body, 1.2 for labels.

> Test: blur the screen by 8px. You should still see three distinct levels.

## P4 — Density with air

Premium apps are **denser** than you think, and calmer than you expect. A task row carries an ID,
a priority, a due date, a title, labels and an avatar — but with 8px between elements and one
type size per level.

The trick is that density comes from *information*, not from shrinking padding. Keep 16px card
padding and add content; never reduce padding to fit more.

> Test: count the information elements per row. Fewer than 4 means the row is under-designed.

## P5 — The screen resolves

Every screen ends deliberately. The five valid endings:

1. **Content fills** to the navbar (long lists — the default).
2. **A terminal block** — activity feed, summary card, footer note.
3. **A centred empty state**, optically centred in the space above the navbar.
4. **A sticky footer action** with content scrolling beneath it.
5. **A deliberate large-format element** — an illustration or a hero number.

What is never valid: content stopping at 45% and black below.

## P6 — Motion is physics, not animation

- Springs, not durations, for anything that responds to touch.
- 90ms for press, 240ms for sheets, 320ms for screen transitions.
- Nothing animates that the user did not cause, except one: content arriving.
- Reduced motion disables springs, keeps fades.

> Test: press every interactive element. If it does not respond within 100ms, it feels broken.

## P7 — Materials are used sparingly

Blur belongs on exactly two things: the floating navbar and sheets that overlay content. Every
other surface is opaque. Blur everywhere is the fastest way to look like a 2019 iOS clone.

## P8 — Empty is a state, not an absence

An empty screen is the first thing a new user sees and the last thing anyone designs. It needs:
one illustration (or a large muted icon), a title in `h3`, one line of body, and one action. All
vertically centred in the available space — not pinned to the top.

## P9 — The 60% rule

If a screen is more than 60% chrome (headers, tabs, filters, nav) the content is being crowded
out. If it is more than 60% content with no breathing room, it is dense without rhythm. Aim for
60% content, 25% air, 15% chrome.

## P10 — Consistency is a system, taste is the delta

Two screens can each be beautiful and still look like different apps. What makes them feel like
one product is: the same gutter, the same card radius, the same type scale, the same three
colours, the same motion curve. Taste decides *which* values; the system enforces them.

---

## The anti-patterns to delete

| Anti-pattern | Why it reads cheap |
|---|---|
| Borders on every card | wireframe, not interface |
| Shadows in dark mode | invisible, so they only add noise |
| Two selected-state treatments | looks assembled from two libraries |
| A pill button next to a 12px card | two radius systems fighting |
| Centred empty text with no illustration | reads as an error, not a state |
| A full-width destructive button | shouts at the user |
| Icons at 5 different sizes | reads as clip-art |
| Bold everywhere | no entry point for the eye |
