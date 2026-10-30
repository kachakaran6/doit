# 10 — QA & Acceptance

Executed by prompt **P17b**. Fill every cell. Evidence = a screenshot, a log, or a recorded
number — not "looks fine".

---

## 1. Device matrix

| # | Device | OS | Why this device |
|---|---|---|---|
| 1 | Pixel 6a / 7a | Android 14 | baseline, clean OS |
| 2 | Redmi Note 12 (or similar) | Android 13 | MIUI — aggressive background-kill behaviour |
| 3 | Samsung A54 | Android 14 | One UI — overlay + notification quirks |
| 4 | Any Android 11 device | Android 11 | oldest supported; scoped storage |
| 5 | iPhone 12/13 | iOS 17 | baseline |
| 6 | iPhone SE (2nd/3rd gen) | iOS 16/17 | small screen — layout stress |
| 7 | Tablet or large phone | either | layout at ≥600 dp width |

---

## 2. Functional test cases

### Auth
- [ ] Register → verify email (if enabled) → login
- [ ] Wrong password ×11 → rate limited
- [ ] Kill app → reopen → still logged in
- [ ] Revoke session from device B → device A logs out cleanly with a message
- [ ] Password reset email → new password works, old one doesn't

### Tasks
- [ ] Create with title only
- [ ] Create with every field
- [ ] Edit, reorder by drag, change status by drag on the board
- [ ] Complete → reopen
- [ ] Delete → confirm → undo toast restores it
- [ ] Checklist add/toggle/delete
- [ ] Filter by status + priority + label + assignee simultaneously
- [ ] Due date: today, tomorrow, picker, clear
- [ ] Overdue item shows the danger treatment

### Stickies
- [ ] Create → appears with rotation
- [ ] Recolour all 5 accents
- [ ] Pin → sorts first
- [ ] Convert to task → both linked
- [ ] Delete a converted sticky → task survives

### Capture (the core)
- [ ] Bubble tap → sheet in <500 ms
- [ ] Voice record → transcript appears → edit → save
- [ ] Screenshot attach from the bubble
- [ ] Full bug: bubble → speak → screenshot → send, **timed** (10 trials, median)
- [ ] Shake during a session → screenshot + recording starts
- [ ] End session → summary → share markdown report
- [ ] Widget quick-add with the app closed
- [ ] Share Extension (iOS) from Photos → composer
- [ ] Deny overlay permission → degraded path, no crash
- [ ] Deny microphone → voice disabled with an explanation, text still works

### Offline
- [ ] Airplane mode: create task, bug with voice, sticky → all pending
- [ ] Kill app → reopen → still pending
- [ ] Reconnect → all sync exactly once (check DB counts)
- [ ] 50-item outbox flush on 4G
- [ ] Conflict banner on a concurrent edit

### Theming
- [ ] Light / dark / system, switch live
- [ ] All 5 accents in both themes
- [ ] Cold start in dark → no white flash
- [ ] Contrast spot-check with a colour picker on 3 screens

### Accessibility
- [ ] TalkBack: complete capture flow in ≤4 actions
- [ ] VoiceOver: same
- [ ] Font scale 130% → no truncated primary actions
- [ ] All icon buttons announce a label

### Reliability
- [ ] 30-minute session, no crash
- [ ] Force-stop during an upload → no corrupt file, retry works
- [ ] Rotation during capture → no data loss
- [ ] Low battery mode → overlay still works or explains why not

---

## 3. Performance benchmarks (record numbers)

| Metric | Target | Measured |
|---|---|---|
| Cold start (Pixel 6a, release) | <2.5 s | |
| Cold start (Redmi Note 12) | <3.5 s | |
| Bubble tap → sheet visible | <500 ms | |
| Capture → submit (median of 10) | <5 s | |
| Task list scroll | 60 fps | |
| Memory after 20 push/pop | <200 MB, no growth | |
| APK size | <40 MB | |
| Idle battery with bubble on | <2%/h | |

---

## 4. Security checklist

- [ ] No secrets in the repo (`grep -rE '(sk_|AKIA|BEGIN PRIVATE)' .` → empty)
- [ ] Tokens in Keychain/Keystore only
- [ ] HTTPS enforced in release; cleartext disabled in the manifest
- [ ] Every endpoint verified against the role matrix with a TESTER and a VIEWER token
- [ ] Rate limits verified on auth and mutations
- [ ] No PII in logs
- [ ] `allowBackup=false` or an explicit backup rules file
- [ ] Debug build not shipped; `android:debuggable` false in release

---

## 5. Release readiness

- [ ] Version + build number set
- [ ] ProGuard/R8 rules cover the native modules (overlay, widget, shake, audio)
- [ ] iOS `PrivacyInfo.xcprivacy` declares: file timestamp, disk space, user defaults,
      and any other required-reason API used
- [ ] Store listing: title, short description, full description, 8 screenshots per platform,
      feature graphic, permission justifications (see `12-NATIVE-CAPABILITIES.md`)
- [ ] Data safety form / privacy nutrition label completed honestly
- [ ] Rollback plan written (previous build retained, server backward-compatible for one version)

---

## 6. Sign-off

| Area | Owner | Result | Evidence link |
|---|---|---|---|
| Functional | | | |
| Capture speed | | | |
| Offline | | | |
| Accessibility | | | |
| Security | | | |
| Performance | | | |
