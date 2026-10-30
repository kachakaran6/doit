# P16 — Offline Outbox, Sync, Realtime

**Lane** A · **Depends on** P04, P11 · **Branch** `feat/p16-offline-sync-realtime`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F13
- `04-ARCHITECTURE.md` §4.5
- `06-API-CONTRACT.md` §6.10 (idempotency)

## Goal
Make the app trustworthy on a bad network: every mutation survives a kill, syncs exactly once,
and remote changes arrive live.

## Deliverables
- `src/lib/outbox.ts` — persistent queue (MMKV-backed), enqueue/flush/retry/discard
- `src/app/providers/OutboxProvider.tsx` — flush on reconnect, foreground, and app start
- pending-upload manager for attachments (upload bytes first, then the mutation)
- `src/lib/realtime.ts` — socket.io client with auth, backoff, and query invalidation
- a "Pending sync" screen listing queued and failed items with retry/discard
- a small sync-status indicator in the Home header (dot: synced / syncing / offline / error)
- API side: socket gateway emitting `task.*`, `comment.*`, `bug.*`, `session.*` events
- tests: outbox ordering, idempotent replay, conflict resolution

## Requirements
- Outbox entry: `{id, idempotencyKey, method, path, body, localFiles[], createdAt, attempts,
  state}`. FIFO per entity id; parallel across entities (max 3 concurrent).
- Flush algorithm: upload pending files → send mutation with `Idempotency-Key` → on 2xx
  reconcile the cache with the returned entity → on 4xx discard with a user-visible reason →
  on 5xx/network retry with exponential backoff (1s, 4s, 16s), then park as `FAILED`.
- Conflicts: server wins on scalars, union on labels/attachments; if the local and remote
  `updatedAt` differ and the user edited, show a "changed on another device" banner with
  "Keep mine / Use theirs".
- Realtime: on event, invalidate the specific query keys (never merge payloads by hand). If the
  socket is down >30 s, fall back to refetch-on-focus.
- The status dot must be honest: never show "synced" while the outbox is non-empty.

## Do not
- Do not use a third-party offline library that hides its own queue — the outbox must be
  inspectable and testable.
- Do not retry a 4xx.
- Do not block the UI while flushing.

## Acceptance checks
- [ ] Airplane mode: create a task, create a bug with a voice note and a screenshot, create a
      sticky. Kill the app. Reopen. All three still pending. Turn on network → all three land
      exactly once (verify row counts in the DB).
- [ ] Same mutation replayed by the server twice (forced) → one row, `Idempotent-Replay: true`.
- [ ] Two devices: edit the same task → second device shows the conflict banner and both
      resolutions work.
- [ ] Socket reconnect after a 60 s network drop re-syncs without a full refetch.
- [ ] Outbox with 50 queued items flushes in <10 s on 4G.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
