# W3 — Projects & work items (List · Board · Table · Detail)
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `06` (Projects, Project views, Item detail), `05`.

## Task
Projects list + create/edit/archive/delete + visibility + members · FilterBar bound to URL · **List** with grouping and inline edit · **Board** with dnd-kit (optimistic, rollback, 422 explanations, keyboard DnD) · **Table** with TanStack Table, virtualization, bulk actions, CSV export · Item peek sheet + full page: inline title, markdown editor/preview with autosave and conflict handling, property pickers, labels management, attachments (dropzone, paste screenshots, progress, lightbox, audio player), delete/duplicate/convert · quick create (`C`) with the shared quick-add parser · keyboard shortcuts · skeleton/empty/error everywhere.

## Verify
Playwright: create → edit → drag → filter in URL → refresh persists → bulk edit → delete; member vs guest restrictions; axe clean.
