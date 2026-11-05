# 03 — Page Specs (fixes the audit; keeps the product)

Common to every page: skeleton → content, empty/error states, URL-synced state, keyboard support, dark/light, responsive, permission-aware actions, plain-language copy.

## App shell
- **Sidebar** (248, collapsible): top = workspace switcher (DoIt mark tile + workspace name + chevron → command-style menu with search, switch, create, join). Groups: *Workspace* — Overview, My work; *Projects* — list with colored dots + "New project"; *Triage* — Bugs (count badge); Stickies. Bottom = user menu (avatar + name; menu: Profile, Appearance (System/Light/Dark inline), Keyboard shortcuts, Sign out). No old logo; no clipped footer at short heights (sticky bottom with safe spacing).
- **Top bar** (56): breadcrumbs that reflect the **real route** (Workspace › Tasks › SMP-12), search trigger showing `⌘K`, notifications bell, **one global "Create" split button** (New task · Report bug · New sticky · Voice note upload). Page headers do not repeat global create.
- Product name in UI = SVG wordmark (fixes "Dolt").

## Overview
- Header: "Overview" + one plain sentence ("Here's what's happening across your workspace."). No page-level create button.
- **KPI row** (4 cards, tonal, no outline): Completed this week · Open bugs · In progress · Overdue. Each: label (13 secondary), value (28 tabular), context line ("+3 vs last week" colored), tiny sparkline; entire card links to the filtered list.
- **Two-column body** (2/3 + 1/3): Left: *My work* (assigned to me, due soonest, 6 rows, "View all"), *Recently reported bugs* with thumbnails. Right: *Bugs by severity* (donut or stacked bar), *Created vs resolved (14 days)* area chart, *Activity* feed (who did what, relative time).
- Fills the viewport sensibly at 1440 and 1024; no dead third.

## Tasks (project views)
- Header: project switcher (dropdown) + title "Tasks" + count; view switcher **List · Board · Table** (labeled segmented), "Display" popover (group by, sort, density, visible columns).
- **FilterBar**: search input + "Add filter" (Status, Priority, Assignee, Label, Due, Type) producing removable chips; saved views later. State lives in the URL.
- **List/Table rows** (44 / compact 36): circle checkbox · ID (mono, tertiary) · **title** (14/500, ellipsis) · labels (max 2 + "+N") · status icon+text · priority icon · assignee avatar · due date ("Today" accent, "Overdue" danger, else date tertiary) · updated (relative, tertiary). Groups by status with collapsible headers + counts. Hover shows quick actions; selection shows **BulkBar**; keyboard J/K/Enter/X/S/P/A.
- **Board**: columns by status, cards with title, ID, priority, assignee, due; drag & drop with smooth layout animation; "+" to add in column; column header counts.
- **Peek panel** (right, 480): opens on row click (URL `?peek=SMP-12`), editable title, status/priority/assignee/labels/due as property rows with popovers, markdown description, attachments, activity/comments; ← → to move between rows; Esc closes; "Open full page".
- Empty: line illustration + "No tasks yet" + "New task"; zero results: "No tasks match these filters" + Clear filters.

## Bugs (triage) — the differentiator
- Split view: **table** left, **detail pane** right (resizable).
- Row: screenshot **thumbnail** (40×28, rounded 6) · title · severity badge · state · reporter avatar+name · device chip ("Pixel 8 · Android 15") · mic icon if voice note · age · assignee. Neutral type icon only (no red bug on every row).
- Filters: severity, state, reporter, device/OS, project, build, has screenshot/voice. Bulk: set severity/state/assignee/duplicate-of.
- Detail pane: large **ScreenshotViewer** (zoom/pan, open full screen, download), **AudioPlayer** with transcript, **DeviceMeta** grouped list (device, OS, app/build, network, battery, locale, captured at), steps/notes, status/severity/assignee property rows, activity. New bugs from phones appear live with a subtle highlight + toast.
- Empty: "No bugs yet — reports from the DoIt mobile app (shake or tap the bubble) will appear here."

## Stickies
Masonry grid of pastel cards (token tints), pin, color, quick inline edit, search, "Convert to task" action, drag reorder.

## Command palette (⌘K)
Search items/projects/people + actions (Create task/bug/sticky, Switch workspace, Toggle theme, Go to…), recent items, shortcut hints, keyboard-only operable.

## Settings (nested layout)
- Left sub-nav: **Profile · Appearance · Notifications · Security · Sessions · Workspace · Members · Invitations · Audit log · Data & privacy** (role-gated items hidden/disabled with explanation).
- Content width 720, sentence-case labels, helper text, inline validation; **UnsavedBar** appears when dirty ("Unsaved changes — Reset / Save").
- **Appearance**: theme as 3 visual preview cards (System / Light / Dark); **accent as 5 round swatches** with check + ring on selected and live preview; density (Comfortable/Compact); reduced motion note.
- **Security/Sessions**: change password, list of sessions (device, platform web/android, last active, "This device"), revoke, sign out everywhere.
- **Members/Invitations/Audit**: tables with role badges, role change menu, invite dialog (role, expiry, copy link), audit filters.
- **Data & privacy**: export data, delete account (typed confirm).

## States everywhere
Skeletons match layout; empty states with CTA; errors show reason + Retry (+ request id in "Details"); offline banner; 403 page explains and offers switch workspace; 404; session-expired.

## Light mode
Same layouts, white cards with soft shadow on `#F4F4F7`, accent contrast verified; both modes reviewed in every loop.
