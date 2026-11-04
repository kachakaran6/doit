# 03 — Screen Redesign Specs (fixes the audit, keeps the product)

Common: `Screen` primitive (margin 20, safe areas, nav-aware bottom padding), `LargeHeader` (title collapses into a compact blurred bar on scroll), skeleton → content, designed empty/error states, dark + light.

## Global shell
- **Floating nav**: glass pill (surface2 @ ~80% + blur), **4 icon tabs** (Home, Tasks, Bugs, Search). Active tab = soft capsule (surface3) + accent-text icon + 11px label; inactive = icon only (tertiary). **Create `+` is a separate 56px accent circle** to the right of the pill (soft accent glow), not inside it. Long-press `+` → quick menu (Task, Bug, Sticky, Voice). Hides on scroll down. Haptic selection on tab change.
- **One create path**: remove header "New"/"Report" buttons and "Add Task" duplicates; `+` is the global create; screens may offer an inline quick-add row.
- **Header**: left = large title (or workspace switcher on Home), right = ≤ 2 icon buttons (44px, no border, tonal circle on press).

## 1. Home
- Top row: workspace tile (36px rounded, initial, deterministic color) + **truncated** workspace name (ellipsis, max 60% width) + chevron → workspace switcher sheet. Right: avatar (36) → account sheet.
- **Hero "Today" card** (surface1, radius 20): large "Today" title, subline "2 tasks · 0 done", **progress ring** (accent) on the right, below it a quiet row of 3 stat chips (Done · Bugs · Stickies) as tonal chips. Tapping opens My Day.
- **Your work**: Section header "Your work" + "See all" (accent text, no border). Rows live in **one grouped card** (not separate bordered cards): circle checkbox · title (headline) · meta line (priority flag, due "Today", label chip) · trailing chevron-less. Max 5 rows.
- **Quick capture strip**: two tonal buttons "Voice note" and "Report a bug" (secondary, 44px).
- **Recent stickies**: horizontal scroller of **square-ish pastel cards** (token-based sticky tints at 18% alpha on dark, solid soft tints on light), consistent size 148×148, 3-line text clamp, no rotation. Empty → friendly EmptyState with "New sticky".
- No dead space: if content is short, hero + quick capture + stickies fill the page.

## 2. Tasks
- Large title "Tasks" + subtitle project name as a tappable menu (project switcher), right icons: filter, view toggle (List/Board).
- **Default = List**, grouped by **Overdue / Today / Upcoming / No date** (collapsible section headers, count in tertiary).
- Filter row: horizontally scrollable **tonal chips** (All, My day, Inbox, Upcoming); selected = accent soft + accent text, no outline.
- **Task row** (min 56): circle checkbox (22, animates), title (1 line), meta line: priority flag glyph+color, due ("Today" accent / "Overdue" danger / date tertiary), label chips (max 2 + "+1"), assignee avatar (20) trailing. **Swipe right = complete, swipe left = flag/delete** with haptic threshold.
- **Board view** (optional toggle): on phones show **one column at a time** with a segmented state selector (To do · In progress · Done) + drag to move; not a wide horizontal scroll by default. Tablets/web can show columns.
- Empty: illustration + "Nothing here yet" + single primary button "New task".

## 3. Bugs
- Large title "Bugs" with count; severity filter chips **color-coded** (dot + tonal fill): All, Critical (danger), Major (warning), Minor (amber), Trivial (neutral).
- **Bug row**: 48px screenshot thumbnail (rounded 10) · title · meta (severity badge, reporter, relative time, device short name) · state badge.
- Detail: big screenshot with zoom, audio player (waveform-lite), device/meta grouped list, status/assignee property rows.
- Empty: tonal bug illustration, "No bugs reported" + "Shake your phone or tap the bubble to report one" as hint (explains the feature).

## 4. Search
- Large search field at the top (surface2, radius 14, leading icon, clear button) auto-focused when tab opens (optional).
- Below: **Recent searches** list and **Suggestions** as tonal chips (`#label`, `is:open`, `due:today`) which insert tokens; results grouped (Tasks, Bugs, Stickies) with highlighted matches; empty-results state with tips.

## 5. New item (sheet, not full screen)
- **Bottom sheet** with detents (compact ≈ 45%, expanded ≈ 92%), grabber, glass/surface2 top.
- Top: segmented control **Task · Bug · Sticky · Voice**.
- **Title field is the hero**: large placeholder "What needs doing?", auto-focused, no label, no box (underline-free, just text on surface).
- "Add details" collapsed row → expands description. Attachments as small icon buttons in the keyboard bar, not a section.
- **Keyboard bar is the only place for properties**: chips Due · Priority · Label · Assignee · Project + mic + **Create** (accent). Selecting a chip opens a mini popover/sheet (wheel for date) **without dismissing the keyboard when possible**; chosen values show as filled tonal chips under the title.
- Remove the duplicate Due/Priority sections, the Cancel/Create button row, and the "Attachments (0)" heading.
- Bug mode adds: severity chip (default Major), "Capture screen" thumbnail slot, and (when launched from overlay) the screenshot preview + redact tool.

## 6. Account sheet (tap avatar)
- Header: avatar (48), **real display name**, email (secondary). 
- Grouped rows: Profile, Workspaces (switch/create/join), Settings, Help & feedback. **Log out** as a destructive row at the bottom with confirm sheet ("Log out of DoIt?").
- **Remove** theme/accent pickers (live in Settings → Appearance) and **remove all server/URL/Wi-Fi/USB info** (Developer section only in dev/preview builds, hidden in production, reachable via Settings → About tapped 7×).

## 7. Settings (inset grouped list)
- Large title "Settings"; sections as grouped cards with 20 margin (**fixes A1/A2**).
- Order: Account · Appearance (Theme segmented: System/Light/Dark; Accent = 5 round swatches with check; Density) · Bug capture (status row with green dot "Ready", Floating bubble switch, Shake switch + sensitivity slider (3 detents), "How it works" link) · Notifications · Privacy & data (consent, retention, export, delete account) · About (version, licenses, support).
- Status/permission banners use a compact tonal row with icon, not a full-width colored bar.
- Long labels wrap; right-side links never clip.

## 8. Workspace switcher & project switcher (sheets)
List with avatar tile, name, role badge, check on active; footer rows "Create workspace" and "Join with code". Project switcher likewise with "New project".

## 9. Empty / loading / error (all screens)
Skeletons matching real layout; empty states with a quiet line illustration (SVG), 1 sentence, 1 button; errors show the real reason + Retry (and "Details" in dev builds only).

## 10. Quick Capture overlay activity (Android)
Same sheet language: spring-in glass sheet over the tested app, screenshot thumbnail card at top with "Redact" action, big mic button + text, severity/project chips, **Send** accent. Closes with a quick success check animation.
