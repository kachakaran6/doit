# P13 — Test Session, Shake Capture, Screenshot

**Lane** A · **Depends on** P12 · **Branch** `feat/p13-test-session-shake-screenshot`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F8, F9
- `12-NATIVE-CAPABILITIES.md` (MediaProjection, accelerometer)
- `11-TECH-DECISIONS.md` ADR-006

## Goal
Make shake-to-capture real: a timed Test Session with one-time screen-capture consent, shake
detection, automatic screenshot, and the bug composer pre-filled.

## Deliverables
- `src/native/shake/` — accelerometer listener with debounce + sensitivity from settings
- `src/native/screenshot/` — `MediaProjection` capture service (Android), in-app
  `captureRef` (iOS)
- `src/features/sessions/` — start session (pick app under test), live session bar, end session
  summary, session detail with all its bugs
- `src/lib/device.ts` — context collector (device model, OS, app under test, build number,
  locale, storage, battery)
- iOS: Share Extension target that accepts an image and opens the bug composer
- tests for the debounce logic and the context collector

## Requirements
- Session start shows the OS `MediaProjection` consent **once**; the resulting `MediaProjection`
  is retained for the session and reused for every capture. It stops when the session ends.
- Shake: threshold configurable (low/medium/high) in settings, debounce 1.2 s, must not fire
  while the phone is in a car/bike (require 3 direction reversals within 400 ms).
- On shake: grab the current frame → downscale to ≤1440 px long edge, JPEG q80 → open the
  capture sheet with the screenshot attached and audio recording **already started** (so the
  tester can just talk). A single tap on Stop → transcribe → attach.
- Session UI: a thin accent strip at the top of the app (in-app) plus a persistent notification
  with "End session". Elapsed timer, bug count.
- End session → summary screen: duration, bugs by severity, list, "Share report" (markdown via
  the OS share sheet) and "Create tasks from all" bulk action.
- Auto-context captured per bug: `deviceModel`, `osVersion`, `appUnderTest` (foreground
  package), `appVersion` if readable, `buildNumber`, `capturedAt`, `screenSize`, `locale`,
  `freeStorageMb`, `batteryPct`, `networkType`, `autoContext` JSON.
- If the OS revokes the projection (user stops screen sharing), the app degrades to in-app
  capture only and tells the user once, without a modal loop.

## Do not
- Do not attempt to read other apps' logcat — it is blocked on modern Android. Capture our own
  events only; offer "attach log file manually".
- Do not record continuously; capture a single frame per shake unless the user chose "record
  clip".
- Do not ask for the projection consent more than once per session.

## Acceptance checks
- [ ] Start a session on a real Android device, switch to another app, shake → sheet opens with
      a real screenshot of that app, speak, Send → bug created with correct `appUnderTest`.
- [ ] Shake twice quickly → exactly one capture.
- [ ] End session → summary counts match the bugs created.
- [ ] iOS: shake inside Samyukt opens the composer with an in-app screenshot; the Share
      Extension accepts an image from Photos and lands in the same composer.
- [ ] Revoking screen capture mid-session shows one toast and keeps the session usable.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
