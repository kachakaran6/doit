# 00 — Why It Doesn't Feel Premium

I looked at all nine screens. The app is **not broken** — it is **flat**. Every screen is
correct, consistent-ish and immediately recognisable as software. What it is missing is the
layer that separates "a working app" from "a designed one".

Here is the diagnosis, cause by cause. Each one is fixable, and none of them requires new
features.

---

## The five things that make it read as "developer UI"

### 1. Everything is the same grey, so depth has to come from borders

Your canvas, cards, chips and nav all sit within about 4% of each other in lightness. To make a
card visible at all, it has to be outlined. So almost every element on the screen has a 1px
border: the workspace pill, the project card, the stat chips, every task card, every filter chip,
the New button, the close button, the board columns, the cards inside the columns, the account
sheet rows, the log-out button.

That is **roughly fifteen borders per screen**. A border is the cheapest way to separate two
surfaces, and it is also the fastest way to make an interface look like a wireframe.

Premium dark UIs (Linear, Things, Arc, Apple's own dark mode) use **lightness** to separate
surfaces and reserve borders for things that genuinely need an edge — inputs, dividers,
destructive zones. Depth is a *ladder*, not an outline.

**Fix:** `02-SURFACE-SYSTEM.md` — a four-step surface ladder, borders removed from cards
entirely, replaced by a 6% inner top highlight.

### 2. Colour is almost entirely absent

Apart from the violet accent on links, the active tab and one button, the app is greyscale. The
avatars are grey circles with a grey letter. The stickies are grey cards. The priority is not
shown at all. Labels are not shown. Nothing on screen says "this is urgent", "this is a bug",
"this is mine".

Colour is the fastest carrier of meaning a UI has, and you are using about 2% of it.

But the fix is not "add colour everywhere" — that produces a toy. The rule is: **colour appears
only where it carries information, on roughly 10% of pixels, at full saturation but small area.**
A 6px priority dot, a tinted sticky, a label pill.

**Fix:** `04-COLOUR-AS-INFORMATION.md`.

### 3. One font weight does all the work

`Tasks`, `Your Work`, `New Task`, `Bug Queue`, `Settings`, `Appearance` — all set at 600–700
weight, and all large. Because everything is bold, nothing is emphasised. The hierarchy is flat,
so the eye has no entry point, and the screen feels like a form rather than a composition.

Apple's own type discipline: **one weight jump per screen**. Titles at 600, body at 400, meta at
500. Size carries hierarchy; weight carries emphasis; never both at once on the same element.

Also missing: size-specific tracking. Large text needs *negative* tracking (−0.4 to −1.0) to look
optically correct; small caps need positive (+0.4 to +0.8). Setting every size at 0 tracking is
why the big titles look slightly loose and the small labels look slightly cramped.

**Fix:** `03-TYPE-SYSTEM.md`.

### 4. The lower third of every screen is empty

Look at your screenshots: Home has content for 45% of the height, then 40% black. Tasks has two
rows and then nothing. Search is a title, a field and a sentence floating in ~1000px of void. The
Bug Queue has a centred empty state and then a void.

This is the single strongest "unfinished" signal in the whole app. A premium screen is
**composed to the bottom**: it either fills with content, or it deliberately centres one thing,
or it ends with a quiet terminal element. It never trails off.

**Fix:** `06-COMPOSITION.md` — the "bottom third" rule, and the five valid ways to resolve a
screen.

### 5. Nothing moves, and nothing responds

There is no evidence of press feedback, no transition between screens, no skeleton, no success
moment. Premium is largely a *temporal* quality — how things arrive, settle and respond. A
static screenshot can look good and still feel dead in the hand.

**Fix:** `05-MOTION.md`.

---

## The smaller things that add up

| # | Observation | Fix |
|---|---|---|
| 6 | Selected states use **two different treatments**: filter chips fill, priority/accent/mode chips use a violet outline. | one rule: selected = filled `L3`, no outline |
| 7 | The accent picker still shows **no colour swatches** — "Teal", "Amber", "Rose" are text only. The user cannot see what they are choosing. | swatch + label |
| 8 | The compose screen is a **full page**, not a sheet — and it leaves a 900px void below Cancel/Create. | sheet with detents, footer pinned |
| 9 | `Cancel` / `Create Task` are **left-aligned** at the bottom. | right-aligned pair, or full-width primary |
| 10 | The OS keyboard opens **teal** because `keyboardAppearance` is not set. It fights the app's palette in every composer. | `keyboardAppearance="dark"` |
| 11 | **Log Out** is the loudest element on the account sheet — a full-width red-outlined button. | quiet destructive row, red text only |
| 12 | Section headers are **three different styles**: `YOUR WORK` (uppercase), `Appearance` (sentence case, 26/700), `Quick Capture & Hardware Integration` (22/700, overflows). | one `SectionHeader` |
| 13 | Stat chips say **"1 Stickies"**. | pluralisation helper |
| 14 | The empty-state icon sits in a **grey rounded square** that reads as a disabled button. | bare icon, 64px, muted |
| 15 | Board columns have borders, and the cards inside them have borders — **nested borders**. | column = tinted surface, card = lifted surface |
| 16 | Severity filter says **Trivial**, the spec says **Cosmetic**. | one vocabulary |
| 17 | Icons vary in weight and size (18–22px, 2–3px stroke). | one set, 1.75 stroke, 20/24 only |
| 18 | Navbar: 4 labelled tabs + a FAB that **overlaps** the pill. | 3 destinations + centre action, no overlap |
| 19 | `Alice Sharmay's Workspace` — seed data typo visible in the header. | fix the seed |
| 20 | Task cards show **only an ID and a title**. No due date, no priority, no assignee, no labels — so the card looks empty even though it is correct. | meta row + trailing avatar |

---

## What "premium" actually decomposes into

Not a style. Six measurable properties:

| Property | What it means | Where it is specified |
|---|---|---|
| **Depth** | 4 lightness steps, no card borders, inner highlight | `02-SURFACE-SYSTEM.md` |
| **Restraint** | colour on ~10% of pixels, one accent, semantic only | `04-COLOUR-AS-INFORMATION.md` |
| **Rhythm** | a 4pt scale with a fixed vertical cadence per section | `06-COMPOSITION.md` |
| **Optics** | size-specific tracking, one weight jump, tabular numerals | `03-TYPE-SYSTEM.md` |
| **Response** | every tap answers in <100ms, springs not linear | `05-MOTION.md` |
| **Composition** | the screen resolves at the bottom | `06-COMPOSITION.md` |

Get those six right and any colour scheme looks expensive. Get them wrong and no colour scheme
saves it.

---

## Honest note

Your last two rounds fixed *correctness* — contrast, radii, alignment. That work was necessary
and it shows: the app is now consistent. This kit is about the layer above correctness, and it
cannot be verified by a lint rule. It is verified by putting two screenshots side by side and
asking whether the right one looks more expensive. That is what `assets/BEFORE-AFTER.png` does.
