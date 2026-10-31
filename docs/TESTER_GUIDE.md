# DoIt Tester Guide (Android Preview APK)

Welcome to the internal testing program for **DoIt** (Company: **Samyukt**, Package ID: `com.samyukt.doit`).

This guide walks you through installing the native preview APK, configuring permissions so the floating capture bubble survives background OEM management, and testing real bug report scenarios.

---

## 1. Downloading & Installing the APK

1. Download the latest preview build link provided by the release team (or download `app-preview.apk`).
2. When your browser downloads the APK, tap **Open**.
3. If Android prompts **"For your security, your phone is not allowed to install unknown apps from this source"**:
   - Tap **Settings**.
   - Toggle **Allow from this source** to **ON**.
   - Tap **Back** and select **Install**.
4. Once installed, launch **DoIt**.

> [!NOTE]
> If you already have an older build installed that was signed with a different key, Android will report *"App not installed"*. Please uninstall the old build first, then install the new APK.

---

## 2. First Run & Permission Setup

To enable instant bug reporting from anywhere (even when other apps or games are running), DoIt requires specific Android capabilities:

1. **Sign In**:
   - Sign in using your tester credentials or register a new tester account.
2. **Open Permission Setup**:
   - Tap your avatar in the top right -> **All Settings & Capabilities** (or open the floating capture toggle).
3. **Grant Permissions in Order**:
   - **Display over other apps (SYSTEM_ALERT_WINDOW)**: Tap *Start Bubble* -> when prompted, grant "Display over other apps".
   - **Screen Recording / Capture (MediaProjection)**: When taking your first screenshot, Android displays a system consent dialog *"Start recording or casting with DoIt?"*. Tap **Start now**.
   - **Microphone (RECORD_AUDIO)**: Tap **Allow while using the app** for voice bug notes.
   - **Notifications (POST_NOTIFICATIONS)**: Tap **Allow** so the persistent background service indicator is active.

---

## 3. OEM Battery Manager Hardening

Different Android manufacturers aggressively kill background services and floating bubbles unless battery restrictions are lifted. Find your phone manufacturer below and apply these steps:

| Brand | Settings to Configure |
|---|---|
| **Xiaomi / Redmi / Poco (MIUI / HyperOS)** | 1. Settings -> Apps -> Manage apps -> DoIt -> **Autostart = ON**.<br>2. Battery saver -> Select **No restrictions**.<br>3. Open app switcher (Recents), long press DoIt -> tap the **Lock** icon. |
| **OnePlus / Oppo / Realme (OxygenOS / ColorOS)** | 1. Long press DoIt icon -> App info -> Battery -> Select **Allow background activity**.<br>2. App info -> Auto-launch -> Toggle **Allow auto-launch** to ON. |
| **Samsung (One UI)** | 1. Settings -> Battery -> Background usage limits -> Ensure DoIt is NOT in "Sleeping apps" or "Deep sleeping apps".<br>2. App info -> Battery -> Set to **Unrestricted**. |
| **Vivo / iQOO (Funtouch OS / OriginOS)** | 1. Settings -> Battery -> Background power consumption -> Select **Allow high background power consumption**.<br>2. Settings -> Apps -> Autostart -> Enable DoIt. |
| **Google Pixel / Motorola / Stock Android** | 1. App info -> App battery usage -> Select **Unrestricted**. |

---

## 4. How to Report a Bug in 5 Seconds

### Method A: Floating Bubble (Fastest)
1. Navigate to any app (Chrome, Instagram, your company app, or a game).
2. Tap the floating **DoIt bubble** on the edge of your screen.
3. The Quick Capture sheet appears immediately with the background screenshot pre-attached (the bubble itself is automatically omitted from the capture).
4. Tap the microphone icon and speak your bug summary (e.g., *"Cart checkout button clipped below fold"*), or type the title.
5. Tap **Save Bug**.

### Method B: Shake to Capture
1. Shake your phone firmly (three quick reversal motions).
2. The device vibrates, takes a snapshot of your screen, and presents the Quick Capture modal.

### Method C: Offline Capture (Airplane Mode)
1. Turn on Airplane Mode.
2. Trigger a capture and tap Save.
3. The report is saved into the local encrypted **Outbox** with an offline badge.
4. Turn Airplane Mode off: DoIt automatically syncs the bug report to the server in the background without duplicate submissions.

---

## 5. Known Limitations

- **DRM & Banking Screens (FLAG_SECURE)**: Android blocks screenshots inside banking apps and protected streaming apps (Netflix/Prime). If triggered, a secure notice is displayed.
- **Microphone First Use**: On initial capture, allow microphone permission so voice note recording is seamless.
- **Reporting Issues with DoIt Itself**: Dogfooding! If you encounter a bug or crash in DoIt, shake the phone and submit the report directly.

