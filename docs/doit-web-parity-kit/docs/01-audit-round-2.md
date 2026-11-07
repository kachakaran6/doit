# 01 — Audit, round 2 (4 screenshots in `reference/current/`)

Progress is real: new logo, sentence-case labels, 3 theme cards, accent swatches, labeled List/Board/Table, ⌘K, a real status/priority system, split Create button. What's left is **layout discipline, identity, and feature coverage**.

## A. Identity & data bugs
| ID | Where | Defect |
|---|---|---|
| A1 | Sidebar footer | Shows **"Account"** with a "U" avatar instead of the user's **real name + email** (Karan Kacha). The mobile app showed "Active User" for the same reason → the profile (`/me`) is not loaded or mapped (wrong field, failed request, or name never stored). Root-cause it once, fix web + mobile, add a test |
| A2 | Sidebar top | Logo wordmark + workspace switcher + "Workspace" label + nav + "Projects" + bottom account = five stacked identity blocks; reads heavy and repetitive |
| A3 | Breadcrumb | Workspace name truncated ("Karan Kacha's Works…") and repeated from the sidebar |
| A4 | Tasks | "Voice Bug – Nov 5" appears in the **Tasks** list: bugs vs tasks type/filter is unclear (verify type filter and show a type icon) |
| A5 | Overview | "System & sync — Cross-platform connectivity / Backend API Operational / Active project" is **developer/system info shown to every user**; admin-only or remove |

## B. Layout & spacing (unwanted padding and empty space)
| ID | Defect |
|---|---|
| B1 | **Asymmetric gutters**: on Overview/Tasks content has ≈ 77px left and ≈ 55px right; on **Settings content ends at x≈1517 while the top bar runs to x≈1890** → a ~370px dead strip on the right. |
| B2 | **Inconsistent container widths** across pages (Overview/Tasks near full width, Settings ≈ 1120 left-aligned) → each page feels like a different app |
| B3 | Rows spread title and metadata across the full width (title at far left, "Medium · To do" at far right) → the eye must travel ~1100px; no column structure |
| B4 | Padding appears stacked (shell padding + page padding + card padding) rather than from one container |
| B5 | Overview below-the-fold content (Recently reported bugs) and unequal card heights leave visual gaps; Settings has one long single column |

## C. Feature gaps visible in the UI (the API offers more)
| ID | Missing / thin |
|---|---|
| C1 | **No "New project"** (Projects list only shows General + count); no project settings, members, archive, delete, visibility |
| C2 | No workspace creation / join / switch UI beyond a chevron; no invitations, no roles view |
| C3 | Tasks rows lack assignee, due date, labels, updated; no peek panel, no bulk actions, no group-by/sort/display options; filters only status + priority |
| C4 | Tasks page has no "New task" form beyond the split button; no inline quick-add |
| C5 | Settings has Appearance / Profile / Workspace / Security & Sessions / SMTP; but **no Members, Invitations, Notifications, Audit log, Labels, Data & privacy, Devices, API/Integrations** pages |
| C6 | "Team" exists in nav but its feature set isn't visible (members list/roles/invites/removal) |
| C7 | Bug Queue, Stickies, voice-created items, attachments, transcripts: need full management UIs (see doc 02) |
| C8 | No notifications bell/inbox, no activity feed, no search results page (⌘K only) |

## D. Polish
| ID | Defect |
|---|---|
| D1 | Tiny priority glyph (bars) next to the label is hard to read; priority/status sit in different columns each row (not aligned) |
| D2 | Sidebar nav items fine but Settings is under "Workspace" (mixes personal vs workspace settings) |
| D3 | Cards in Settings are tall with large empty regions (theme cards) — OK, but the page lacks a sub-nav and sticky save |

## E. Keep
New logo/wordmark, theme cards, accent swatches, ⌘K trigger, Create split button, List/Board/Table switcher, severity bars on Overview, status/priority labeling, tonal surfaces.

## Root causes → strategy
1. **No single page container** → create `PageContainer`/`AppShell` rules and delete all ad-hoc padding.
2. **Identity not wired** → fix profile loading once; user panels everywhere.
3. **UI built screen-by-screen instead of API-first** → derive the UI from the OpenAPI spec with a coverage matrix and close every gap (doc 02, script `api_coverage.mjs`).
4. **No role-aware information architecture** → personal vs workspace vs admin areas (doc 03/04).
