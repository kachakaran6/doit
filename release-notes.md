# DoIt v0.1.0 — Release Build 3 (v0.1.0+3)

This release (`v0.1.0+3`) resolves two critical Android native features:
1. **Floating Quick Capture Bubble**: Complete native Android module injection, verified overlay permission detection (`Settings.canDrawOverlays`), Xiaomi/MIUI/HyperOS permission routing, and a 56dp draggable floating bubble overlay running system-wide.
2. **Shake-to-Add Motion Detection**: Full hardware accelerometer integration, corrected directional reversal vector math, foreground lifecycle management, and an interactive diagnostic tester in Settings.
3. **Cloud Backend Target**: Live production backend connected to `https://doit.samyukt.pro/api/v1`.

---

## Technical Fixes & Root Cause Resolutions

### 🎯 Critical Issue A: Floating Quick Capture Bubble
- **Native Module Injection**: Wrote and wired `OverlayPackage.kt`, `OverlayServiceModule.kt`, and `BubbleService.kt` via `@expo/config-plugins` (`withDoItAndroidRelease.js`). `NativeModules.OverlayServiceModule` is now compiled and registered in `MainApplication.kt`.
- **Permission Detection & Routing**:
  - Replaced generic fallback with native `Settings.canDrawOverlays(context)`.
  - Direct intent routing via `Settings.ACTION_MANAGE_OVERLAY_PERMISSION` (`package:com.samyukt.doit`).
  - Dedicated Xiaomi/MIUI/HyperOS fallback using `miui.intent.action.APP_PERM_EDITOR` targeting `com.miui.securitycenter`.
- **System-Wide Floating Bubble**:
  - 56dp circular overlay (`WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`) with DoIt branding and drop shadow.
  - Fluid drag handling, boundary clamping, and screen edge snapping.
  - Foreground service declaration with Android 14+ `specialUse` type and ongoing notification controls.

### 📳 Critical Issue B: Shake-to-Add Motion Detection
- **Hardware Sensor Subscription**: Installed and integrated `expo-sensors` (`Accelerometer`) sampling at 20Hz (50ms interval).
- **Directional Reversal Bug Fix**: Fixed a critical mathematical bug where Euclidean scalar norm was used for sign checks (which was always positive). Implemented dominant motion axis sign tracking ($\Delta X, \Delta Y, \Delta Z$) to reliably detect alternating wrist flicks.
- **Global Foreground Lifecycle**: `ShakeCaptureProvider` listens while the app is in the foreground and automatically pauses when backgrounded, preserving battery life and complying with Android 14 sensor policies.
- **Interactive Shake Diagnostic Modal**: Added "Test Shake Sensor" action in Settings showing live motion delta gauge, threshold progress bar, reversal counter, and haptic confirmation without creating tasks/bugs.
- **Configurable Sensitivity**:
  - High: 10.0 m/s² (gentle wrist flick)
  - Medium: 14.5 m/s² (standard deliberate flick)
  - Low: 21.0 m/s² (firm shake)
  - Cooldown: 1200ms debounce preventing duplicate triggers.

### 🌐 Cloud Backend Integration
- Production and preview builds target `https://doit.samyukt.pro/api/v1`.
- Local development continues to use local server/database (`http://localhost:3000/api/v1` or local Wi-Fi IP).

---

## 📦 Release Assets & Verification

| Asset | Type | Description |
| :--- | :--- | :--- |
| `DoIt-v0.1.0-build3.apk` | Android APK | Standalone production APK (`com.samyukt.doit`, version `0.1.0`, `versionCode: 3`) |
| `DoIt-v0.1.0-build3.apk.sha256` | Checksum | Cryptographic SHA-256 verification hash |
