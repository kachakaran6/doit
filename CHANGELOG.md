# Changelog — DoIt

All notable changes to the **DoIt** application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.6] - 2026-11-10 — Seamless Mobile Invite Deep Linking & One-Screen Onboarding

### Added
- **Smart App Launch on Web Invitation Page (`/invite/:token`)**:
  - Automatic mobile detection with direct Android Intent launch (`intent://invite/...`).
  - Automatically launches the installed DoIt mobile app directly into the workspace invitation screen.
  - Automatic fallback to Google Play Store if the application is not installed on the user's phone.
  - Dedicated "Open in DoIt App", "Download on Google Play", and "Continue in browser" CTA buttons.
- **Mobile One-Screen Invitation Onboarding**:
  - Unauthenticated users can now create an account or sign in directly within `InviteAcceptScreen` without navigating away.
  - Immediate invitation acceptance upon authentication with instant entry into the invited workspace.
  - Pending invite token queue in `LoginScreen` for automatic workspace acceptance after standard authentication.

### Changed
- Bumped mobile version to `0.3.6` (versionCode `38`).

---

## [0.3.5] - 2026-11-10 — Web Workspace UI Upgrade, Kanban DnD & All Work Hub

### Added
- **Unified All Work Hub (`/work`)**:
  - Combined stream of tasks and bug reports across the workspace or filtered by project.
  - Multi-criteria filtering by type, status, priority, severity, and project.
  - Responsive dual-view modes: Structured Table view and scannable List view.
  - Interactive item detail drawer with AI solution prompt generation.
- **HTML5 Drag-and-Drop Kanban Board**:
  - Smooth native drag-and-drop on the Tasks board (`TODO`, `IN_PROGRESS`, `DONE`).
  - Optimistic updates in React Query cache with automatic rollback on network failure.
  - Animated drop targets with dashed column placeholders.
- **Purposeful Stickies Canvas**:
  - Inline Quick Compose Sticky Card with immediate note taking, color picking, and `Ctrl+Enter` save.
  - Pinned filter and text search in toolbar.
- **Accessibility & Compliance**:
  - Google Play Store prominent disclosure dialog for Android Accessibility Service screen capture.
  - Verification walkthrough video archived in `playstore-assets/accessibility_disclosure.mp4`.

### Changed
- Replaced cluttered multi-row filters on Tasks page with a clean horizontal workspace toolbar.
- Added row density toggle (Comfortable vs Compact) for high-density task lists.
- Master-detail proportions on Bug Queue: 42% queue list and 58% inspector with compact screenshot lightbox.
- Removed global header `+ New task` button in favor of contextual in-page and floating action buttons.

---

## [0.2.3] - 2026-11-08 — Deep Link Lifecycle & UI Redesign Alignment

### Fixed
- **Native Intent Lifecycle & Deep Link Routing**:
  - Resolved "Invitation Unavailable / Error" screen on cold start and task resume.
  - Handled intent clearing in `MainActivity.kt` across `onCreate`, `onNewIntent`, and `onPause`.
  - Added token consumption tracking preventing re-triggering of handled invitation tokens.
- **UI Design System Alignment**:
  - Centralized design token usage across mobile light and dark themes.
  - Fixed web workspace switcher layout shift and removed duplicate page headings.

---

## [0.1.0+3] - 2026-11-02 — Native Floating Bubble & Accelerometer Shake Architecture Fix

### Fixed & Implemented
- **Critical Issue A: Floating Overlay Bubble & Permission Detection**:
  - Injected native Kotlin classes (`OverlayPackage`, `OverlayServiceModule`, `BubbleService`) via custom Expo Config Plugin into Android source tree.
  - Implemented actual `Settings.canDrawOverlays(context)` native checking replacing fallback stubs.
  - Added direct intent routing to `Settings.ACTION_MANAGE_OVERLAY_PERMISSION` (`package:com.samyukt.doit`) with specialized Xiaomi/MIUI/HyperOS fallback (`miui.intent.action.APP_PERM_EDITOR`).
  - Created real 56dp circular floating bubble view with DoIt branding, drop shadow, dragging, screen-edge snapping, and single-tap launch to quick capture.
  - Registered Android 14+ `specialUse` foreground service with ongoing notification controls.
