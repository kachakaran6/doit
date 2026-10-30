# P18 — Baseline Check & Rename to DoIt (Architect)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `11`, `15`.

## Task
1. **Baseline**: fresh install, typecheck, API tests, token lint, boot API + app. Report real results. Rewrite `STATUS.md` honestly: for each phase list *built*, *how verified*, *unverified*.
2. **Fix quick start**: document that native features need a dev build/APK (not Expo Go). Add scripts `dev:android` (expo run:android) and keep `adb reverse` instructions. Remove LAN-IP hard-coding from committed files.
3. **Rename** per `docs/11`: `@samyukt/*` → `@doit/*`, scheme, env prefix, native module JS name, docker names, seed emails, UI strings, docs. Keep `com.samyukt.doit` everywhere it is an id/path. Keep Expo slug unless verified safe.
4. Add `scripts/check-naming.mjs` (allowlist from `docs/11`), wire into CI/pre-commit.
5. Rebuild native (`expo prebuild --clean` + dev build) and smoke test: app launches, login works, bubble starts.

## Verify
`pnpm --filter @doit/mobile android` and `pnpm --filter @doit/api start:dev` work; `pnpm typecheck && pnpm test && node scripts/check-naming.mjs` pass; no `@samyukt` anywhere.
