# P20 — Real-Device QA on Dev Build (QA + Mobile)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `15` §1–2, original `06-bug-capture-overlay` testing checklist.

## Task
1. Build a dev build + preview APK. Test on **≥2 physical Android devices from different OEMs** (list models).
2. Run and record results (pass/fail + notes + screen recording or log) for: permission wizard · bubble over another app and a fullscreen game · screen off/on · swipe-away survival · shake sensitivity (pocket/walking) · screenshot excludes bubble/UI · Quick Capture open < 500 ms · voice online/offline · audio attach · offline outbox (airplane mode) · FCM push · widgets · keyboard accessory bar on 2 IMEs · haptics.
3. Fix defects found; add OEM battery/autostart guidance for the failing OEMs.
4. Add **Maestro** e2e flows for the in-app journeys (login → quick add → edit → sticky → convert → settings theme switch). Overlay stays manual; document the manual script.
5. Mark iOS honestly: what works, what doesn't (no overlay). Don't claim WidgetKit verified without a device.

## Done when
`docs/QA_RESULTS.md` has a device × feature matrix; STATUS.md updated.
