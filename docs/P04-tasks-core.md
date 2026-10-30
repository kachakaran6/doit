# P04 — Tasks Core

**Lane** A · **Depends on** P03 · **Branch** `feat/p04-tasks-core`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.4
- `05-DATA-MODEL.md` §5.2 (`Task`, `ChecklistItem`), §5.3
- `02-FEATURE-SPEC.md` F3, F4

## Goal
The heart of the backend: tasks with status, priority, due dates, assignment, checklist,
ordering, idempotent creation, and every list view the app needs.

## Deliverables
- `modules/tasks/` (controller, service, repository, dto, mappers)
- endpoints: list with filters, my-day, inbox, create, detail, patch, delete, status,
  reorder, assign, checklist CRUD
- per-project `number` allocation inside the create transaction
- `ActivityLog` writes on create/status/assign/complete
- e2e suite covering filters + transitions + ordering

## Requirements
- **Status machine:** only the transitions in §6.4 are legal; anything else `422 UNPROCESSABLE`
  with `details: [{field:"status", from, to}]`. Setting `DONE` stamps `completedAt`; reopening
  clears it.
- **Ordering:** fractional index on `Decimal(20,10)`. `POST /reorder` with `{beforeId, afterId}`
  computes the midpoint; if the gap < 1e-6, renumber the project's tasks in a transaction and
  return the new values for every affected task.
- **Idempotency:** `Idempotency-Key` required on create; duplicate returns the original task
  with `Idempotent-Replay: true`.
- **Filters:** `status` (repeatable), `priority` (repeatable), `label` (labelId, repeatable,
  AND semantics), `assignee` (`me` | userId | `none`), `due`
  (`overdue|today|week|none`), `type`, `q` (full-text), `sort` (`order|-order|dueAt|-dueAt|
  createdAt|-createdAt`), `cursor`, `limit`. All combinable; build one Prisma query, no N+1.
- `my-day` = assigned to me AND (due today OR overdue) OR explicitly added today.
- `inbox` = no assignee, ordered by `createdAt desc`.
- Response mapper returns: `id, humanId, type, title, description, status, priority, dueAt,
  dueHasTime, order, source, assignee{id,name,avatarUrl}|null, labels[], checklistProgress
  {done,total}, attachmentCount, commentCount, createdAt, updatedAt`.
- Detail adds `checklist[]`, `attachments[]`, `bug|null`, `activity[]` (last 20).

## Do not
- Do not implement labels or attachments beyond the fields already in the schema.
- Do not implement realtime emission yet (P16 adds it) — but leave a single `emitTaskEvent()`
  call site so it's a one-line change later.
- Do not paginate with OFFSET.

## Acceptance checks
- [ ] Create with only `{title}` succeeds; every optional field defaults correctly.
- [ ] Create twice with the same `Idempotency-Key` → one row, `Idempotent-Replay: true`.
- [ ] Illegal transition `TODO → DONE`… (allowed) vs `BLOCKED → DONE` (rejected 422).
- [ ] Insert between two tasks → new `order` is the midpoint; repeat 60× → still ordered.
- [ ] 10k seeded tasks: list with 4 filters returns in <150 ms (paste `EXPLAIN`).
- [ ] `my-day` and `inbox` return correct sets for a seeded fixture.
- [ ] Deleting a task cascades checklist items and writes an activity row.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
