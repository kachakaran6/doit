# W2 — Projects, List, Board, Item Detail (Web)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `13` pages 3–5, original `04` API.

## Task
Projects list/create/edit/visibility/archive · project views **List / Board (Kanban) / Table** with group/sort/filter synced to URL · dnd-kit drag between columns and reorder using the API's fractional ordering with optimistic update + rollback · state-machine errors (e.g. BLOCKED→DONE 422) shown clearly and card snaps back · item detail peek drawer + full page with all properties, markdown description (sanitized), attachments gallery + audio player, labels management, quick create (`C`) using the shared quick-add parser · command palette basics (navigate, create) · skeleton/empty/error states.

## Verify
Playwright: create → edit → drag across board → refresh persists → delete; permission variations (member vs guest).

## GATE G10
Demo against the real API; wait for human OK.
