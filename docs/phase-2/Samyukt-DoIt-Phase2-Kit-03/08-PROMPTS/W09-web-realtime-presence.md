# W09 — Realtime, Presence, Conflict UX

**Lane** W · **Depends on** W08 · **Branch** `feat/w09-web-realtime-presence`

## Load
- `09-PHASE2-RULES.md`
- `04-ARCHITECTURE.md` (Phase 1) §4.7
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.6
- `02-FEATURE-SPEC.md` (Phase 1) F13

## Goal
Make the board live: see teammates' changes as they happen, see who is looking at what, and
resolve conflicts without losing work.

## Deliverables
- `app/providers/RealtimeProvider.tsx` — socket lifecycle, auth, backoff, reconnect
- `lib/socket.ts`
- query invalidation map (event → query keys)
- presence UI: avatar stacks on cards, cursors on the board
- `ConflictBanner` for `409 STALE_WRITE` and for remote edits to an open drawer

## Requirements
- Socket authenticates with the access token in the handshake and re-authenticates after a
  refresh; on `SESSION_REVOKED` it disconnects and the app logs out.
- Events invalidate specific query keys — never merge payloads by hand.
- Backoff: 1s, 2s, 4s, 8s, capped 30s, with jitter. Show a subtle "reconnecting" pill after two
  failures; never a modal.
- Presence: throttled to 1 update / 2 s; disabled in rooms with >50 members.
- Conflict: if a task changes remotely while its drawer is open and the user has unsaved edits,
  show a banner with "Reload" / "Keep mine". Never silently overwrite.
- Offline: mutations queue and flush on reconnect, exactly as mobile does — reuse the outbox
  pattern, not a new one.

## Do not
- Do not poll as a substitute for the socket (refetch-on-focus is the fallback only).
- Do not show a toast for every remote change — that is noise.
- Do not let presence block rendering if the socket is down.

## Acceptance checks
- [ ] Two browsers on the same board: a card moved in one appears in the other within 500 ms.
- [ ] Kill the network for 60 s → "reconnecting" pill → reconnect → state correct, no duplicates.
- [ ] Two users editing one task: the second gets the conflict banner and both resolutions work.
- [ ] Avatar stack shows who is on the board; disappears after they leave.
- [ ] Mutations made offline flush on reconnect exactly once.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