- **Critical Issue B: Shake-to-Add Motion Detection**:
  - Integrated `expo-sensors` hardware accelerometer sampling at 20Hz (50ms interval).
  - Fixed critical mathematical bug in direction reversal algorithm where scalar norm sign was checked instead of dominant motion axis vector ($\Delta X, \Delta Y, \Delta Z$).
  - Added `ShakeCaptureProvider` with battery-safe foreground lifecycle (automatically pauses sensor when app is backgrounded).
  - Added dedicated "Test Shake Sensor" diagnostic modal in Settings with live motion delta bar, threshold gauge, and haptic confirmation.
  - Configurable sensitivity: Low ($21\text{ m/s}^2$), Medium ($14.5\text{ m/s}^2$), High ($10\text{ m/s}^2$), with 1200ms debounce.
- **Backend & Cloud Architecture**:
  - Updated production backend target to `https://doit.samyukt.pro/api/v1` while preserving local server support for local dev.
- **Android Release Build 3**:
  - Incremented `versionCode: 3` (`0.1.0+3`).

---

## [0.1.0+2] - 2026-11-02 — Quick Capture Guide & Hardware Settings Polish

### Added
- **Hardware & Quick Capture Guide Modal (`QuickCaptureGuideSheet`)**:
  - Detailed visual guides for the Floating Overlay Bubble and Shake-to-Report systems.
  - Interactive "Grant Permission" workflow for Android `SYSTEM_ALERT_WINDOW` ("Display over other apps").
  - Step-by-step instructions for dragging, docking, and one-tap capturing from any external app.
  - OEM-specific battery optimization guides (Samsung One UI, Xiaomi HyperOS, OnePlus OxygenOS).
- **Settings Screen Integration**:
  - Real-time permission status banner with instant redirection to Android system overlay settings.
  - Shake sensitivity selector (`Low`, `Medium`, `High`) with physical motion sensor tuning.
  - Interactive "Test Quick Capture" trigger directly inside Settings.
  - Added "Production (Cloud)" API endpoint chip (`https://doit-api.137.23.49.73.sslip.io/api/v1`) with live latency and database status pinging.
- **Android Release Build 2**:
  - Incremented `versionCode: 2` (release `0.1.0+2`) adhering strictly to the monotonically increasing release progression protocol.

---

## [0.1.0+1] - 2026-11-01 — First Production Release

### Added
- **Production Deployment on Coolify**: Automated multi-stage Docker deployment for NestJS API (`doit-api`) connected to PostgreSQL 16 (`doit-db`) via internal bridge network with Caddy reverse proxy and automatic TLS.
- **Precision Dark UI / Design System**: Overhauled interface inspired by Linear and Things 3 — neutral graphite palette (`#101113`, `#17191C`), 4-point spacing scale, restrained indigo accent (`#7775D8`).
- **Android Standalone Build (APK)**: Native release build with package `com.samyukt.doit`, version `0.1.0`, `versionCode: 1`.
- **Database Auto-Sync**: Automated Prisma schema push with full model migration and seed support.
- **Health & Readiness Telemetry**: `/api/v1/health` and `/api/v1/health/ready` endpoints verifying database, storage volumes, and internal queues.
- **Comprehensive Documentation Suite**:
  - `docs/ARCHITECTURE.md`: Complete system diagrams, data topology, security boundaries.
  - `docs/API.md`: Comprehensive REST API & OpenAPI specification.
  - `docs/PRODUCTION-DEPLOYMENT.md`: Coolify infrastructure, environment variables, volumes.
  - `docs/RELEASE-GUIDE.md`: Versioning strategy (`VERSION+BUILD`), signing, checksums.
  - `docs/INSTALLATION.md`: Device installation and self-hosting guides.

