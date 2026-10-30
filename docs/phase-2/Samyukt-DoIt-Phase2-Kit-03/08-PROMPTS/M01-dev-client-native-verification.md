# M01 — Dev Client Build + Native Module Verification

**Lane** M · **Depends on** R00 · **Branch** `feat/m01-dev-client-native-verification`

## Load
- `09-PHASE2-RULES.md` (P2-7: no unverified green)
- `00-WHAT-REMAINS.md` §A1
- `11-TECH-DECISIONS.md` (Phase 1) ADR-005, ADR-006, ADR-011
- `12-NATIVE-CAPABILITIES.md` (Phase 1)

## Goal
Find out which of the three native features actually exist. Build a real dev client, install it
on hardware, and test the overlay, the shake capture and the widgets. Report the truth, including
failures.

## Deliverables
- `apps/mobile/eas.json` with `development` / `preview` / `production` profiles
- a dev client build installed on at least one physical Android device
- `docs/NATIVE-VERIFICATION.md` — a table of every capability with PASS / FAIL / PARTIAL and
  the evidence (screenshot filename, log excerpt, measured number)
- a defect list in `PROGRESS.md` for everything that fails, with severity
- fixes for anything broken that is a genuine oversight rather than a missing native target

## Requirements
- Build with `npx expo run:android` (or an EAS `development` build). **Expo Go is not
  acceptable evidence for anything in this prompt.**
- Test each capability on hardware, and record the device model and OS version:

| Capability | How to prove it |
|---|---|
| Overlay bubble | enable it, open a third-party app, screenshot showing the bubble over it |
| Overlay → sheet → submit | stopwatch 10 trials, report the median |
| Foreground service | `adb shell dumpsys activity services \| grep -i bubble` output |
| Screen capture on shake | shake during a session, screenshot the captured image in the composer |
| MediaProjection consent reuse | start a session, capture twice, confirm only one consent dialog |
| Shake debounce | shake twice in 1 s, confirm one capture |
| Android widget | add it from the launcher widget picker, screenshot it, quick-add with the app closed |
| iOS widget / Share Extension | list the Xcode targets; if the targets do not exist, mark FAIL |
| Voice recording | record 10 s, play back, confirm the file exists on disk |

- If a native target is missing entirely (e.g. no WidgetKit extension in the Xcode project), do
  **not** write one in this prompt unless it is under 100 lines. Record it as a defect and move
  on — M02 and M03 need the truth more than they need the feature.

## Do not
- Do not mark anything PASS without a screenshot or a command output.
- Do not fix the overlay/widgets in this prompt if the fix is large — this prompt is an audit.
- Do not test on an emulator only; at least one capability must be verified on real hardware.

## Acceptance checks
- [ ] `docs/NATIVE-VERIFICATION.md` exists with every row filled PASS/FAIL/PARTIAL + evidence.
- [ ] A dev client build installs and launches on a physical device.
- [ ] `adb reverse tcp:3000 tcp:3000` + the dev client reaches the local API.
- [ ] Every FAIL has a defect entry in `PROGRESS.md` with a severity and a suggested owner prompt.
- [ ] The median capture-to-submit time is recorded as a number (or marked FAIL if the bubble
      does not work).

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
