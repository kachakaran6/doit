# M3 — Work items (T1)
## Before you start
Read `PLANE_CLASS_MASTER_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/06`. Update `docs/SCREEN_MATRIX.md`. End with: before|after sheets, audit outputs (dedupe/ui_audit/contrast/token lint), rubric table, tests, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `04`, `05` (Work list, Filters/Display, Work item detail, Create).
## Task
Work list with new rows, groups, swipe actions, multi-select + bulk actions; **Board** (one column at a time with peek, drag, quick-add); Filters & Display sheets (status, priority, assignee, labels, type, dates; group/sort/properties/density); **Work item detail** (all properties editable via pickers, markdown description, attachments with viewers, activity placeholder removed unless API exists, bug variant with telemetry); Create sheet (hero title, collapsed details, project/labels pickers as sheets, keyboard bar). Fix bugs-vs-tasks separation (type filter + visual type marker). Persist view prefs. Skeleton/empty/error/offline for each.
## Verify
Maestro flows + tests for create/edit/complete/filter/bulk; rubric ≥ 47 for S18–S29.
