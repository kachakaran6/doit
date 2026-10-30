# P03 — Backend Domain (Backend)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `04` (all), **`10`**, `06` (bug `meta` shape), `08` backend steps.

## Task
1. Modules: `projects`, `labels`, `work-items` (filters, cursor pagination, per-project `sequenceId` allocated transactionally, `summary`, `quick` endpoint using the shared parser, bug `meta` + severity validation), `stickies` (+ convert), `attachments` (StorageService interface + LocalDiskStorage, mime sniffing, size limits, authorized streaming, orphan cleanup job for attachments never linked after 24h).
2. Authorization: every route has `@Can(...)`; all queries workspace-scoped (enforced via Prisma extension/repository helper); project visibility + ProjectMember checks; guest limits; IDOR e2e tests across two workspaces; audit log entries for create/delete/role/permission changes. Add `projects` members endpoints and `GET /me/permissions`.
3. Response mappers (no leaking passwordHash, tokens).
4. Swagger decorators on every route with examples. Keep `docs/04` in sync.
5. e2e tests: work-items CRUD + filters, quick add, upload + attach, sticky convert, cross-workspace access denied.

## Verify
All tests pass; manual curl/Swagger flow works end to end, incl. creating a bug with an image + audio attachment.

## GATE G2
Update STATUS.md; list demo; wait for human OK.
