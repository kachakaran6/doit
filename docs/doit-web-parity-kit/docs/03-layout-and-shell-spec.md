# 03 — Layout & Shell Spec (kills unwanted padding and dead space)

## 1. One container system (the fix for B1–B5)
```
<AppShell>                                   // grid: [sidebar 256] [1fr]; NO padding of its own
  <Sidebar/>                                 // fixed 256 (collapsed 64)
  <div class="flex min-w-0 flex-col">
    <TopBar/>                                // h-14, px-6, full width of the main column
    <main class="flex-1 overflow-y-auto">
      <PageContainer width="data|form|wide">  // THE ONLY horizontal padding + max-width in the app
        <PageHeader/> … page content …
      </PageContainer>
    </main>
  </div>
</AppShell>
```
`PageContainer`: `mx-auto w-full px-6 lg:px-8 py-6 lg:py-8` + max-width: **data = 1280**, **form/settings-content = 720**, **detail = 880**, **wide (board/table) = none (full width, same px)**. Container is **centered**, so left and right gutters are always equal.
Rules:
- Pages, sections and cards **never** add horizontal margins/paddings to "align" things. Card internal padding only (`p-5`).
- No second wrapper with padding inside `main`. (`NESTED_PADDING` audit must be 0.)
- At ≥1536px data pages stay at 1280 centered; board/table may use full width. Never left-aligned with a dead right strip.
- Gutter targets: 24px (<1024), 32px (≥1024). Top bar content aligns to the same 24/32 gutters.
- Settings is a **two-column layout inside one centered container**: sub-nav 220 + content 720 (+ 32 gap) ≈ 972 wide, centered — no dead strip, sticky sub-nav.
- Page templates: **ListPage** (header, filter bar, table), **DetailPage** (breadcrumb, title, properties, content), **SettingsPage** (sub-nav + sections), **DashboardPage** (KPI row + 2/3–1/3 grid, equal-height cards, `gap-6`).

## 2. Table/list rows that read well (B3)
Use a fixed column grid instead of "title left, everything right":
`[checkbox 32] [id 72] [title minmax(240px,1fr)] [labels max 200] [assignee 32] [due 96] [status 132] [priority 108] [updated 88]`
Columns hide progressively below 1280/1024/768. Title column stays ≤ ~70ch. Every row aligns status/priority in the same x-position. Row 44 (compact 36).

## 3. Sidebar (A2) — calm, one identity block, one user block
```
┌ DoIt mark (24) ·  ········ collapse ┐   header 48px: icon-only mark (wordmark only on auth/marketing); collapse button
│ [KK] Karan Kacha's Workspace  ⌄     │   workspace switcher: tile + name (ellipsis) + role in muted text
│ 🔍 Search          ⌘K               │   (optional, or only in the top bar)
│ Overview · My work · Inbox (3)      │   group "Workspace" (no label if only one group)
│ Tasks · Bug queue (5) · Stickies    │
│ Team                                │
│ ── Projects              +  ▾       │   section header: collapse + "+" New project
│ ● General            GEN            │   project rows (colored dot/emoji), active highlighted; hover shows ⋯ (settings/archive)
│ ○ Archived (1)                      │   optional collapsed group
│                                     │
│ ┌ [KK] Karan Kacha        ⌃ ┐       │   footer user card: avatar initials from the REAL name, name, email (muted), opens user menu
└─────────────────────────────────────┘
```
- Settings is **not** in the main nav; it lives in the user menu and workspace switcher menu ("Workspace settings"), keeping personal vs workspace settings separate.
- Counts as quiet badges (tabular), not colored blobs. Active item = surface3 tone + accent text/icon.
- Collapsed (64): icons + tooltips; workspace tile; user avatar.
- The footer must never show "Account"/"U": fall back to email local-part only if name is truly empty, and flag it in a toast prompting profile completion.

## 4. Top bar
Left: breadcrumbs from the real route: `Tasks` (workspace name is **not** repeated; show project when inside one: `General › Tasks`). Center: search/command trigger (`Search or command… ⌘K`, max 520). Right: notifications bell (unread dot), help (?), **Create** split button (New task · Report bug · New sticky · Voice note · New project · Invite people).
Page headers contain only page-specific actions (e.g., "Display", "Filter"), never a second global create.

## 5. User menu (popover from the footer card)
Header: avatar, **real name**, email, role badge (Owner/Admin/Member/Guest). Items: Profile · Preferences · Notifications · Keyboard shortcuts (`?`) · Appearance (inline System/Light/Dark segmented + 5 accent dots) · Switch workspace ▸ · Workspace settings (role-gated) · Help & feedback · **Sign out** (confirm only for "Sign out everywhere"). Shows build/version in muted footer line (admins: link to system status).

## 6. Workspace switcher menu
Command-style: search, list of workspaces (tile, name, role, check), **Create workspace**, **Join with code**, divider, Workspace settings, Invite people. Switching clears caches, closes WS, reloads permissions, keeps route when it exists.

## 7. Dashboard (Overview) composition
KPI row (4) `gap-4` → two-column grid `grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6` with equal-height cards; no below-the-fold orphan cards at 1440×900 for the key sections: *My work*, *Recently reported bugs* (thumbnails), *Bugs by severity*, *Activity*. Remove "System & sync" (admin-only in Workspace settings › About).

## 8. Responsive
≥1536 centered containers · 1280–1535 as spec · 1024–1279 sidebar auto-collapses, columns reduce · 768–1023 drawer nav, peek becomes full-width sheet · <768 cards instead of tables, bottom sheets for pickers. No horizontal page scroll at any width.

## 9. Acceptance numbers (checked by `dom-audit.js`)
`GUTTER_ASYMMETRY` 0 · `NESTED_PADDING` 0 · `PLACEHOLDER_IDENTITY` 0 · `WIDE_GUTTERS` ≤ warn only · same `contentW` (±16px) across all "data" pages · settings pages share one width.
