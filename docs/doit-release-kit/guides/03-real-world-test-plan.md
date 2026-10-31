# 03 — Real-world test plan (run on real phones with the preview APK)

Use ≥ 2 phones from different brands. Log each result: **device, Android version, pass/fail, notes, screen recording**.

## A. Setup
- [ ] Install APK, register, create workspace + project
- [ ] Permission wizard completes; notification shows while bubble active
- [ ] Settings → Developer → health shows API + DB ok

## B. Core capture scenarios
| # | Scenario | Expected |
|---|---|---|
| 1 | Open another app (e.g. Chrome), tap bubble | Screenshot of that app (no bubble in it), Quick Capture opens fast |
| 2 | Same with shake | Same result |
| 3 | Speak "button overlaps text on login screen", send | Bug appears with screenshot, transcript, audio, device info |
| 4 | Type-only bug | Created with screenshot |
| 5 | Open a **game** (landscape, fullscreen), shake | Capture works, game doesn't stutter/crash |
| 6 | Rotate phone while Quick Capture open | No crash, layout OK |
| 7 | Screen off/on, then shake | Still works |
| 8 | Swipe app away from Recents | Bubble/service survives (or clear OEM guidance shown) |
| 9 | Reboot phone | Service state as designed (auto-start or prompt) |
| 10 | Walk with phone in pocket 2 min | No false shake captures |
| 11 | Banking/secure-flag app | Black/blocked capture handled with a clear message |
| 12 | Airplane mode → capture → send | Queued with pending badge; delivered after reconnect, **no duplicates** |
| 13 | Kill app mid-upload | Resumes/retries, no data loss |
| 14 | Redact (blur) part of screenshot | Redacted version uploaded, not original |
| 15 | Low battery saver mode | Behavior documented |

## C. Product scenarios
- [ ] Create task via quick add (`Fix login !high #android tomorrow`) → fields parsed
- [ ] Voice quick add → text appears; audio attached playable
- [ ] Edit task: state, priority, due date, labels, assignee, description
- [ ] Sticky → convert to task
- [ ] Invite a second tester → they join → role limits work → remove them → access lost
- [ ] Log out → log in; "Logout all" kills other devices' sessions
- [ ] Dark/light/system + 5 accents
- [ ] Push notification arrives (if FCM configured)
- [ ] Web (if built): bug from phone appears in triage with image + audio

## D. Measurements
- Time from "see bug" to saved (target < 5 s) — measure 10 times
- Quick Capture open time (target < 500 ms)
- Battery drain over 1 hour idle with bubble on
- Any crash/ANR (collect from Sentry + `adb logcat`)

## E. Report
Fill a table: Scenario × Device → PASS/FAIL. Every FAIL → bug in DoIt itself (dogfood it!) with screenshot. Don't ship until scenarios 1–5, 8, 12, 13 pass on all devices.
