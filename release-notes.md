# DoIt v0.1.0 — Release Build 2 (v0.1.0+2)

This release (`v0.1.0+2`) introduces comprehensive in-app guidance, permission monitoring, and hardware controls for DoIt's native capture tools: the **Floating Overlay Bubble** and **Shake-to-Report Bug** motion sensor.

---

## What's New in v0.1.0+2

### 🎯 Floating Quick Capture Bubble Guide & Status Monitoring
- **Real-Time Permission Banner**: Directly displays whether Android's "Display over other apps" (`SYSTEM_ALERT_WINDOW`) permission is granted.
- **One-Tap System Settings Shortcut**: Opens Android's native overlay permission manager for DoIt without navigating through nested device menus.
- **Step-by-Step Instructions**:
  - How to enable and launch the background bubble service.
  - How to drag the bubble across screen edges and dock it smoothly.
  - How to tap the bubble from any running application (browser, chat, email) to immediately log tasks, bugs, or voice notes.
  - How to dismiss or hide the bubble when not in use.
- **OEM Background Optimization Guide**: Dedicated troubleshooting steps for Samsung One UI, Xiaomi HyperOS/MIUI, and OnePlus OxygenOS to prevent aggressive background process termination.

### 📳 Shake-to-Report Sensor Controls
- **Interactive Sensitivity Tuning**: Toggle between `Low`, `Medium`, and `High` accelerometer thresholds.
- **Motion Sensor Explanation**: High-pass gravity filtering requiring 3 direction reversals within 400ms to eliminate false positives from walking or pocket movements.
- **In-App Test Trigger**: One-tap "Test Quick Capture" button inside Settings to preview the capture flow immediately.

### 🌐 Cloud API Connectivity
- Added **Production (Cloud)** server endpoint chip (`https://doit-api.137.23.49.73.sslip.io/api/v1`) directly into the Settings connection manager with live ping diagnostics.

---

## 📦 Release Assets & Verification

| Asset | Type | Description |
| :--- | :--- | :--- |
| `DoIt-v0.1.0-build2.apk` | Android APK | Standalone production APK (`com.samyukt.doit`, version `0.1.0`, `versionCode: 2`) |
| `DoIt-v0.1.0-build2.apk.sha256` | Checksum | Cryptographic SHA-256 verification hash |

---

## 🚀 Installation & Verification

1. Download `DoIt-v0.1.0-build2.apk` on your Android device (Android 9.0+).
2. Allow installation from unknown sources if prompted.
3. Verify integrity:
   ```powershell
   Get-FileHash -Algorithm SHA256 .\DoIt-v0.1.0-build2.apk
   ```
