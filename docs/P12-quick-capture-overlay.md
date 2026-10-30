# P12 — Quick Capture Overlay (Android)

**Lane** A · **Depends on** P11, P08 · **Branch** `feat/p12-quick-capture-overlay`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F7
- `03-DESIGN-SYSTEM.md` §3.3, §3.4
- `12-NATIVE-CAPABILITIES.md` (permissions section)
- `11-TECH-DECISIONS.md` ADR-005

## Goal
The single most important feature: a floating bubble over any app that opens a capture sheet in
one tap. Android only; iOS gets the fallback described in P13.

## Deliverables
- `src/native/overlay/` — Kotlin module `OverlayServiceModule.kt` + `BubbleService.kt`
  (foreground service, `SYSTEM_ALERT_WINDOW` window), exposed via a native module
- `src/native/overlay/index.ts` — typed `OverlayService` interface with `isAvailable()`
- a headless React entry (`index.overlay.js` / a second `AppRegistry` component) so the sheet
  renders inside the overlay window
- `src/features/capture/` — the **shared** `CaptureSheet` used by bubble, in-app FAB and shake
- permission flow in `src/native/permissions/`
- settings toggle + persistent notification with Hide / Stop actions

## Requirements
- Bubble: 56 dp circle, accent fill, drag anywhere, snap to the nearest edge on release,
  persist position, respect the display cutout and gesture insets. It must never appear over
  the lock screen, the system UI, or during a call.
- Tap → open the capture sheet in an overlay window: mic button, text field, screenshot button,
  bug/task toggle, project picker. The sheet is the same component as in-app (no fork).
- The sheet must take focus for text input, and return focus to the app under test within 1 s of
  Send — verify by checking that the previous app is still resumed.
- Foreground service: `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` with a low-priority notification
  ("Samyukt capture is on · Hide · Stop"). Battery: no wakelock, no polling.
- Denied `SYSTEM_ALERT_WINDOW` → the settings screen shows a clear explanation, a button that
  opens the exact system settings page, and the app stays fully usable without it.
- Survive app kill: the service restarts on boot only if the user enabled "always on".
- On submit, the sheet closes, shows a 600 ms success checkmark overlay, then dismisses.

## Do not
- Do not attempt this on iOS; `isAvailable()` must return false and the UI must hide the toggle.
- Do not use an accessibility service to read other apps' UI (policy risk, Play rejection).
- Do not request `QUERY_ALL_PACKAGES` — use the foreground-app detection approach documented in
  `12-NATIVE-CAPABILITIES.md`.
- Do not keep the service alive when the user turns the bubble off.

## Acceptance checks
- [ ] With the bubble on, open a third-party app, tap the bubble, speak a bug, hit Send →
      total time under 5 seconds (stopwatch, 10 trials, median reported).
- [ ] Focus returns to the third-party app after Send.
- [ ] Bubble survives a screen rotation, a dark/light switch, and a reboot (if enabled).
- [ ] Denying the permission shows the explanation screen and nothing crashes.
- [ ] Battery: <2%/hour idle with the bubble on (measured with `dumpsys batterystats`).
- [ ] Service is killed cleanly on "Stop"; notification disappears.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
