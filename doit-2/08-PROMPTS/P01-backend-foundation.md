# P01 — Backend Foundation

**Lane** A · **Depends on** P00 · **Branch** `feat/p01-backend-foundation`

## Load
- `09-AGENT-RULES.md`
- `04-ARCHITECTURE.md` §4.2
- `05-DATA-MODEL.md` (whole file)
- `06-API-CONTRACT.md` §6.1, §6.10

## Goal
Turn the Nest skeleton into a real backend: database, migrations, error envelope, response
envelope, validation, pagination helper, logging, Swagger, and the infra services every later
module needs. No business domains yet.

## Deliverables
- `prisma/schema.prisma` containing the **entire** schema from `05-DATA-MODEL.md` §5.2
- initial migration + `prisma/seed.ts` (2 users, 1 workspace, 2 projects, 8 tasks, 3 bugs,
  4 stickies, 6 labels)
- `common/` — `AllExceptionsFilter`, `ResponseInterceptor`, `LoggingInterceptor`,
  `ZodValidationPipe`, `AppError` + `ErrorCode` enum, `CursorPage<T>` helper
- `infra/prisma/PrismaService`, `infra/storage/StorageService` (local-disk driver behind an
  interface), `infra/queue/` (BullMQ wiring), `infra/realtime/` (socket.io gateway shell)
- `config/` — zod env schema, namespaces `app`, `db`, `auth`, `storage`, `queue`, `ai`
- `GET /health`, `GET /health/ready`
- Swagger at `/docs` with bearer auth configured
- `test/e2e/health.e2e-spec.ts`, unit tests for the filter and the cursor helper

## Requirements
- The error envelope and success envelope must match `06-API-CONTRACT.md` §6.1 exactly,
  including `requestId`.
- `CursorPage` must encode `(order, id)` in an opaque base64 cursor and expose
  `{ data, meta: { nextCursor, hasMore, total } }`.
- Every thrown `AppError` maps to the documented HTTP status and `code`; unknown errors become
  `INTERNAL` with the stack logged and never returned.
- Request ids generated per request (uuid v7), echoed in the header `x-request-id` and in logs.
- `pnpm --filter api db:seed` is idempotent and finishes in <10 s.
- StorageService: `putObject`, `getSignedUrl`, `deleteObject`, `getPublicUrl`; local driver
  writes under `.storage/` and serves via `/static`.

## Do not
- Do not create any module under `src/modules/` yet.
- Do not add Redis-dependent features beyond the queue connection (it must degrade to
  in-memory when `REDIS_URL` is absent, so local dev works).
- Do not write raw SQL in services — Prisma only, except where a migration requires it.

## Acceptance checks
- [ ] `pnpm --filter api prisma migrate deploy && db:seed` works on a fresh Postgres.
- [ ] `GET /health/ready` returns `{db: "up", storage: "up", queue: "up"}`.
- [ ] A deliberately thrown `AppError(TASK_NOT_FOUND)` returns the exact envelope from §6.1.
- [ ] Swagger lists `/health` and `/health/ready` with schemas.
- [ ] Unit tests cover: filter mapping, cursor encode/decode round-trip, zod pipe rejection.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
