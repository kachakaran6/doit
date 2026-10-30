# P06 — Stickies

**Lane** A · **Depends on** P04 · **Branch** `feat/p06-stickies`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.6
- `02-FEATURE-SPEC.md` F5

## Goal
Free-form notes that can become tasks. Small surface, but it must be perfect — this is the
screen a tester will use most casually.

## Deliverables
- `modules/stickies/` CRUD + reorder + convert
- `POST /stickies/:id/convert` creating a task in one transaction
- tests incl. the conversion link in both directions

## Requirements
- Body max 5000 chars, required, trimmed. Colour must be one of the five accent names.
- Reorder uses the same fractional index as tasks.
- Convert: creates a task with `description = sticky.body`, `source = STICKY`,
  sets `sticky.convertedTaskId` and `task.convertedFromStickyId`. Converting twice returns
  `409 CONFLICT` with the existing task id in `details`.
- Deleting a converted sticky does not delete the task.
- List endpoint supports `?pinned=true` and returns pinned first.

## Do not
- Do not implement a canvas/free-position board on the server — `order` is a linear index.
- Do not add attachments to stickies in v1.

## Acceptance checks
- [ ] CRUD round-trip; body over 5000 chars → `400 VALIDATION_FAILED`.
- [ ] Convert creates the task, links both ways, and a second convert → 409.
- [ ] Delete the sticky → the task survives with `convertedFromStickyId` set to null.
- [ ] Reorder between two stickies produces a stable midpoint order.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
