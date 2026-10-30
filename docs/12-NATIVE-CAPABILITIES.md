# 12 — Native Capabilities, Permissions, Store Justifications

Every permission below must be (a) actually needed, (b) requested at the moment it makes sense,
(c) explained in one plain sentence before the OS dialog, and (d) justified in the store listing.

---

## 1. Android — `AndroidManifest.xml`

```xml
<!-- Core -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Voice capture -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Floating bubble + session -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<!-- Detecting the app under test (special access, not a runtime permission) -->
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
    tools:ignore="ProtectedPermissions" />

<!-- Shake -->
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />

<!-- Attachments -->
<uses-permission android:name="android.permission.CAMERA" />   <!-- only if in-app photo capture ships -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

Do **not** add: `QUERY_ALL_PACKAGES`, `READ_EXTERNAL_STORAGE` (deprecated on 13+),
`BIND_ACCESSIBILITY_SERVICE`, `READ_LOGS` (not grantable), `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`
without a guided settings screen.

Service declaration:

```xml
<service
    android:name=".overlay.BubbleService"
    android:exported="false"
    android:foregroundServiceType="specialUse|microphone|mediaProjection">
  <property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
      android:value="Floating bug-capture control for app testers" />
</service>
```

### Permission request order (Android)

| # | Permission | When | Pre-prompt copy |
|---|---|---|---|
| 1 | `POST_NOTIFICATIONS` | after the first task is created | "Samyukt needs to show you sync status and due reminders." |
| 2 | `RECORD_AUDIO` | first tap on the mic | "Samyukt records your voice so you can describe a bug instead of typing it." |
| 3 | `SYSTEM_ALERT_WINDOW` | user enables "Capture bubble" in Settings | "This lets Samyukt float a small button over other apps so you can report a bug without switching away." → then deep-link to `ACTION_MANAGE_OVERLAY_PERMISSION` |
| 4 | `PACKAGE_USAGE_STATS` | user starts their first Test Session | "So we can record which app you were testing. Optional — you can pick it manually." → `ACTION_USAGE_ACCESS_SETTINGS` |
| 5 | `MediaProjection` consent | Test Session start, once per session | "To attach a screenshot of what broke. Recording stops when the session ends." |
| 6 | `READ_MEDIA_IMAGES` | first attach-from-gallery | use the system photo picker instead — it needs **no** permission. Prefer it. |

---

## 2. iOS — `Info.plist`

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Samyukt records your voice so you can describe a bug instead of typing it.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Samyukt turns your spoken description into text so you can review it before saving.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>To attach a screenshot of the bug you found.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>To save a bug report image to your photos.</string>
<key>NSCameraUsageDescription</key>
<string>To photograph a device or screen when reporting a bug.</string>
<key>NSAppTransportSecurity</key>
<dict><key>NSAllowsArbitraryLoads</key><false/></dict>
```

App Group for widget sharing: `group.com.samyukt.app`.
Background modes: prefer **none**. If background audio recording is required, add `audio` and
accept the review scrutiny; otherwise record only in the foreground.

### iOS capability mapping (what replaces the bubble)

| Need | iOS mechanism | Setup |
|---|---|---|
| One-tap capture from anywhere | **Back Tap** (Accessibility → Touch → Back Tap → Double Tap → Samyukt shortcut) | document it in onboarding with a 3-step illustration |
| Capture from Control Center / Lock Screen | Control Center control + Lock Screen widget | WidgetKit + App Intents |
| Screenshot from another app | Share sheet → Samyukt Share Extension | `NSExtensionActivationSupportsImageWithMaxCount` |
| Quick add | WidgetKit `systemSmall` + App Intent | |
| Session status | Live Activity / Dynamic Island | ActivityKit |
| Voice from anywhere | "Hey Siri, log a bug" → App Intent | App Intents + Shortcuts |

---

## 3. Store justifications (copy-paste)

**Overlay permission (Play Console → App content → Special app access):**
> Samyukt is a bug-reporting tool for QA testers. The floating capture button lets a tester
> report an issue without leaving the app they are testing, which is the product's core
> function. The overlay shows a single small draggable button and a capture sheet; it does not
> read or interact with other apps' content.

**Foreground service (`FOREGROUND_SERVICE_SPECIAL_USE`):**
> The foreground service keeps the capture button available while the user tests another app,
> and hosts the active test session. It is always accompanied by a visible notification with a
> Stop action.

**MediaProjection / screen capture:**
> Used only during a test session explicitly started by the user, to attach a screenshot of the
> defect being reported. Capture stops when the session ends.

**Usage access:**
> Used only to record which application was under test at the moment a bug was captured, so the
> report is reproducible. Optional; the user can select the app manually instead.

**Microphone:**
> Core feature: testers speak a bug report instead of typing it. Audio is uploaded only to the
> user's own workspace.

**Data safety form:** collected — name, email, app activity (tasks/bugs), audio (optional),
photos (optional), device identifiers (for sessions). Encrypted in transit and at rest. Deletable
in-app via Settings → Delete account.

---

## 4. Permission state machine (shared, both platforms)

```
unknown → (user action) → requesting → granted
                                     → denied        (explain, offer retry)
                                     → permanentlyDenied (explain + open system settings)
```

Rules:
- Never request a permission on app launch.
- Never request two permissions in a row.
- After a permanent denial, the entry point stays visible but shows the explanation screen —
  never a dead button, never a repeated OS dialog.
- A settings screen section "Permissions" lists every capability with its live state and a
  deep link to the exact system page.

---

## 5. Native module inventory

| Module | Android | iOS | Fallback |
|---|---|---|---|
| `overlay` | `SYSTEM_ALERT_WINDOW` + FGS | — | hidden; use Back Tap / widget |
| `screenCapture` | `MediaProjection` | in-app `captureRef` | attach from gallery |
| `shake` | `SensorManager` | `CMMotionManager` | manual button |
| `widget` | Glance + AppWidgetProvider | WidgetKit | in-app quick add |
| `speech` | `SpeechRecognizer` | `SFSpeechRecognizer` | server-only transcription |
| `audio` | `MediaRecorder` | `AVAudioRecorder` | — (required) |
| `foregroundApp` | `UsageStatsManager` | — | user picks at session start |
| `haptics` | `Vibrator` | `UIImpactFeedbackGenerator` | silent no-op |
