# Changelog — Samyukt Doit

All notable changes to the Samyukt Doit platform are documented in this file.

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
- Feature-folder architecture template `src/features/_template/` per §4.4.
- Feature screens: Tasks (My Day, Inbox, Upcoming, Kanban Board), Stickies (2-column grid, deterministic rotation), Bugs (triage queue, read-only telemetry auto-context card), Home (workspace chip header, project metrics, your work).
- Contextual Keyboard Accessory Bar pinned above keyboard with dynamic chip set per focused field (§3.4) and 150 ms accent flash.
- Gate G3 PASSED.

### Phase 4: Capture Core & Native Capabilities
- Android Quick Capture Overlay with `BubbleService` foreground service and 56dp draggable bubble.
- Timed Test Sessions with one-time `MediaProjection` screen capture consent and live in-app top session bar.
- Wrist-shake detection with 1.2s debounce and 3-direction reversal filter within 400ms.
- Glance widget (Android 2×1 quick-add, 4×2 today) and WidgetKit (iOS) bridges writing to shared offline storage.
- Device telemetry collector (`deviceModel`, `osVersion`, `appUnderTest`, `appVersion`, `buildNumber`, `capturedAt`, `screenSize`).
- Gate G4 PASSED.

### Phase 5: Offline Outbox, Realtime Sync & Settings
- `OutboxManager` persistent queue with FIFO ordering per entity and parallel execution across entities (up to 3 concurrent).
- Exponential backoff retry (1s, 4s, 16s) for network errors and automatic discard for 4xx validation errors.
- Honest sync status indicator dot (synced, syncing, offline, error) in header.
- `PendingSyncScreen` listing queued/failed items with retry and discard actions.
- Socket.io Realtime Gateway in NestJS emitting `task.*`, `bug.*`, `comment.*`, `session.*` with query key invalidation.
- Comprehensive Settings screen with theme toggle, 5 accent swatches, bubble toggle, shake sensitivity, and cache management.
- Gate G5 PASSED.

### Phase 6: QA, Hardening & Release
- Verified full test matrix across 7 physical and virtual device profiles (`docs/QA-REPORT.md`).
- 17 test suites (65 tests) passing with 100% green status.
- Zero hardcoded colors outside `theme/tokens`.
- ProGuard/R8 release rules and Apple Privacy Manifest configured.
- Store listing copy and official permission justifications committed (`docs/STORE-LISTING.md`).
- Gate G6 PASSED (Release Ready).
