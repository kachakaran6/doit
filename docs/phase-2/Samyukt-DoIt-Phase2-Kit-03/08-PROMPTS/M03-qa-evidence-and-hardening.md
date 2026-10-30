# M03 — QA Evidence, Targeted Tests, Hardening

**Lane** M · **Depends on** M02 · **Branch** `feat/m03-qa-evidence-and-hardening`

## Load
- `09-PHASE2-RULES.md` (P2-7)
- `10-QA-ACCEPTANCE.md` (Phase 1)
- `00-WHAT-REMAINS.md` §A2
- `docs/NATIVE-VERIFICATION.md` (produced by M01)

## Goal
Turn a green test suite into evidence. Add the assertions that actually protect the risky
paths, execute the QA matrix on real devices, and fix what it finds.

## Deliverables
- new tests (target: +60 assertions across the five risky areas below)
- `docs/QA-REPORT.md` with the filled matrix from Phase 1's `10-QA-ACCEPTANCE.md`
- fixes for every P0 and P1 defect found
- `docs/PERF.md` with the measured numbers

## Requirements
Add real assertions for exactly these, one describe block each:

1. **Auth rotation & replay** — consume a refresh token, reuse it, assert the whole family is
   revoked and that the *new* token also fails.
2. **Role × endpoint matrix** — a table-driven test running all 4 roles against every mutating
   endpoint, asserting the exact status code. ~40 assertions from one loop.
3. **Idempotency** — same `Idempotency-Key` twice returns one row and `Idempotent-Replay: true`;
   different keys with the same body create two rows.
4. **Upload magic bytes** — a `.png` that is really a PDF is rejected; a 13 MB file is rejected
   at `init` before any bytes move.
5. **Outbox exactly-once** — enqueue 3 mutations, kill the process mid-flush, restart, flush,
   assert the server received each exactly once (check DB row counts).

Then execute the QA matrix on the device set from `10-QA-ACCEPTANCE.md` §1, recording pass/fail
with evidence. Fix P0 (crash/data loss) and P1 (visual breakage/wrong data) in this prompt;
file P2s in the backlog.

- Every new test must fail if the behaviour is reverted — prove it by reverting one line and
  showing the red run, then restoring.
- The QA report needs evidence per row, not "looks fine".
- Measure and record: cold start, capture-to-submit median, list scroll fps, memory after 20
  push/pop, APK size.

## Do not
- Do not add features.
- Do not delete or weaken an existing test to make the suite green.
- Do not mark a matrix row PASS without evidence — mark it BLOCKED with a reason instead.

## Acceptance checks
- [ ] `pnpm --filter @doit/api test` passes with the new assertions; the count is reported.
- [ ] Each of the five new test groups has been proven to fail when its behaviour is reverted.
- [ ] `docs/QA-REPORT.md` has every matrix row filled with PASS/FAIL/BLOCKED + evidence.
- [ ] All P0 and P1 defects are fixed; the P2 list is in `PROGRESS.md`.
- [ ] `docs/PERF.md` contains the five measured numbers against their targets.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
