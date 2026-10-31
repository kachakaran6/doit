# 04 — Publish to Google Play

> Google's rules change. **Re-check every requirement in the official Play Console Help/policy pages before each step.** Items marked (verify) are ones I can't guarantee are current.

## 0. Decide the path
1. **Now**: share the **preview APK** with testers (no Play needed).
2. **Next**: Play **internal testing** (instant, up to ~100 testers by email) to test the real Play-installed build.
3. **Then**: **closed testing** → **production**. New personal developer accounts may need a minimum number of testers for a minimum number of days in closed testing before production access (verify current numbers). Organization accounts may differ (verify).
4. Overlay + screen capture apps get extra review. Keep **direct APK distribution** as your fallback for the team.

## 1. Developer account
- Pay the one-time registration fee, verify identity. Publisher name: **Samyukt** (an organization account needs a D-U-N-S number — verify). Use a company email.
- Create the app: name "DoIt – Tasks & Bug Capture", default language, app (not game), free.
- Package name `com.samyukt.doit` is permanent once uploaded.

## 2. Build the release AAB
```bash
cd apps/mobile
eas build -p android --profile production     # app-bundle (AAB), autoIncrement versionCode
```
- Use **Play App Signing** (Play holds the app signing key; you keep an **upload key**). Back up the upload keystore in two places (password manager + offline).
- Production `EXPO_PUBLIC_API_URL` = your production HTTPS API.
- Confirm target SDK/API level meets current Play requirements (Expo SDK usually handles; verify).
- Verify the release manifest: `aapt dump permissions` / Play Console "App bundle explorer". Remove permissions you don't truly need.

## 3. Upload to Internal testing
Play Console → Testing → Internal testing → create release → upload AAB (or `eas submit -p android` with a Google service-account key) → add testers (emails) → share the opt-in link → install from Play → run the real-world test plan again (Play-installed build behaves differently from sideloaded in places).

## 4. Complete App content (blocks production until done)
- [ ] **Privacy policy URL** (public page; names Samyukt; covers screenshots, audio, transcription providers, device info, deletion)
- [ ] **Data safety** form — declare: account info, user-generated content (screenshots, audio, text), device info, diagnostics; encrypted in transit; deletion available
- [ ] **Account deletion**: in-app path + web URL
- [ ] App access: provide a **test login** (demo account) for reviewers
- [ ] Ads: none · Target audience: adults (18+) · Content rating questionnaire
- [ ] **Permissions declarations & foreground service types**: explain overlay (bug-reporting bubble), screen capture (user-initiated screenshot), microphone (voice bug notes). Provide a **short screen-recording video** showing the feature and the permission flow (Play often asks)
- [ ] Remove/justify sensitive permissions (e.g. Usage Access)
- [ ] Store listing: short description (≤80 chars), full description, icon 512×512, feature graphic 1024×500, ≥ 2 phone screenshots (use dark UI)
- [ ] Contact email, website

Suggested short description: *"Add tasks by voice. Shake to report bugs with screenshots. By Samyukt."*

## 5. Closed testing → Production
- Run closed test with real testers; keep them for the required period (verify).
- Apply for production access if Play asks.
- Production release → **staged rollout 5% → 20% → 50% → 100%**, watching crash-free rate and reviews.
- Keep Sentry + Uptime Kuma open during rollout.

## 6. After launch
- Respond to reviews; ship fixes via staged rollouts; monthly dependency/security updates; renew policies if Play asks for updated declarations.
- Back up: upload keystore, Firebase config, Play service-account key, `.env.production` (in a password manager, not git).

## If review rejects the overlay/screen-capture
1. Read the rejection reason carefully; fix the disclosure/declaration/video first.
2. If still blocked: publish a **Play-safe variant** (no overlay/MediaProjection; in-app capture only) and distribute the full-featured APK directly to your team.

## Tester distribution without Play (always available)
Host the preview APK link (EAS) or put the APK on your own server behind login. Include a one-page `TESTER_GUIDE.md` (install, permissions wizard, OEM battery settings, how to report a bug).
