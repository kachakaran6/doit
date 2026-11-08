# 01 — Audit of the 38 current mobile screens (`reference/current-app/`, `reference/sheets/`)

**Verdict:** a big step up from the earlier build (dark theme, floating nav, tonal chips, hero card, real data). It is now a *decent prototype*, not yet a *Plane-class product*: information-poor rows, several unfinished-looking screens, duplicated or missing screens, and most of Plane's planning model is absent.

## 0. Evidence quality — 19 of the 38 screenshots are duplicates
`python3 scripts/dedupe_check.py <folder>` found 19 near-identical pairs. The capture run did not reach many screens, so **these could not be audited**:
| Intended screen | What was actually captured |
|---|---|
| 08 Task detail, 09 Task detail telemetry | project switcher dialog / a dimmed board |
| 11 Bug queue filtered, 12 Bug detail, 13 Bug telemetry | the same Bug queue as 10 |
| 05 Tasks filtered "Today" | same as 04 (filter not applied) |
| 16 Search with results | empty search again (dimmed) |
| 21 Quick capture **Bug**, 22 **Voice**, 23 **Sticky** | the **Task** mode three times (selected tab says "Task") — either capture failure or the mode switch is broken; must be verified |
| 25/26 Settings scrolled, 35 "Guide sheet", 03 "Account menu" | Settings main again |
| 14 vs 38 Sticky board vs detail sheet | same screen |
→ The most important screens (**Task detail, Bug detail with telemetry, Quick-capture modes, Search results**) are **unverified**. Rule for every future capture: *assert the screen's unique text is visible before screenshotting* and run the dedupe check.

## A. Brand & copy
| ID | Where | Defect |
|---|---|---|
| A1 | Settings → About (26) | Brand typed as plain text "**Dolt** Mobile" (capital I vs lowercase L). Use the wordmark asset / correct typography everywhere (About, splash, notifications, launcher label, store listing) |
| A2 | Search (15) | Filter chips render **"Is:open", "Due:today"** with a capital first letter — the syntax is `is:open`, `due:today` |
| A3 | Workspace switcher (02) | Shows an internal slug "ws-alicesharmay-5z6q" under the name — meaningless to users |
| A4 | Many | ALL-CAPS tracked headers remain: "NO DATE", "TODAY", "ACCOUNT", "CAPTURE AND AI", "ATTACHMENTS (0)", "BUG CAPTURE" — pick one convention (sentence case, as Plane does) |
| A5 | Notifications (17) | Two-line cards: category label + title that repeats it ("TASK ASSIGNED / Task Assigned") |

## B. Information design (Plane's strength, our weakness)
| ID | Where | Defect |
|---|---|---|
| B1 | Tasks list (04) | Row = title + "GEN-n" only. **No state icon, priority, due date, labels, assignee, or updated time.** All 8 rows look identical → no scanning value |
| B2 | Board (06) | Priority appears as inline red text "**[HIGH]**" beside the ID; cards use **square** checkboxes while the list uses **circles**; columns are wide, only 1.2 visible, "In Prog…" clipped; no WIP counts beyond header number, no quick-add |
| B3 | Bugs (10) | Rows show an **empty thumbnail box** (GEN-3) or a generic bug icon — real screenshots never appear; the lone grey dot chip is unlabeled; severity chips all say **0** while 4 bugs exist (severity not set/defaulted); all state "Triaged" |
| B4 | Bugs | No reporter, device, build, voice indicator, or age grouping; no Accept/Decline/Duplicate triage actions |
| B5 | Home (01/36) | Rows have large left inset (checkbox floats ~60px from the card edge); dark checkboxes almost invisible on dark; "Recent stickies" shows bare text "abc" with no sticky card |
| B6 | Home | Two filter chips ("General ▾", "Labels") under the header don't belong on Home and have unclear purpose |
| B7 | Stickies (14/38) | One tiny brown tile top-left of a huge empty screen; no grid, colors, pin, or empty guidance |
| B8 | Notifications (17) | No tabs (All/Unread/Mentions), no actor avatar, no deep-link affordance; the screen isn't reachable from a visible bell on Home |
| B9 | Team (19) | OK structure; "OWNER" purple badge is a different badge style than every other badge |

## C. Unfinished-looking screens
| ID | Where | Defect |
|---|---|---|
| C1 | Project context (32) | "Search in context", "Insert suggested structure", "Preview", helper text and a disabled "Save context" — **no visible text editor/input area** |
| C2 | AI provider (34) | "API key" label with **no visible input**; model chips, toggle, Save/Test/Remove stacked without grouping |
| C3 | Quick capture prefs (33) | "Default labels" with nothing under it; chips as plain buttons; small Save at bottom-left |
| C4 | Settings (24) | One long page mixing account, AI, appearance, capture, notifications, privacy; **Log Out sits under "Privacy & data"** |
| C5 | Switches everywhere | Blue **track with teal thumb** — mismatched colors |
| C6 | Accent swatches | Indigo/Teal/Amber/Rose/Violet with **no visible selected state** and no blue even though the app's default accent is blue |

## D. Quick Capture (20–23)
| ID | Defect |
|---|---|
| D1 | Project picker expands inline by default ("Search projects" + list) and eats the top third of the sheet |
| D2 | Mode switch (Task/Bug/Sticky/Voice) appears not to change the form (all four captures show Task) |
| D3 | "ATTACHMENTS (0)" heading and two bordered buttons feel like a form, not a capture flow |
| D4 | Keyboard bar has only Due, Priority, Create; missing Label, Assignee, Project, mic |

## E. Platform/policy risk (P1)
| ID | Defect |
|---|---|
| E1 | Settings → Bug capture: **"Silent Screenshots (1-Tap) — Enable DoIt in Accessibility settings"**. Using an AccessibilityService to take screenshots is heavily restricted by Google Play policy for non-accessibility purposes and is a common cause of rejection. Plan two build flavors (Play-safe without it; direct-APK with it) or use MediaProjection consent. Verify current policy text before shipping |

## F. Feature gaps vs Plane (see doc 02)
No **Cycles**, **Modules**, **Views** (saved filters), **Pages**, **Intake-style triage**, **sub-work items**, **relations**, **comments/activity**, **start & due dates in UI**, **assignees**, **estimates**, **favorites**, **archive/trash**, **analytics**, **layouts** beyond List/Board (Calendar), project settings (states/labels/members), profile edit, security/sessions, data export/delete, help/support.

## G. What to keep
Floating pill nav + separate "+" FAB, Today hero with progress ring, tonal chips, bottom-sheet quick capture concept, offline Sync Queue, Team & Invitations, accent switcher, theme modes, project switcher, design-system gallery (dev), the telemetry-capable bug pipeline.

## Root causes → strategy
1. **Row anatomy** lacks properties → adopt Plane's work-item row (state, priority, dates, labels, assignees).
2. **Planning model is thin** → add Cycles/Modules/Views/Pages/Intake (backend + mobile + web) in tiers.
3. **Some screens shipped half-built** → completeness checklist per screen (doc 03) with states.
4. **Capture/verification process is unreliable** → deterministic capture harness + dedupe check.
5. **Policy blind spot** → compliance phase (accessibility service, data export/delete).
