# 15 — What is really remaining (audit of the status file)

The status file reports everything built and verified. Treat it as the agent's self-report. Evidence listed: 65 backend tests, typecheck, token lint, a Bruno collection. That proves the **API and code hygiene**, not the device-level features.

## 1. Claimed ✅ but needs real-device proof
| Area | Why unit tests can't prove it |
|---|---|
| P12 overlay bubble, P13 shake + screenshot | Needs real Android (≥2 OEMs, e.g. Samsung + Xiaomi/Oppo), screen off/on, over a game, foreground service survival |
| P08 voice | Mic permission, STT language packs, offline behavior, audio+STT conflict |
| P15 widgets | Glance widget on launcher, WidgetKit unverifiable without Mac/iOS device |
| P16 offline outbox | Needs airplane-mode scenarios with queued uploads |
| P17 FCM push | Needs Firebase credentials + physical device |
| P10/P14 haptics, keyboard bar | Physical keyboards/IMEs vary |
**→ P20 (Device QA).**

## 2. Contradiction in the quick start
Status says scan the QR with **Expo Go**. Overlay (`SYSTEM_ALERT_WINDOW`), custom Kotlin module, widgets and FCM are native code and **do not run in Expo Go**. Testers need a **development build or preview APK** (`expo run:android` / EAS). Fix docs and scripts.

## 3. Dev-only configuration to harden
Blank Postgres password, hard-coded LAN IP in `.env`, check JWT secrets, CORS, seeded users (`OWNER`/`TESTER`), local Whisper resource usage on a small server.

## 4. Access model may not match the spec
Status shows roles `OWNER/TESTER` and "RBAC guards". Spec (`docs/10` of the original kit) calls for owner/admin/member/guest, private projects + project members, invitations, password reset, lockout, audit log, session-validated JWT, IDOR tests. The status file doesn't mention these. **→ P21 audits and fills gaps.**

## 5. Not covered
- Production deploy (Coolify, HTTPS, backups) — status only lists store steps
- Observability (error tracking, logs, uptime), DB backup/restore drill
- Mobile automated e2e (Maestro) — none listed
- Web app (this kit)
- iOS parity: overlay impossible; document fallback and don't promise it
- Play Store policy: foreground-service-type declarations, screen-capture justification, overlay permission review, Data Safety form, privacy policy URL. Recommend **internal testing track / direct APK** first, store later.
- Account deletion + data export (required by stores)
- Rate limits for uploads/transcription costs

## 6. Priority order
1. Baseline honesty + rename (P18)
2. Device QA on dev build (P20)  ← biggest risk
3. Access audit (P21)
4. Production deploy (P22)
5. UI migration (P19) in parallel
6. Web (W0–W6)
7. Store submission (after 1–5)
