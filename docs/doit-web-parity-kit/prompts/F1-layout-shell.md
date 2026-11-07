# F1 — Layout system, shell, sidebar, user menu
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `03`, `01` (A2, A3, A5, B1–B5, D2).
## Task
Implement `AppShell`, `PageContainer` (data/form/detail/wide), page templates (ListPage, DetailPage, SettingsPage with sticky sub-nav, DashboardPage); remove every ad-hoc page/card padding and re-wrap all existing pages. New sidebar (icon-mark header + collapse, workspace switcher with role, nav, Projects section with "+" and ⋯ menus, real-name footer user card), top bar (real breadcrumbs without repeated workspace name, ⌘K, bell, help, Create split button with all create actions), user menu and workspace switcher menu per spec. Replace the task-row layout with the fixed column grid. Move Settings out of main nav; remove "System & sync" from Overview.
## GATE 1
Before/after sheets (3 viewports × 2 themes), `layout-widths.json` showing consistent content widths, audit with GUTTER_ASYMMETRY / NESTED_PADDING / PLACEHOLDER_IDENTITY = 0, recording of sidebar/menus/collapse. Wait for approval.
