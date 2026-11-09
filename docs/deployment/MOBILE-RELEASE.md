# DoIt — Mobile Release & Google Play Store Guide

This guide details the release pipeline, EAS Build commands, and Google Play Store compliance procedures for the DoIt React Native application.

---

## 1. Build Profiles & EAS Configuration

The mobile build pipeline is managed via **Expo Application Services (EAS)** and configured in `apps/mobile/eas.json`.

| Profile | Target Output | Signing | Intended Audience |
|---|---|---|---|
| **`preview`** | `.apk` | Internal / Debug Keystore | Internal testing, QA sideloading, team feedback |
| **`production`** | `.aab` | Google Play Upload Keystore | Google Play Store closed testing & production tracks |

---

## 2. Generating Release Artifacts

Navigate to `apps/mobile/` or run from repository root:

### A. Preview APK Build (For Testers)
```bash
# Via EAS Cloud
pnpm --filter @doit/mobile build:apk

# Local Offline Build (requires Android SDK & Java 17)
pnpm --filter @doit/mobile build:apk:local
```

### B. Google Play Production AAB Build
```bash
pnpm --filter @doit/mobile build:aab
```

---

## 3. Google Play Policy Compliance & Prominent Disclosures

DoIt utilizes advanced native capabilities on Android. Google Play Store requires strict declarations and prominent disclosures for these capabilities:

### A. Android Accessibility Service (`BIND_ACCESSIBILITY_SERVICE`)
* **Purpose**: Used **exclusively** to capture a non-intrusive screenshot when the user taps the floating overlay bubble or triggers the shake-to-report feature.
* **Data Handling**:
  * DoIt **does NOT** collect keystrokes, passwords, private chats, or financial details.
  * Screenshots are stored locally and only transmitted when the user explicitly clicks "Submit Report".
* **Prominent Disclosure**:
  * An in-app prominent disclosure modal is presented before the user is directed to Android Settings to enable the service.
  * An official disclosure walkthrough video is archived in `playstore-assets/accessibility_disclosure.mp4` for Google Play review submission.

### B. Foreground Services (`FOREGROUND_SERVICE_MEDIA_PROJECTION` & `FOREGROUND_SERVICE_MICROPHONE`)
* **Purpose**:
  * `MEDIA_PROJECTION`: Fallback screen capture on devices where accessibility is disabled.
  * `MICROPHONE`: Audio recording for voice notes attached to tasks and bugs.
* **User Control**:
  * A persistent foreground notification is visible while recording or screen capture is active, allowing the user to cancel at any time.

---

## 4. Google Play Console Upload Checklist

1. **Version Code & Semantic Version**:
   * Bump `version` and `android.versionCode` in `apps/mobile/app.json`.
2. **Build Production AAB**:
   * Execute `pnpm --filter @doit/mobile build:aab`.
3. **Upload to Closed Testing Track**:
   * Go to **Google Play Console** -> **Testing** -> **Closed testing**.
   * Upload the resulting `.aab` bundle.
4. **Data Safety Form**:
   * Declare collected data types: Photos and Videos (user-uploaded screenshots), Audio files (voice recordings), Device or other identifiers (device telemetry for bug resolution).
   * Confirm that data is encrypted in transit (TLS 1.3) and users can request account & data deletion in app settings.
