# Changelog — DoIt

All notable changes to the **DoIt** application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
