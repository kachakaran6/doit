# 10 — Launch Checklist (the part that isn't code)

Print this. Tick it. Nothing here is optional.

---

## 1. Accounts and identity

- [ ] Google Play Console account (₹1,850 one-time) — verified, with a payments profile
- [ ] Apple Developer Program (₹8,900/year) — enrolled as an organisation if possible
      (individual accounts show your personal name as the seller)
- [ ] `applicationId` locked: `com.samyukt.doit` — **never changes after first upload**
- [ ] App name "Samyukt DoIt" (Play: 30 chars max; App Store: 30 chars max) — check availability
- [ ] Support email + website URL (both stores require them)

## 2. Signing and builds

- [ ] Android upload keystore generated, backed up in **two** places, password in a manager
      (losing it means you cannot update the app)
- [ ] `eas.json` with `development`, `preview`, `production` profiles
- [ ] iOS distribution certificate + provisioning profile via EAS
- [ ] R8/ProGuard rules cover: overlay service, widget provider, MediaProjection service,
      audio recorder, socket.io
- [ ] `android:allowBackup="false"` or an explicit backup rules XML
- [ ] Release build has no dev menu, no mock data, no `console.log`
- [ ] `PrivacyInfo.xcprivacy` present with the required-reason API declarations
- [ ] Version code / build number auto-incrementing in CI

## 3. Store listing

- [ ] Short description (Play, 80 chars) — lead with the capture promise, not "task manager"
- [ ] Full description — first paragraph answers "why would a tester install this?"
- [ ] 8 screenshots per platform (phone; plus tablet for Play)
- [ ] Feature graphic 1024×500 (Play)
- [ ] App icon 512×512 (Play) and 1024×1024 (App Store), no transparency, no rounded corners
- [ ] Promo video (optional but doubles conversion for a tool like this)
- [ ] Category: Productivity (Play) / Business (App Store)
- [ ] Content rating questionnaire
- [ ] Age rating (App Store)

## 4. Permissions — the review risk

Play will manually review the overlay + foreground service. Have these ready, copy them from
`12-NATIVE-CAPABILITIES.md` of the Phase 1 kit:

- [ ] Special app access declaration for `SYSTEM_ALERT_WINDOW`, with a screen recording showing
      the bubble in use
- [ ] Foreground service declaration: type `specialUse` + subtype explanation
- [ ] Usage access declaration (optional permission — say it is optional)
- [ ] Data safety form completed honestly: audio (optional), photos (optional), device ids,
      app activity
- [ ] Privacy nutrition label (iOS) matching the data safety form exactly
- [ ] A one-minute Loom linked in the review notes showing the capture flow — reviewers
      approve faster when they can see the feature

## 5. Backend production

- [ ] Managed Postgres, 7-day PITR, automated daily backup, **restore tested and timed**
- [ ] Object storage + CDN for attachments, lifecycle rule for orphans
- [ ] Redis for BullMQ + rate limits
- [ ] TLS on `api.samyukt.com`, HSTS, TLS 1.2+ only
- [ ] Secrets in a manager (not `.env` on a server); rotation documented
- [ ] Migrations applied by CI on deploy, with a rollback path
- [ ] Rate limits and body-size limits configured
- [ ] `/health/ready` wired to the uptime monitor with an alert channel that reaches a human
- [ ] Log retention policy and PII scrubbing
- [ ] Load test: 200 concurrent users on the board endpoint, p95 < 400 ms

## 6. Legal (see L01)

- [ ] Privacy policy at `https://samyukt.com/privacy` — mentions audio recording, screenshots,
      device identifiers, sub-processors (hosting, AI provider, email)
- [ ] Terms of service at `https://samyukt.com/terms`
- [ ] Account deletion in-app **and** by email, completed within 30 days
- [ ] Data export (JSON) in-app
- [ ] India DPDP Act: notice + consent for the audio/screenshot capture, grievance officer
      named, breach notification process written
- [ ] Sub-processor list published
- [ ] If any EU/UK user is possible: GDPR lawful basis and DPA templates

## 7. Operational readiness

- [ ] Status page or at minimum a public `/health` you can point at
- [ ] On-call: who gets paged, and how (even if the answer is "me, on WhatsApp")
- [ ] Rollback: previous app build retained, server backward-compatible for one release
- [ ] Feature flags for the overlay, widgets and web (ship dark, enable gradually)
- [ ] Analytics events defined: app_open, task_created, bug_captured, capture_duration_ms,
      voice_used, sync_failed, session_started
- [ ] First-week review date scheduled

## 8. The pre-submission smoke test

Do this on a **clean device that has never had the app**, with a **fresh account**:

1. Install from the store link (internal testing track).
2. Sign up, verify email, land in a workspace.
3. Create a task. Create a sticky. Convert it to a task.
4. Enable the capture bubble. Grant the permissions as prompted.
5. Open another app. Tap the bubble. Speak a bug. Send.
6. Check the bug arrived with a screenshot and the correct app name.
7. Open the web app on a laptop, log in, find the same bug, triage it.
8. Delete the account. Confirm the data is gone.

If any step needs you to explain something, that step is not finished.