---

## [0.1.0] - 2026-10-30

### Phase 0: Bootstrap & Monorepo Foundation
- Monorepo configured with Turborepo, pnpm hoisted architecture for exFAT compatibility.
- Expo React Native application initialized with target package name `com.samyukt.doit`.
- Shared design tokens package (`@samyukt/tokens`) and contracts package (`@samyukt/contracts`).
- Automated CI rule enforcement (`scripts/check-tokens.mjs`) prohibiting raw hex colors in UI code.
- Gate G0 PASSED.

### Phase 1: Backend Core, Data, Media & Voice Pipeline
- NestJS foundation with Prisma ORM, PostgreSQL schema, and migrations.
- Argon2id password hashing, rotating JWT access/refresh token families, device session management.
- Multi-tenant workspaces with OWNER > ADMIN > TESTER > VIEWER role hierarchy enforced by `WorkspaceMemberGuard`.
- State-machine task lifecycle (TODO, IN_PROGRESS, BLOCKED, DONE) rejecting invalid transitions with 422.
- Fractional indexing reordering, auto-incrementing per-project human IDs (`SMP-42`), checklists, activity logs.
- Workspace labels CRUD, case-insensitive collision defense, and PostgreSQL GIN full-text search index.
- Notes/stickies CRUD with body validation, pinned-first sorting, and atomic convert-to-task (`POST /stickies/:id/convert`).
- Three-step resumable upload pipeline (`POST /uploads/init`, PUT, `POST /uploads/:id/complete`) with MIME whitelisting and magic-byte validation.
- Multi-engine voice transcription pipeline (`LocalWhisper`, `OpenAIWhisper`, `SarvamAsr`) with 5-minute cap and LLM defect structuring.
- Gate G1 PASSED.

### Phase 2: Design System & Mobile Tokens
- Complete design system with WCAG AA/AAA compliant contrast ratios (≥4.5:1).
- 5 brand accents: Indigo, Teal, Amber, Rose, Violet.
- Theme system supporting Light, Dark, and System modes with live hot swapping.
- Standardized UI components: `Text`, `Button` (0.97 press scale), `Chip`, `Input`, `Sheet`, `EmptyState`, `Skeleton`, `Layout`, `ComponentGallery`.
- Gate G2 PASSED.

### Phase 3: App Shell, Feature Screens & Contextual Keyboard Bar
- Signature Floating Navbar (64pt height pill, 16pt margin, 4 destinations + 56×56 raised centre capture button at `translateY(-12)`).
- Feature-folder architecture template `src/features/_template/`.
- Feature screens: Tasks (My Day, Inbox, Upcoming, Kanban Board), Stickies (2-column grid, deterministic rotation), Bugs (triage queue, read-only telemetry auto-context card), Home (workspace chip header, project metrics, your work).
- Contextual Keyboard Accessory Bar pinned above keyboard with dynamic chip set per focused field and 150 ms accent flash.
- Gate G3 PASSED.

### Phase 4: Capture Core & Native Capabilities
- Android Quick Capture Overlay with `BubbleService` foreground service and 56dp draggable bubble.
- Timed Test Sessions with one-time `MediaProjection` screen capture consent and live in-app top session bar.
- Wrist-shake detection with 1.2s debounce and 3-direction reversal filter within 400ms.
- Glance widget (Android 2×1 quick-add, 4×2 today) and WidgetKit (iOS) bridges writing to shared offline storage.
- Device telemetry collector (`deviceModel`, `osVersion`, `appUnderTest`, `appVersion`, `buildNumber`, `capturedAt`, `screenSize`).
- Gate G4 PASSED.

### Phase 5: Offline Outbox, Realtime Sync & Settings
- `OutboxManager` persistent queue with FIFO ordering per entity and parallel execution across entities.
- Exponential backoff retry (1s, 4s, 16s) for network errors and automatic discard for 4xx validation errors.
