# 06 — Bug Capture Overlay (the killer feature)

## Goal
While testing ANY app/game, the tester logs a bug in ≤ 2 taps / 5 seconds, with screenshot, voice or text, and device context.

## Platform reality
| Capability | Android | iOS |
|---|---|---|
| Bubble over other apps | Yes (`SYSTEM_ALERT_WINDOW`) | **No** |
| Screenshot of other apps | Yes (`MediaProjection`, user consent per session) | **No** (only own app) |
| Shake detection in background | Yes (foreground service + accelerometer) | Only foreground |
| Detect user's own screenshot | Yes (MediaStore observer) | Yes (`userDidTakeScreenshot` when app is running) |
**POC target = Android.** iOS fallback = in-app capture + "you took a screenshot — add a bug?" notification/prompt + Shortcuts/Share Sheet entry (BACKLOG).

## User flow
1. Settings → **Bug Capture** → "Enable" runs a permission wizard (below).
2. Service starts; a small draggable **bubble** appears over all apps (snaps to edge, semi-transparent when idle).
3. Triggers:
   - **Tap bubble** → capture screenshot of what's underneath (bubble hidden for the frame) → open Quick Capture.
   - **Shake** → same as tap.
   - **Long-press bubble** → radial mini menu: Voice-only bug · Text-only bug · Screenshot-only · Hide bubble.
   - **Notification action buttons** ("Report bug") as a backup trigger.
4. **Quick Capture** (translucent overlay screen over the tested app, ~60% height bottom sheet look):
   - Screenshot thumbnail (tap → fullscreen annotate: draw/arrow/blur, simple pen only in POC; optional)
   - Big **mic button** auto-starts listening (STT fills the title/description live; also records audio)
   - Text field (contextual keyboard toolbar: severity, project, label, assignee)
   - Pre-filled chips: Project (last used), Severity (default `major`), Type = `bug`
   - **Send** (or voice "send" word is BACKLOG). Success → toast + haptic + bubble pulses ✓; sheet closes and the tester is back in their app instantly.
5. Upload happens in the background (WorkManager/queue). If offline, queue and retry; show a small badge on the bubble with pending count.

## Auto-captured context (put into `meta`)
deviceModel, manufacturer, osVersion, sdkInt, screenSize/density, locale, networkType, batteryPct, orientation, free RAM (optional), **foreground app package + label** (via `UsageStatsManager`, needs Usage Access permission — optional, degrade gracefully), timestamp. If a *Samyukt SDK/companion* is added to tested apps later, app version/build can be passed in (BACKLOG).

## Permissions wizard (Settings → Bug Capture)
Each step shows: why, a status tick, and a button that deep-links to the right system screen. Re-check status on app resume.
1. **Display over other apps** → `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`
2. **Notifications** (Android 13+ `POST_NOTIFICATIONS`) → required for foreground service
3. **Microphone** (`RECORD_AUDIO`) → voice
4. **Screen capture consent** (MediaProjection) → system dialog; request on first bubble start; re-request when the token expires (Android 14+ needs fresh consent per projection session)
5. **Usage access** (optional) → foreground app name
6. **Battery optimization exemption** (recommended) → keep service alive; show OEM tips (Xiaomi/Oppo/Vivo autostart) because such OEM kill background services
Manifest: `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PROJECTION`, `FOREGROUND_SERVICE_SPECIAL_USE`, `POST_NOTIFICATIONS`, `RECORD_AUDIO`, `PACKAGE_USAGE_STATS` (optional), `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`, `VIBRATE`.
Also: Accessibility-service-based screenshot is NOT used (policy-risky, Play Store rejection).

## Native module design: `modules/samyukt-capture` (Kotlin, Expo Modules API)
Components:
- `CaptureForegroundService` — owns bubble view, accelerometer listener, MediaProjection, persistent notification with actions.
- `BubbleOverlayView` — draggable, edge-snapping, `TYPE_APPLICATION_OVERLAY`, tap/long-press/drag handling.
- `ScreenshotCapturer` — VirtualDisplay + ImageReader → Bitmap → JPEG/WebP file in cache dir; hides bubble for one frame before capture.
- `ShakeDetector` — threshold + debounce (≈2.7g, 1.2s cooldown, configurable sensitivity in Settings).
- `QuickCaptureActivity` — translucent theme (`Theme.Translucent.NoTitleBar`), launches RN root component `QuickCapture` with initial props `{ screenshotUri, context }`. Separate RN root registered in `index.js`. Reuses `ui/` kit and auth tokens from SecureStore.
- JS API (`src/native/capture.ts`): `isSupported()`, `getPermissionStatus()`, `request(permission)`, `startBubble()`, `stopBubble()`, `setShakeEnabled(bool)`, `setSensitivity(n)`, `addListener('onCaptureTriggered')`, `getPendingUploads()`.
- Config plugin (`plugins/withSamyuktCapture.ts`) edits AndroidManifest/services so `expo prebuild` stays reproducible. **Do not hand-edit generated `android/`.**

## Quick Capture RN module (`features/bug-capture`)
- `QuickCaptureScreen`, `useVoiceCapture` (STT + record), `useCreateBug` (upload attachments in parallel → create work item), `bugContext.ts`, upload queue with retry (persist queue to storage).
- Must open in < 500 ms: keep it lightweight, avoid heavy imports, prefetch projects/labels on service start and cache.

## iOS fallback (implement minimal, mark clearly)
Within the app: "New bug" button on FAB, screenshot-taken prompt while app is active. Everything else = BACKLOG.

## Testing checklist
- Bubble survives app swipe-away and device screen off/on.
- Works over a game (landscape, fullscreen) and a normal app.
- Screenshot excludes the bubble and quick-capture UI.
- Shake does not trigger while phone is in pocket walking (tune threshold + require 2 shakes in 600 ms).
- Voice works offline if the device has an offline language pack; otherwise shows a clear message but still lets the user type.
- Offline submit queues and retries.
