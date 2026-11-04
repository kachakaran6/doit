# L2 — Primitives
## Before you start
Read `PREMIUM_UI_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work inside the loop from `docs/04` (capture → audit → critique → score → plan → fix → verify → recapture). End with before/after contact sheet, audit output, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02` (§7), `03` (global), `kit-ui` motion docs if present.

## Task
Rebuild with the new tokens, **borderless**, with press feedback: `Screen`, `LargeHeader` (collapsing), `Section`, `GroupedList`/`Row`, `Card`, `Button` (primary/secondary/tinted/plain/destructive), tonal `Chip`, `Segmented`, circle `Checkbox` (animated), `Avatar`, `Badge`, `ProgressRing`, `EmptyState` (SVG line illustrations), `Skeleton`, `Toast`, `PropertyRow`. Keep public APIs stable so screens keep working. One icon set, consistent stroke.
Every component in the Gallery with all states × dark/light × 2 accents; run the audit and rubric on the Gallery screens.

## Exit
Rubric ≥ 4 on dims 1–7 for the Gallery; no borders on cards/chips/buttons; all `ui_audit` ERRORs 0.
