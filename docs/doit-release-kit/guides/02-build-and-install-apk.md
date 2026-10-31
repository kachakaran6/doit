# 02 — Build & install a real APK (no Expo Go)

**Prerequisite:** backend live on HTTPS (guide 01), e.g. `https://staging-api.example.com/api/v1`. Phones then work anywhere, no USB/LAN tricks.

## Option A — EAS Build (cloud, easiest)
1. One-time:
   ```bash
   npm i -g eas-cli
   eas login
   cd apps/mobile
   eas build:configure        # creates/updates eas.json (use templates/eas.json as reference)
   ```
2. Put your API URL in the `preview` profile `env` (`EXPO_PUBLIC_API_URL=https://staging-api.example.com/api/v1`).
3. Build the tester APK:
   ```bash
   eas build -p android --profile preview
   ```
   `buildType: "apk"` makes an installable APK (not an AAB). First build asks to generate a keystore: **say yes** and later run `eas credentials` to **download a backup** of it.
4. When finished you get a link + QR. Open on the phone → download → install ("Install unknown apps" must be allowed for your browser/Files app).
5. Share the same link with your testers (internal distribution). Each new build = new link.

Free EAS plans have build queues/monthly limits; check your plan if builds wait long.

## Option B — Local build (free, fast on your PC, needs Android SDK + JDK)
```bash
cd apps/mobile
npx expo prebuild --platform android --clean      # generates /android from your config plugins
npx expo run:android --variant release            # builds + installs on USB-connected phone (debug-key signed)
```
To get a shareable APK file:
```bash
cd android && ./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```
For sideload testing the default signing is fine. For Play, use EAS/your own upload keystore (guide 04).
Never hand-edit `android/`; change config plugins and re-run prebuild.

## Option C — Development build (for developers, hot reload)
```bash
eas build -p android --profile development     # or: npx expo run:android
pnpm --filter @doit/mobile start --dev-client
```
Needs the API reachable (`adb reverse tcp:3000 tcp:3000` + `http://localhost:3000/api/v1`, or your staging HTTPS URL). Use this for coding, use **preview APK** for real-scenario testing.

## Important settings so the APK works
- **HTTPS API only** for preview/production. Android release builds block plain `http://` unless you allow cleartext (dev only).
- `EXPO_PUBLIC_*` values are **baked in at build time** → changing the API URL means a new build.
- Firebase: add `google-services.json` (EAS secret/file) if you use push; otherwise push is `UNVERIFIED`.
- Android package must be `com.samyukt.doit` (never change after publishing).
- Increase `versionCode` every build (EAS `autoIncrement` handles it for production).

## Install & first-run on the tester phone
1. Install APK → open → register/login.
2. Settings → **Bug Capture** → run the wizard and grant, in order: Display over other apps · Notifications · Microphone · Screen capture consent (system dialog) · Battery "Unrestricted" · (optional) Usage access.
3. Start the bubble. Confirm the persistent notification appears.

## OEM settings that decide whether the bubble survives
| Brand | Do this |
|---|---|
| Xiaomi / Redmi / Poco | Settings → Apps → DoIt → **Autostart ON**, Battery saver **No restrictions**, lock app in Recents |
| Oppo / Realme / OnePlus | App → Battery → **Allow background activity**, enable **Auto launch** |
| Vivo / iQOO | Settings → Battery → Background power consumption → **Allow**, enable Autostart |
| Samsung | Battery → Background usage limits → remove DoIt from "Sleeping/Deep sleeping apps", set **Unrestricted** |
| Pixel / stock | Battery → **Unrestricted** |

## Updating testers
New build → new link. Or use EAS Update for JS-only fixes (needs expo-updates configured; native changes still need a new APK).

## Common problems
| Problem | Fix |
|---|---|
| "App not installed" | Old build signed with a different key → uninstall first, or reuse the same keystore |
| Bubble not showing | Overlay permission not granted / app killed by OEM battery manager |
| Black screenshot | Target app uses secure flag (banking, some games/DRM) — expected; the app should say so |
| "Request failed" | API URL wrong/HTTP/server down → Settings → Developer → health check |
| Shake triggers too much/little | Settings → Bug Capture → sensitivity |
