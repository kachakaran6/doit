# P05 — Labels, Filters, Views, Search

**Lane** A · **Depends on** P04 · **Branch** `feat/p05-labels-search`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.6 (labels), §6.9 (search)
- `05-DATA-MODEL.md` §5.3 (search rules)
- `02-FEATURE-SPEC.md` F3, F4, F14

## Goal
Make tasks findable and groupable: workspace labels, label assignment, and global search with
operator support.

## Deliverables
- `modules/labels/` (CRUD, attach/detach to task)
- `modules/search/` with the global endpoint
- migration adding the generated `tsvector` column + GIN index
- query parser for search operators
- tests for the parser and for relevance ordering

## Requirements
- Labels are workspace-scoped, unique by name (case-insensitive), coloured with one of the five
  accents. Deleting a label detaches it from all tasks in one statement.
- `POST /tasks/:id/labels` replaces the whole set (client sends the desired set, not a delta).
- Search covers task title + description, bug `actual`/`expected`, sticky body, comment body.
- Operators: `#label`, `@assignee`, `is:bug`, `is:done`, `due:today|overdue|week`,
  `project:<key>`. Unrecognised tokens are treated as free text.
- Ranking: exact title match > title prefix > title contains > description > comment; then by
  `updatedAt desc`. Return `{type, id, title, snippet}` with the match highlighted using
  `ts_headline`.
- Response time target: <120 ms on 50k tasks.

## Do not
- Do not add saved views (deferred).
- Do not implement fuzzy matching with an external service — Postgres only.

## Acceptance checks
- [ ] `GET /search?q=login is:bug #crash` returns only bugs labelled `crash` matching "login".
- [ ] `ts_headline` snippet contains `<mark>` around the match.
- [ ] Creating a label with an existing name (different case) → `409 CONFLICT`.
- [ ] Search over 50k rows <120 ms (paste `EXPLAIN ANALYZE`).
- [ ] Parser unit tests cover 12 operator combinations including malformed input.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
