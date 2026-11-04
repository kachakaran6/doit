# 01 — Audit of the current app (9 real-device screenshots in `reference/current/`)

Verdict: functionally rich, visually **wireframe-grade**. Not Apple-grade because of *systemic* issues, not a few bad screens. Fixing the system fixes every screen.

## A. Layout bugs (objectively wrong — fix first)
| ID | Where | Defect |
|---|---|---|
| A1 | Settings (09) | Title "Settings" is flush against the left screen edge (0 padding); screen has inconsistent horizontal padding vs other screens |
| A2 | Settings (09) | Section "Quick Capture & Hardware Integration" title overflows; "How…" link is clipped off the right edge |
| A3 | Home (01) | Workspace name "Alice Sharmay's Workspace" overflows its bordered pill (text runs past the border); no truncation |
| A4 | Tasks board (02) | Board column is a tall empty box; second column cut off with no affordance; wide horizontal board is the default on a phone |
| A5 | New Task (06) | Contextual bar sits over form content and duplicates the Due/Priority chips already in the form (two controls for one thing) |
| A6 | Home (01) | "Recent stickies" card is rotated/skewed oddly with big empty top area and text pinned bottom-left |
| A7 | Tasks (02/03) | Three different ways to create (header "New", centre "+", "Add Task") |

## B. Hierarchy & structure
| ID | Defect |
|---|---|
| B1 | Everything is a bordered rounded rectangle of equal weight → no focal point; the eye has nowhere to land |
| B2 | Titles are regular weight at large size; hierarchy is built from size alone, not weight/tone |
| B3 | ALL-CAPS wide-tracked labels everywhere (ACTIVE PROJECT, ATTACHMENTS, GENERAL, THEME MODE…) → shouting, dated look |
| B4 | Task rows show only an ID and a title: no priority, due date, labels, assignee, state → low information density, low usefulness |
| B5 | Home has big dead space under content and no "hero" (no progress, no today summary) |
| B6 | New Task is a long form with every field visible; no progressive disclosure |

## C. Color & surfaces
| ID | Defect |
|---|---|
| C1 | Accent is a washed periwinkle (≈ `#7B79DD`): low saturation, weak contrast with white text on buttons ("New", "Report"), looks cheap on dark |
| C2 | Surfaces differ by 1–2% luminance and are separated by 1 px light borders → "wireframe" feel. Premium UIs separate by **tone**, not outlines |
| C3 | Lavender text links on dark (View All, Add Task, View Board) are low contrast and inconsistent with buttons |
| C4 | Semantic colors are not systematic: green banner, red outlined logout, no severity colors in Bugs filters |
| C5 | Light mode never shown but must be equally polished |

## D. Typography & spacing
| ID | Defect |
|---|---|
| D1 | Row titles/headings feel oversized relative to metadata; no consistent scale (several near-identical sizes) |
| D2 | Spacing rhythm is irregular: some gaps 12, some 24, some 40 with no logic; dead zones |
| D3 | Chip rows (All / My Day / Inbox / Upcoming) are all outlined pills of identical weight; selected state barely differs |

## E. Components & consistency
| ID | Defect |
|---|---|
| E1 | Checkboxes are heavy squares, not circular "complete" controls |
| E2 | Icon set mixes weights; bug icon is visually busy |
| E3 | Empty states are plain (icon in a tile + sentence) without personality or a clear single action |
| E4 | Buttons: filled lavender, outlined dark, outlined red, text links: 4 styles without a clear system |

## F. Content & product hygiene
| ID | Defect |
|---|---|
| F1 | Account sheet shows "Active User" instead of the real name |
| F2 | Developer information (server URL, "Wi-Fi (192.168.1.67)", "USB (localhost)") is visible in the end-user account sheet |
| F3 | "Verified Account", "Hardware Integration", "Test Slack…" style jargon; copy is technical not human |
| F4 | Duplicate theme/accent controls in the account sheet *and* Settings |
| F5 | Placeholder/test data ("abc", "Verify Task Screenshot") — fine for dev, but empty/loaded states must be designed with realistic data |

## What is already good (keep)
Dark default, floating pill nav concept, accent switcher, keyboard accessory bar idea, logout exists and is findable, permission status feedback in Settings, board concept, settings coverage.

## Root causes → the fix strategy
1. No real **design system** (tokens → primitives → patterns). → build one (docs 02).
2. **Border-driven** depth instead of tonal depth. → remove outlines; use surface ramp + hairline dividers only.
3. **Weak type system**. → one scale, weight-led hierarchy, sentence case.
4. **Forms over flows**. → progressive disclosure, smart defaults.
5. **No automated visual QA**. → the loop (doc 04) catches layout bugs with scripts and scores design with a rubric.
