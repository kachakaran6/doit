# R00 — Naming Migration — `@doit/*`, keep `com.samyukt.doit`

**Lane** — · **Depends on** nothing · **Branch** `feat/r00-naming-migration`

## Load
- `09-PHASE2-RULES.md`
- `01-NAMING-MIGRATION.md` (this is the spec — follow the table and the find/replace map)

## Goal
Rename the internal identity of the project from Samyukt to DoIt, without touching the permanent
store identity. Company is Samyukt, product is DoIt: `@doit/*` in code, `com.samyukt.doit` in
the store.

## Deliverables
- every `package.json` `name` field under `apps/` and `packages/`
- every import and `pnpm --filter` reference
- `tsconfig.base.json` + per-package path aliases
- `app.config.ts` (name, slug, scheme, bundle ids)
- `AndroidManifest.xml` intent filters and the deep-link scheme
- `Info.plist` URL schemes and associated domains
- all docs, CI workflows and scripts
- `README.md` command table

## Requirements
- Apply `01-NAMING-MIGRATION.md` §1.3 exactly, in order, then review `git diff` before commit.
- `com.samyukt.doit`, `group.com.samyukt.doit`, `app.samyukt.com`, `api.samyukt.com` and the
  `@samyukt.com` seed emails are **deliberately preserved**.
- Display name becomes "Samyukt DoIt"; the widget label becomes "DoIt".
- Deep-link scheme becomes `doit://`.
- Update the lockfile and prove the whole workspace still builds.

## Do not
- Do not touch `applicationId` or `bundleIdentifier`.
- Do not rename the database, the repo folder, or the seeded user emails.
- Do not do this in the same PR as any functional change — this PR is a rename and nothing else.

## Acceptance checks
- [ ] `rg "@samyukt/"` returns zero hits outside `docs/`, store copy and legal files.
- [ ] `rg "samyukt://"` returns zero hits.
- [ ] `rg "com.samyukt.doit"` returns the same count as before the change (nothing lost).
- [ ] `pnpm install && pnpm -r typecheck && pnpm -r lint && pnpm -r test` all exit 0.
- [ ] `pnpm --filter @doit/api start:dev` boots and `/api/v1/health` returns 200.
- [ ] Launcher label reads "Samyukt DoIt" on a real device.
- [ ] `doit://task/<id>` opens the task screen.
- [ ] The diff contains no logic changes (spot-check 10 random hunks).

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
