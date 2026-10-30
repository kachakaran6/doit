# P17b — QA, Performance, Hardening, Release

**Lane** A · **Depends on** P17, P15, P14, P13 · **Branch** `feat/p17b-qa-hardening-release`

## Load
- `09-AGENT-RULES.md`
- `10-QA-ACCEPTANCE.md` (whole file — this prompt executes it)
- `12-NATIVE-CAPABILITIES.md` (store justifications)

## Goal
Take the build from "works on my machine" to "installable and defensible".

## Deliverables
- A written QA report `docs/QA-REPORT.md` with the results table from `10-QA-ACCEPTANCE.md`
- fixes for every P0/P1 defect found
- performance: FlashList tuning, image sizes, JS bundle analysis, startup time measurement
- security pass: no secrets, tokens in Keychain, certificate pinning (optional), input
  validation on both sides, authz matrix re-verified
- accessibility pass: TalkBack + VoiceOver walkthrough of the capture flow
- release config: `app.config.ts` production profile, signing notes, ProGuard/R8 rules for the
  native modules, iOS privacy manifest (`PrivacyInfo.xcprivacy`) with the required reason APIs
- Play Store + App Store listing copy, screenshots list, and permission justifications
- `CHANGELOG.md`

## Requirements
- Run the full device matrix from `10-QA-ACCEPTANCE.md` and record pass/fail per cell.
- Fix all P0 (crash / data loss / capture broken) and all P1 (visual breakage, wrong data).
- Startup: cold start < 2.5 s on a mid-range Android; time to interactive list < 3 s.
- Memory: no leak across 20 screen push/pop cycles (verify with the profiler).
- `pnpm lint && pnpm typecheck && pnpm test` green; API service coverage ≥70%.
- Zero `console.log`, zero `any` in new code, zero TODO comments without an issue reference.

## Do not
- Do not add new features in this prompt, even small ones. File them in `PROGRESS.md`.
- Do not ship with mock data or a dev menu reachable in release.
- Do not disable R8/ProGuard to make it build.

## Acceptance checks
- [ ] Every cell of the QA matrix is filled with pass/fail + evidence.
- [ ] A release APK and an IPA build successfully and install on a clean device.
- [ ] The 5-second capture benchmark is re-run and the median recorded in the report.
- [ ] TalkBack and VoiceOver can complete: open app → capture bug → send.
- [ ] Store permission justifications written for: overlay, foreground service, microphone,
      screen capture, notifications, camera (if used).
- [ ] `docs/QA-REPORT.md` committed.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
