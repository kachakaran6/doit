# DoIt v0.1.0 — Release Build 3 (`0.1.0+3`)

Production-grade release of DoIt featuring a complete Quick Capture redesign, full backend integration with the live deployment at `https://doit.samyukt.pro/api/v1`, Xiaomi/MIUI overlay permission detection & deep-linking resolution, and resolution of the sticky note HTTP 500 error.

---

## What's New & Fixed in Build 3

### 1. Complete Quick Capture Form Redesign
- **Unified Form Architecture**: All four capture modalities (**Task**, **Bug**, **Sticky**, and **Voice**) now share a unified design token system, responsive pill selector, header kicker (`activeProject.key • name`), and touch targets.
- **Task Capture**: Includes quick due-date shortcuts (*Today*, *Tomorrow*, *Next Week*, *Clear*) and visual priority selector (*Low*, *Medium*, *High*, *Urgent*).
- **Bug Reporting**: Multi-line reproduction steps, severity selector (*Critical*, *Major*, *Minor*, *Trivial*), and automatic device diagnostics badge.
- **Sticky Notes**: Full multi-line text input, 5 brand color accent selectors (*Amber*, *Indigo*, *Teal*, *Rose*, *Violet*), and "Pin to Top" toggle switch.
- **Voice Capture**: Native audio recording using `expo-av`, live duration timer (`mm:ss`), audio playback preview, multi-lingual support (*en-IN*, *hi-IN*, *auto*), and direct upload to `/voice`.

### 2. Xiaomi / MIUI / HyperOS Overlay Permission Resolution
- **Root Cause Identified**: Xiaomi splits background and overlay permissions between standard Android `SYSTEM_ALERT_WINDOW` (`Settings.canDrawOverlays`) and MIUI's custom AppOps permissions under "Other permissions" (`OP_BACKGROUND_START_ACTIVITY` / `PermissionsEditorActivity`). Users enabling "Display pop-up windows" in MIUI were still blocked because Android's system overlay toggle was untouched or restricted.
- **Native Dual AppOps Check**: `OverlayServiceModule.kt` checks both `Settings.canDrawOverlays(context)` and `AppOpsManager.checkOpNoThrow(OP_SYSTEM_ALERT_WINDOW, ...)` for seamless detection.
- **Multi-Action Guidance**: In-app dialogs and the updated **Quick Capture Hardware Guide** provide dedicated one-tap deep links for:
  1. Standard Android **"Display Over Other Apps"** toggle
  2. Xiaomi **"MIUI Other Permissions"** (for background pop-up windows)
  3. **"App Info & Security"** (to unlock Android 13+ "Restricted Settings" via 3-dot ⋮ menu)

### 3. Sticky Note HTTP 500 Bug Fix
- **Root Cause Identified**: Mobile clients with unselected active project defaulted to `projectId: 'default'`. Passing `'default'` into Prisma's PostgreSQL query crashed with `invalid input syntax for type uuid: "default"`.
- **Backend Fix**: `stickies.service.ts` now mirrors `tasks.service.ts` with automatic fallback to the user's primary workspace project when `projectId === 'default'`.
- **DTO Hardening**: `stickies.dto.ts` now handles case-insensitive accents (`AMBER`, `amber`) and maps `isPinned` -> `pinned`.
- **Frontend Store Fix**: `useWorkspaceStore` automatically initializes `activeProject` to the first available project in the workspace.

### 4. Dynamic Android Status Bar
- Dynamic light/dark theme synchronization using `StatusBar.setBackgroundColor` and `StatusBar.setBarStyle`.
- Set `userInterfaceStyle: 'automatic'` in `app.config.ts` so Android cleanly transitions without hardcoded dark status bars in light mode.

---

## Verification & Artifacts
- **Package Name**: `com.samyukt.doit`
- **Application Version**: `0.1.0`
- **Version Code**: `3`
- **EAS Build Target**: Android Production APK (`internal` distribution)
- **Production API**: `https://doit.samyukt.pro/api/v1`
