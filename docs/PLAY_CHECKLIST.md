# Google Play Console Submission Checklist

**Product**: DoIt  
**Publisher**: Samyukt  
**Application ID**: `com.samyukt.doit`  
**Target Platform**: Android (Minimum SDK 26, Target SDK 34)  

Use this checklist to complete every required form, declaration, and asset submission in Google Play Console.

---

## 1. Store Listing Metadata

| Field | Value / Guidance | Status |
|---|---|---|
| **App Name** | `DoIt – Tasks & Bug Capture` | Done |
| **Short Description** (≤ 80 chars) | `Add tasks by voice. Shake to report bugs with screenshots. By Samyukt.` | Done |
| **Full Description** | See text block below | Done |
| **Default Language** | English (United States) — `en-US` | Done |
| **Category** | Productivity | Done |
| **Tags** | Task Manager, Productivity, Developer Tools, Bug Tracking | Done |
| **Contact Email** | `support@samyukt.com` | Needs Human |
| **Website** | `https://samyukt.com` | Needs Human |

### Full Description Text to Copy/Paste:
```
DoIt is the fastest way to capture tasks and report mobile bugs without interrupting your flow. Designed by Samyukt for operators, engineers, and testers.

KEY CAPABILITIES:
• Instant Floating Bubble: Tap the floating trigger from any app or game to capture bugs with pixel-perfect screenshots.
• Shake to Capture: Simply shake your phone to capture issues instantly.
• Voice Bug Notes: Speak your issue summary; audio and transcript are automatically attached.
• Offline-First Engine: Capture bugs and organize tasks offline with automatic syncing.
• High-Fidelity Dark Mode: Engineered with a focused, low-fatigue dark interface inspired by modern engineering tools.
• Multi-Workspace Support: Organize personal tasks and team workspaces with seamless switching.

Built with security and privacy by Samyukt.
```

---

## 2. Graphics Assets Checklist

| Asset | Specifications | Status |
|---|---|---|
| **App Icon** | 512 × 512 px, 32-bit PNG, max 1024 KB (`assets/icon.png`) | Done |
| **Feature Graphic** | 1024 × 500 px, JPG or PNG (no transparency) | Needs Human (Design export) |
| **Phone Screenshots** | Minimum 2 screenshots, 16:9 or 9:16 aspect ratio, min 1080px (Dark theme required) | Done (Captured from device) |
| **7-inch / 10-inch Tablet Screenshots** | Optional for phones-first release | Optional |

---

## 3. Privacy Policy & Account Deletion

| Requirement | Value / Text to Enter | Status |
|---|---|---|
| **Privacy Policy URL** | `https://samyukt.com/privacy` (Public web page detailing screenshot and audio storage policies) | Needs Human (Host URL) |
| **In-App Account Deletion** | Settings -> Account -> Sign Out / Delete Account | Done |
| **Web Account Deletion URL** | `https://samyukt.com/account/delete` | Needs Human (Host URL) |

---

## 4. Data Safety Form Responses

| Category | Declaration Details |
|---|---|
| **Data Collection** | Yes, the app collects user data for core functionality. |
| **User Account Info** | Name, Email address (for authentication and multi-device sync). |
| **User Generated Content** | Photos/Screenshots (user-initiated bug attachments), Audio recordings (voice notes). |
| **Device or other IDs** | Device model, OS version, display metrics (attached to bug reports for developer triage). |
| **Data Transfer & Encryption** | All data is encrypted in transit using HTTPS / TLS 1.3. |
| **Data Deletion Policy** | Users can request complete deletion of their account, tasks, and uploaded media. |

---

## 5. Sensitive Permissions & Foreground Service Justifications

Google Play enforces strict justification policies for `SYSTEM_ALERT_WINDOW` (display over other apps), MediaProjection, and Foreground Services (`specialUse`):

### 5.1 Permission Justification: Display Over Other Apps (`SYSTEM_ALERT_WINDOW`)
> **Declaration Text**:  
> *"DoIt provides an on-screen floating trigger widget that enables testers, QA engineers, and users to report visual bugs, UX glitches, and action items directly while using third-party apps or test builds without switching apps. The overlay only draws an interactive button and dismissible quick capture sheet when triggered by the user."*

### 5.2 Foreground Service Type: `mediaProjection`
> **Declaration Text**:  
> *"Required to allow the user to initiate a single-frame screenshot of the current screen context when tapping the floating capture widget or shaking the device. Capture is strictly user-initiated following standard Android system consent."*

### 5.3 Foreground Service Type: `specialUse`
> **Subtype Declaration** (in Manifest):  
> `android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE = "Floating bug report capture bubble and screen capture overlay"`  
> **Declaration Text**:  
> *"Maintains the low-latency background state for the floating bug reporting widget so it is available when navigating across different applications. It displays a persistent notification giving the user full visibility and 1-tap control to stop the service anytime."*

### 5.4 Screen Recording Script for Google Play Reviewers (30-second Demo Video):
1. **0:00 - 0:05**: Open DoIt -> navigate to Settings -> tap "Start Bubble". Show Android system permission dialog granting "Display over other apps".
2. **0:05 - 0:12**: Show the persistent notification in notification shade confirming background service status.
3. **0:12 - 0:20**: Open Chrome or another app -> tap the floating DoIt bubble -> show Android MediaProjection consent dialog -> tap "Start now".
4. **0:20 - 0:30**: Quick Capture sheet opens immediately with the screenshot attached -> speak or type title -> tap Save -> show bug appearing in DoIt.

---

## 6. Build & Release Commands

To produce production builds:

```bash
# 1. Tester Preview APK (Internal distribution via direct download or EAS)
pnpm mobile:apk

# 2. Production Android App Bundle (AAB for Google Play Console)
pnpm mobile:aab
```

