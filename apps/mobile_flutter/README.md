# DoIt Mobile — Flutter Production Edition (`apps/mobile_flutter`)

High-performance, cross-platform mobile client for DoIt, migrated from React Native (Expo) to **Flutter 3.44 / Dart 3.12**.

---

## 🚀 Key Improvements Over React Native

| Metric / Feature | React Native (Expo 52) | Flutter Edition |
| :--- | :--- | :--- |
| **Runtime Performance** | JS Bridge / Hermes Bytecode | Ahead-of-Time (AOT) Machine Code (Smooth 60/120 FPS) |
| **UI Rendering Engine** | Native OEM View Wrapping | Skia / Impeller Hardware-Accelerated Canvas |
| **State Management** | Zustand + TanStack Query | Riverpod 2 (`NotifierProvider`, `AsyncNotifier`) |
| **Routing** | React Navigation 7 | GoRouter (Stateful Shell Indexed Stack) |
| **Networking** | Fetch / Axios | Dio with Mutex-Guarded JWT Silent Refresh & Retry |
| **Offline Resilience** | Custom Outbox Queue | OutboxManager + Idempotency-Key + Auto Network Flush |
| **Hardware Gestures** | Expo Sensors Accelerometer | `sensors_plus` Shake Detector with G-Force Meter |

---

## 📂 Architecture & Directory Structure

```
apps/mobile_flutter/lib/
├── core/
│   ├── theme/          # AppColors, AppTypography, AppSpacing, AppRadius, AppTheme
│   ├── network/        # HttpClient (Dio), ApiEndpoints, ApiError
│   ├── storage/        # SecureStorageService (Tokens), LocalStorageService (Prefs)
│   ├── router/         # GoRouter with StatefulShellRoute for Bottom Navigation
│   ├── sync/           # OutboxManager for offline mutations and reconciliation
│   ├── sensors/        # ShakeDetector (Accelerometer g-force calculation)
│   └── widgets/        # AppButton, AppCard, AppInput, AppChip, AppSheet, FloatingNavBar...
├── features/
│   ├── auth/           # LoginScreen, AuthSession, AuthProvider
│   ├── workspace/      # WorkspaceSwitcher, ProjectSwitcher, TeamMembersScreen
│   ├── tasks/          # TasksScreen (List & Kanban Board), TaskDetail, TaskCreateSheet
│   ├── bugs/           # BugsScreen, BugDetailScreen, BugAutoContextCard
│   ├── stickies/       # StickyBoardScreen, StickyCard, Color Picker
│   ├── capture/        # QuickCaptureSheet (Task, Bug, Sticky, Voice)
│   ├── sessions/       # LiveSessionBar, SessionSummaryModal
│   ├── home/           # HomeScreen, Daily Metrics, High Priority Preview
│   ├── search/         # SearchScreen (Cross-entity real-time search)
│   ├── notifications/  # NotificationsScreen
│   ├── outbox/         # PendingSyncScreen (Offline queue inspector)
│   ├── settings/       # SettingsScreen, AiProviderScreen, QuickCapturePrefs, ShakeTest
│   └── system/         # ForceUpdateScreen, FoundationGalleryScreen, VersionPolicy
└── main.dart           # App entry point with Shake listener & Riverpod ProviderScope
```

---

## 🛠️ Build & Run Commands

### 1. Run in Development Mode
```bash
flutter run
```

### 2. Run Static Analysis & Lints
```bash
flutter analyze
```

### 3. Run Test Suite
```bash
flutter test
```

### 4. Build Production Android Bundle (AAB for Google Play Store)
```bash
flutter build appbundle --release
```

### 5. Build Standalone Preview APK
```bash
flutter build apk --release
```
