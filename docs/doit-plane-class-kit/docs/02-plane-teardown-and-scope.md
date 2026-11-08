# 02 — What makes Plane "professional" and what DoIt takes from it

> Based on Plane's public product and docs (docs.plane.so) and the reference mobile screenshot. **Verify current names/behavior in Plane's docs and by using the free app.** Study patterns; **do not copy code, assets, or branding**: Plane's repository is open source under a copyleft license (AGPL — verify) and its name/logo are trademarks. Build our own implementation and visuals.

## 1. Why it feels professional (patterns to reproduce)
1. **Information-dense rows with quiet metadata**: state icon, ID, title, then chips for priority, dates, labels, assignees — scannable at a glance.
2. **A consistent property model**: every work item has the same property set, edited the same way everywhere (property rows → pickers).
3. **Three levels of structure**: Workspace → Project → Work item; plus cross-cutting planning objects (Cycles, Modules, Views, Pages).
4. **Layouts are views of the same data**: List, Board, Calendar (also Spreadsheet/Gantt on web) with shared filters/display options.
5. **Saved Views**: filter+display+layout saved per project/workspace and shareable.
6. **Calm visual system**: neutral surfaces, thin borders, small type, accent only for actions; excellent dark mode.
7. **Home as a launchpad**: Work, your work, recent activity, stickies; bottom bar Home · Inbox · Search + create.
8. **Triage inbox (Intake)** for incoming requests: accept / decline / snooze / mark duplicate.
9. **Notifications that are actionable**: grouped, tabs (All, Mentions, Assigned…), deep links, mark read/archive.
10. **Everything has states**: empty (with guidance), loading skeletons, error, offline.

## 2. Concept map: Plane → DoIt
| Plane concept | DoIt equivalent | Tier |
|---|---|---|
| Workspace, Projects, Members, Roles | exists (polish + settings) | T1 |
| Work item (properties: state, priority, assignee(s), labels, start/due date, estimate, parent, cycle, module) | `WorkItem` (type task/bug/todo) — add start date, assignees, estimate, parent, cycle/module links | T1/T2 |
| State groups (Backlog, Unstarted, Started, Completed, Cancelled) with custom states | fixed set now → **project States** config | T2 |
| Priority (Urgent/High/Medium/Low/None) | exists → proper icon system | T1 |
| Labels | exists → management UI | T1 |
| Sub-work items, Relations (blocks/blocked by/duplicate/relates), Links | new | T2 |
| Comments & Activity, @mentions | new (comments), activity feed from audit/events | T2 |
| Attachments | exists (image/audio) → viewer polish | T1 |
| Layouts: List, Board, Calendar | List/Board exist → add Calendar; Display options | T1/T2 |
| Views (saved filters) | new | T2 |
| Cycles (time-boxed iterations with progress/burn-down) | new | T2 |
| Modules (feature/epic groupings with progress) | new | T2 |
| Pages (project docs/notes, rich text) | new (markdown pages first) | T2 |
| Intake (triage queue) | **Bug Queue becomes Intake-style triage** (Accept/Decline/Duplicate/Snooze) | T1/T2 |
| Stickies | exists → proper board/editor | T1 |
| Notifications inbox | exists → tabs, actors, deep links | T1 |
| Favorites, Archive, Trash, Drafts | new | T2 |
| Analytics | basic project/workspace analytics | T2 |
| Estimates | optional (points/time) | T2 |
| Epics, Initiatives, Gantt, Spreadsheet, automations, time tracking, importers, integrations, SSO | later | T3 |
| **DoIt differentiator**: one-tap bug capture (bubble/shake), screenshot redaction, voice notes, device telemetry, AI prompt generation, offline queue | keep and make best-in-class | T1 |

## 3. Tiers and honesty about effort
- **T1 — Polish & complete what exists** (2–4 weeks of focused agent work): row anatomy, detail screens, create flows, filters/display, bug triage, stickies, notifications, project/workspace/team management, settings split, store compliance, design system v3, full state coverage, Plane-class home.
- **T2 — Plane-class planning model** (each item = new backend schema + API + permissions + tests + mobile + web): start/due dates & assignees, sub-items/relations/links, comments/activity/mentions, Views, Cycles, Modules, Pages, States config, estimates, favorites/archive/trash, analytics, Calendar layout.
- **T3 — Later**.
Do **T1 completely first**, ship, then T2 one feature per phase. "Perfect and complete" is a direction; this kit defines a measurable finish line (doc 07): every screen in the map built, verified on device, scoring ≥ 43/50, with tests.

## 4. Cross-platform rule
Every feature ships in **API + contracts → mobile → web** (same IA). Web gets the desktop-native layouts (table, board, calendar, split view); mobile gets the touch-native ones.

## 5. Product principles for DoIt (keep it focused)
1. **Capture first**: from "I see a problem" to "logged with evidence" in ≤ 5 s remains the north star; planning features must not slow it.
2. **Evidence-rich bugs** (screenshot, voice, telemetry, steps) are our moat versus Plane/Jira.
3. **Simple by default, powerful on demand**: advanced properties collapse behind "More".
