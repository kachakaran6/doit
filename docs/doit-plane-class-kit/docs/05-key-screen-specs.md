# 05 — Key Screen Specs (Plane-class, mobile)

## Home (S12) — launchpad
- Header: workspace tile + truncated name + chevron (switcher sheet) · right: **bell (unread dot)** + avatar (account sheet). Remove the "General / Labels" chips from Home.
- **Today card**: "Today" (sentence case), "8 to do · 0 done", progress ring, stat chips (Done · Bugs · Stickies) as tonal chips that navigate to filtered lists.
- **Work card** (Plane-style entry): big tappable row "Work" → Work list. Below: quick links grid: **Cycles, Modules, Views, Pages** (T2: hidden until built).
- **Your work**: grouped list (not separate cards), Plane row anatomy, max 5, "See all". Checkbox circles with visible stroke in dark.
- **Quick capture strip**: Voice note · Report a bug.
- **Recent activity** (T2): who did what.
- **Stickies**: horizontal pastel cards (148×148, 3-line clamp, color, pin) + "New sticky"; empty → friendly state.
- First-run checklist card until done.

## Work list (S18) & Filters/Display (S19)
- Large title "Work" with project switcher; icons: layout (List/Board/Calendar T2), filter (badge with active count), display.
- Filter chips row = saved quick filters (All, My work, Inbox, Upcoming) + "+ Filter".
- Groups by state (collapsible, count) or priority/assignee/due/label; section headers sentence case.
- **Row** per doc 04 §2; swipe right = complete, left = more (priority/assignee/delete); long-press = multi-select.
- **Board**: one column visible with snap + peek of next (not a wide scroll); header with state icon, count, "+" quick add; cards = same anatomy; drag to move; WIP/overdue cues.
- **Filter/Display sheet** (detents): status groups, priority, assignee, labels, type (Task/Bug), start/due, created; Display: group by, sort, show properties, density, show sub-items. "Save as view" (T2).
- Zero results: "No work items match" + Clear filters.

## Work item detail (S21) — currently unverified; build to this
```
< back                      ⋯ (copy link, duplicate, move, archive, delete)
GEN-12  [type: Task/Bug]    (identifier chip + type)
Title (22/600, editable inline, multiline)
────────────────────────────────────────────
Description (markdown/rich; tap to edit; checklist support)
────────────────────────────────────────────
State        ◐ In progress   ›
Priority     ▮▮▯ High        ›
Assignees    (AS)(BK) +      ›
Labels       (frontend)(ui)  ›
Start date   —               ›        (T2: shows when API supports)
Due date     Nov 12          ›
Estimate / Cycle / Module / Parent  (T2)
────────────────────────────────────────────
Sub-work items (2/5)  [+]        (T2)
Relations & links                (T2)
Attachments  [thumbs…] [+]       image → viewer, audio → player + transcript
────────────────────────────────────────────
Activity & comments  [composer: @mention, attach]   (T2)
```
- Sticky bottom bar: state quick-change + comment composer.
- **Bug variant** adds (top of body): screenshot carousel (zoom/pan, annotate), audio player with transcript, **Device telemetry** grouped list (model, OS, app/build, network, battery, locale, orientation, foreground app), severity, reproducibility, steps to reproduce, **AI prompt** button ("Generate fix prompt" using project context), triage actions (Accept / Decline / Duplicate of… / Snooze).
- Every property edit is optimistic with undo toast.

## Create (S27) & Quick Capture (S35–S36)
- Bottom sheet (detents 45% / 92%). Segmented **Task · Bug · Sticky · Voice** — **each mode has its own distinct form** (verify and fix the broken switching):
  - **Task**: hero title "What needs doing?", "Add details" row, chips under title; project chip (default last-used, picker as separate sheet — **not expanded inline**).
  - **Bug**: title, severity chip (default Major), screenshot card (captured/redact/replace), steps (optional), voice note button; auto device telemetry badge.
  - **Voice**: big mic, live transcript, waveform, "Create task / Create bug" choice, attach audio toggle.
  - **Sticky**: color picker row, text area, pin toggle.
- **Keyboard bar** (single place for properties): Due · Priority · Label · Assignee · Project · Attach · Mic · **Create**.
- Smart parsing line `!high #label @user tomorrow` with live chips. "Create more" toggle on web.
- Overlay variant opens over the tested app with screenshot thumbnail + redact action; success check animation and instant return.

## Bug queue / Intake (S30)
- Tabs: **Open · Accepted · Declined · Duplicates**; severity filter chips (colored dots, counts that sum to total — fix default severity).
- Row: **real screenshot thumbnail** (48×36) · title · severity badge · reporter avatar + name · device chip · voice icon · age · state. Empty thumbnail only when truly no screenshot (use neutral placeholder, not a bug icon).
- Swipe actions: Accept / Decline; multi-select: assign, severity, duplicate.
- Header summary: "4 open · 0 critical".

## Notifications (S15)
Tabs All · Unread · Mentions · Assigned. Row: actor avatar, sentence ("Alice assigned you **GEN-12**"), time, unread dot; tap → deep link; swipe to archive/mark read; "Mark all read". Bell with count on Home. Empty: "You're all caught up".

## Stickies (S47–S48)
2-column masonry of pastel cards (token tints), pinned first, title optional, 6 colors, long-press menu (pin, color, convert to task, delete), FAB "New sticky". Editor = sheet with color row + checklist support.

## Settings hub (S65) — split into grouped list
Groups: **Account** (profile card → Profile edit; Team & members; Sessions & security; Notifications; Data & privacy) · **Workspace** (Workspace settings; Projects; Labels) · **Capture** (Bug capture; Quick capture; Project context; AI provider; Sync queue) · **Appearance** (theme cards, accent swatches with check, density, haptics, reduce effects) · **Help** (Help & feedback, What's new, Legal) · **About** (wordmark, version, diagnostics) · **Log out** (own destructive row at the end). Dev section only in dev builds.

## Cycles (S37–S39, T2)
List: current/upcoming/completed with date range and progress ring; Detail: header (name, dates, status), progress (done/started/unstarted counts), burndown mini-chart, grouped work items; actions: add items, complete cycle (move unfinished to next).

## Modules (S40–S42, T2)
List with progress bars, lead, status; detail: description, linked work items grouped by state, members.

## Pages (S43–S44, T2)
Project notes: list (title, updated), editor (markdown with toolbar, checklist, images), share/lock; link to work items.

## Project settings (S51–S57)
General · Members & roles · States (T2) · Labels · Estimates (T2) · **Project context** (fixed multi-line editor with preview and a visible Save) · Archive/Delete (typed confirm).

## Account menu (S14)
Header: avatar, **Alice Sharmay**, email, role badge. Rows: Profile, Switch workspace, Settings, Help, Sign out. No theme/server info.
