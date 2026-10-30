# P06 — Android Bug Capture Overlay (Native)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `06` (ALL), `05` (keyboard/toolbars), `04` (bug meta, attachments).

## Task
1. Local Expo module `modules/samyukt-capture` (Kotlin) + config plugin `plugins/withSamyuktCapture` with all manifest entries/services. Everything reproducible via `expo prebuild --clean`.
2. Implement: foreground service, draggable edge-snapping bubble, long-press mini menu, shake detector (configurable sensitivity), MediaProjection screenshot (bubble hidden during capture), notification actions, `QuickCaptureActivity` (translucent) hosting RN root `QuickCapture`.
3. JS bridge `src/native/capture.ts` with the API from `docs/06`; iOS stub that returns `isSupported() === false`.
4. Feature `bug-capture`: permission wizard (Settings → Bug Capture) with live status + deep links + OEM battery tips; `QuickCaptureScreen` (screenshot thumb, auto-start mic, text, chips for project/severity, send); `useCreateBug` uploading screenshot + audio in parallel then creating the bug with `meta`; persistent retry queue + bubble badge.
5. Context collection (device, OS, network, battery, foreground app if usage access granted).
6. Performance: Quick Capture visible < 500 ms after trigger; prefetch projects/labels.
7. Write `TESTER_GUIDE.md` with screenshots placeholders and steps.

## Verify (on a real Android device, ideally 2 OEMs)
Run every item in the "Testing checklist" of `docs/06`. Record timings in STATUS.md.

## Risk handling
If MediaProjection behaves differently on the device/OS, document in DECISIONS.md and implement the documented fallback: detect the user's own system screenshot via MediaStore observer and offer "Report bug" notification with that image.

## GATE G4
Demo: open another app/game → bubble → shake → speak → bug appears in Samyukt with image and audio. Wait for human OK.
