# 01 — Audit of the current web app (5 screenshots in `reference/current/`)

Verdict: clean enough to be "a dashboard", but it reads as a **default template**, not a product. The data model is richer than the UI shows. The fixes are systemic.

## A. Brand & correctness bugs (fix first)
| ID | Where | Defect |
|---|---|---|
| A1 | Sidebar, breadcrumb, all pages | Brand renders as **"Dolt"** (capital I looks like lowercase L in Inter). Use the SVG wordmark (`templates/logo-horizontal-*.svg`) for the product name; never type it as plain Inter text |
| A2 | Sidebar | Uses an old black/white check icon instead of the new blue DoIt mark |
| A3 | Every list | **Raw enum values shown to users**: `IN_PROGRESS`, `TODO`, `URGENT`, `HIGH`… Needs a central label map ("In progress", "To do") |
| A4 | Overview vs Tasks | The same status renders differently: `IN_PROGRESS` is a **solid lavender** pill on Overview but a **gray** pill on Tasks; `TODO` is solid lavender on Overview and gray on Tasks. Status must have exactly one visual |
| A5 | Breadcrumb | "DoIt / Workspace" is the same on every page — it doesn't say where you are |
| A6 | Create buttons | Duplicates and inconsistent names: top-bar "New Task" **and** page "Capture Item" / "New Task" / "Report Bug" |
| A7 | Settings | Brand accent options look like plain buttons: **no swatch, no selected state**; no theme mode control (only a tiny sun icon in the sidebar) |
| A8 | Bottom-left user card | Email text is clipped at short viewport heights (sidebar footer overlaps the page bottom) |

## B. Hierarchy & information design
| ID | Defect |
|---|---|
| B1 | **ALL-CAPS tracked labels** everywhere (COMPLETED TASKS, FULL NAME, BRAND ACCENT, EMAIL ADDRESS) — dated, shouty |
| B2 | Stat cards show a number but no context (no trend, no link, no chart) — they don't answer "so what?" |
| B3 | Rows show ID + title + two pills only. No assignee, due date, labels, updated time, project → not usable for real triage |
| B4 | **Bug queue hides the product's superpower**: no screenshot thumbnail, no reporter, no device, no voice-note indicator |
| B5 | Tasks has no filter, sort, group, search, bulk select or column control; view toggle is two unlabeled icons |
| B6 | Large unused space (Overview bottom third; Settings right 30%); containers have inconsistent widths (full-width on Overview, 960 on Settings) |
| B7 | No right-side detail/peek panel; clicking work should not feel like leaving the list |

## C. Color & surfaces
| ID | Defect |
|---|---|
| C1 | Accent is a washed lavender (≈ `#7B79DD`) with white text — low contrast on buttons (< 4.5:1) and flat in dark |
| C2 | Borders on **everything** (cards, rows, inputs, topbar, sidebar, page) → grid-of-boxes look; dark mode surfaces differ by ~1–2% so lines carry the structure |
| C3 | Red/orange/yellow severity pills are outlined tints with different shapes than status pills → two competing pill systems |
| C4 | Red bug icon repeated on every bug row = visual noise (no information) |
| C5 | Light mode works but uses the same border-heavy look; accent button contrast differs from dark |

## D. Typography & density
| ID | Defect |
|---|---|
| D1 | Row text is ~17px and spaced loosely; web should be 14px base / 13px table for scannability |
| D2 | Monospace gray IDs fine, but weight/size don't differentiate title vs meta enough |
| D3 | Page subtitles are internal jargon ("Real-time status for active workspace and cross-platform sync") |

## E. Interaction & UX
| ID | Defect |
|---|---|
| E1 | Search says "Press /" but no command palette (⌘K) with actions, recent items, navigation |
| E2 | No visible hover/focus/selected-row states; no keyboard shortcuts hints |
| E3 | Theme toggle is a single icon with no label or options |
| E4 | No loading skeletons, empty states, or error states shown; no toasts |
| E5 | Settings has 2 cards only and no sub-navigation; security/sessions/members/invites/audit are not discoverable |
| E6 | Save button has no dirty-state behavior; no inline validation or helper text |

## F. Keep
Sidebar + top bar skeleton, dark default with working light mode, accent switching concept, workspace switcher location, sensible nav items, consistent Inter typography, clear page titles.

## Root causes → fix strategy
1. No design tokens for **status/priority/severity** → build a single semantic map.
2. **Borders instead of tone** → tonal surfaces; hairlines only for table rows and inputs.
3. Template-level **type scale** (too large, caps labels) → web scale (14/13/12), sentence case.
4. Missing **product-specific UX** (screenshot-first bugs, peek panel, filters, ⌘K).
5. No automated visual QA → Playwright capture + DOM audit + axe in the loop.
