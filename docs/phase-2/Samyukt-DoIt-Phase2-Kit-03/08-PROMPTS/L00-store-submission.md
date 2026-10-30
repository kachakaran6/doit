# L00 — Store Submission — Play Console and App Store Connect

**Lane** L · **Depends on** M03, B00, B01, L01 · **Branch** `feat/l00-store-submission`

## Load
- `09-PHASE2-RULES.md`
- `10-LAUNCH-CHECKLIST.md` (the whole file — this prompt executes it)
- `12-NATIVE-CAPABILITIES.md` (Phase 1) §3 for the permission justifications

## Goal
Get the app into both stores. Build the artefacts, write the listing, submit, and handle review
feedback.

## Deliverables
- production AAB (`eas build --platform android --profile production`)
- production IPA
- store listing assets: 8 screenshots per platform, feature graphic, icon set, descriptions
- permission justification text filed in Play Console
- a 60-second screen recording of the capture flow, linked in the review notes
- `docs/RELEASE-PROCESS.md` — how to cut a release next time, step by step

## Requirements
- Run the pre-submission smoke test from `10-LAUNCH-CHECKLIST.md` §8 on a **clean device with a
  fresh account** before submitting. Do not skip step 5 (the bubble capture) — it is the feature
  reviewers will test.
- Play: declare special app access (overlay), foreground service type, and usage access
  (optional). Attach the recording. Expect a manual review of 2–7 days.
- Apple: the app must not reference Android-only features in screenshots or copy. If the overlay
  is Android-only, the iOS listing shows the Back Tap path instead.
- Screenshots must be real captures of the shipping build, in the shipping theme (dark), with no
  placeholder data that looks fake.
- Data safety / privacy nutrition must match `L01`'s engineering document exactly.
- First release: internal testing track → 5 external testers for 3 days → production at 20%
  rollout.

## Do not
- Do not upload a build that has not passed M03's QA matrix.
- Do not use a debug keystore for the production build.
- Do not promise iOS overlay capture anywhere in the listing.
- Do not submit both platforms the same day — stagger them so you can fix one while the other
  is in review.

## Acceptance checks
- [ ] AAB and IPA built and installed on clean devices.
- [ ] Both listings complete: copy, screenshots, icon, feature graphic, category, rating.
- [ ] Permission justifications filed; the recording is linked.
- [ ] Smoke test §8 passed end to end on a fresh account.
- [ ] Internal testing track has 5 testers with 3 days of use.
- [ ] `docs/RELEASE-PROCESS.md` lets someone else cut the next release unaided.
- [ ] A rollback plan exists (previous build retained; server backward compatible).

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
