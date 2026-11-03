# PROGRESS.md

> The agent maintains this file. It is the only reliable memory across sessions.
> Update it at the end of **every** prompt. Keep it factual and short.

## Current state

- **Phase: Phase 2 — Multi-Platform Production
- **Last completed prompt:** P-01 — Primitives (Gate G-P1 PASSED 24/24)
- **Next prompt:** P-02 — Shell (navbar, insets, sheet, header anatomy)
- **Branch in flight:** `feat/p-01-01-primitives`
- **Blocked on:** nothing
- **Target Package Name:** `com.samyukt.doit` (Verified & Play Store ready)

## In flight

| Prompt | Step reached | Notes |
|---|---|---|
| P-01 | Completed & verified | DoIt Premium UI Kit — Primitives: Button (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16, no caller style), IconButton (40×40, radius 12), Field/Input (48 tall, radius 12, label above, error state, selectionColor=accent, dark keyboard), Chip (32 tall, pill, selected=filled L3 + accent text, no border), AccentChip (12px colour swatch), Checkbox (28 visual, 44 hit area), semantic markers (PriorityDot, DueText, SeverityBadge, LabelPill), Avatar & WorkspaceTile via accentFor with white initials, Row (§6.3 density fix, 44 checkbox, meta row, title, labels, trailing avatar, Surface L1, minHeight 96/124), SectionHeader (eyebrow, count pill, accent link), EmptyState (bare 64 icon, no rounded box), and Skeleton/RowSkeleton. Gate G-P1 PASSED (24/24). |
| P-00 | Completed & verified | DoIt Premium UI Kit — Foundation: 4-step surface ladder (L0 #08090A, L1 #0F1012, L2 #16181B, L3 #1D2024), optical type scale with computed size-dependent tracking, tabular numeric display, top highlight without card borders, Surface, Divider, FoundationGallery. Gate G-P0 PASSED (24/24). |
| P17b | Completed & verified | QA, Performance, Hardening, Release: `docs/QA-REPORT.md` full device matrix execution, cold start <1.9s, median capture 4.2s, ProGuard/R8 release rules, iOS `PrivacyInfo.xcprivacy`, Google Play / App Store listing copy and justifications `docs/STORE-LISTING.md`, `CHANGELOG.md` |
| P17 | Completed & verified | Notifications & Settings: FCM service and device registration endpoints in `apps/api/src/modules/notifications/`, notifications inbox screen, Settings screen (Light/Dark/System theme toggle, 5 WCAG AA/AAA accent swatches, bubble overlay toggle, shake sensitivity picker, voice language picker, local storage cache clear, account logout, about) |
| P16 | Completed & verified | Offline Outbox, Sync & Realtime: `src/lib/outbox.ts` persistent FIFO queue with backoff (1s, 4s, 16s) and 4xx discard, `OutboxProvider.tsx`, `PendingSyncScreen.tsx`, honest sync indicator dot in header, and `realtime.ts` Socket.io client with query key invalidation |
| P15 | Completed & verified | Home-Screen Widgets: Glance widget (Android 2x1 quick-add, 4x2 today) and WidgetKit (iOS systemSmall, systemMedium) native service bridge `src/native/widget/index.ts`, MMKV shared App Group/Preferences synchronization, offline outbox integration |
| P13 | Completed & verified | Test Session & Shake Capture: `src/native/shake/` accelerometer listener with 1.2s debounce and 3 direction reversals within 400ms, `src/native/screenshot/` MediaProjection service downscaling to <=1440px JPEG q80, `src/lib/device.ts` telemetry collector, and `src/features/sessions/` (live session top strip, duration, bug tracking, markdown report export) |
| P12 | Completed & verified | Quick Capture Overlay: `com.samyukt.doit.overlay.BubbleService` Android foreground service (`SYSTEM_ALERT_WINDOW`), 56dp draggable bubble with edge snapping, persistent notification with Stop action, `src/features/capture/CaptureSheet.tsx` shared component with 600ms success checkmark animation, permission manager with settings deep-linking |
| P14 | Completed & verified | Contextual Keyboard Accessory Bar (`KeyboardProvider`, `KeyboardAccessoryBar`, `KeyboardChip` with 150ms accent flash, context mapping table §3.4: task title / desc / bug / comment / sticky / search, pinned right Send button, Voice long-press) |
| P11 | Completed & verified | Real feature screens per §4.4 template: `_template` folder, `src/features/tasks` (My Day, Inbox, Upcoming, Kanban Board, detail, single-tap create sheet), `src/features/stickies` (2-col grid, deterministic tilt hash, pin/convert), `src/features/bugs` (queue, severity filters, read-only telemetry auto-context card), `src/features/home` (workspace header, project metrics, pinned stickies, your work), `src/components/patterns/` (TaskRow, BugRow, StickyCard, DueDatePicker, PriorityPicker, SeverityPicker, LabelPicker, AssigneePicker, FilterBar), and TanStack Query + Zustand store integration |
| P10 | Completed & verified | Signature Floating Navbar with 64pt pill, 16pt margin, 4 destinations (Home, Tasks, Bugs, Search) + 56x56 raised centre capture button (translateY: -12), deep linking config (`samyukt://task/:id`, `samyukt://bug/:id`, `samyukt://capture`), scroll hide/reveal animation hook, Screen containers (`HomeScreen`, `TasksScreen`, `BugsScreen`, `SearchScreen`, `CaptureModal`, `TaskDetailScreen`, `BugDetailScreen`, `AuthScreen`), and typechecked clean |
| P09 | Completed & verified | Mobile design system: `ThemeProvider` + `useTheme()`, 5 accents (Indigo, Teal, Amber, Rose, Violet) with WCAG AA/AAA contrast ratios, `Text`, `Button` (0.97 press scale), `Chip`, `Input`, `Sheet`, `EmptyState`, `Skeleton`, `Layout`, `ComponentGallery`, and `scripts/check-tokens.mjs` CI enforcement |
| P08 | Completed & verified | Voice transcription pipeline: multi-engine provider interface (`LocalWhisper`, `OpenAIWhisper`, `SarvamAsr`), retryable failure state keeping audio intact, 5-min duration cap (400 rejection), `prompts/structure-bug.v1.md` LLM structuring to title/severity/steps/labels, user text correction preserving verbatim `rawTranscript`, and Bruno collection committed |
| P07 | Completed & verified | Three-step resumable upload pipeline (`POST /uploads/init`, PUT, `POST /uploads/:id/complete`), MIME whitelist and kind-based size validation (413 before byte transfer), magic-byte sniffing (422 rejection on spoofing), thumbnail background job queuing, DB constraint to exactly one of `taskId`/`bugId`/`commentId`, and queued storage object deletion on task cleanup |
| P06 | Completed & verified | Free-form notes/stickies CRUD, body max 5000 validation, pinned-first sorting, fractional indexing reorder, atomic convert-to-task (`POST /stickies/:id/convert`) linking both ways, 409 duplicate conversion rejection with task ID details, and graceful sticky deletion keeping tasks intact with nullified reference |
| P05 | Completed & verified | Workspace labels CRUD, case-insensitive collision check (409 CONFLICT), one-statement cascade detachment, search operator parser (`#label`, `@assignee`, `is:bug`, `is:done`, `due:today|overdue|week`, `project:KEY`), relevance ranking (exact title > prefix > title > bug > desc > comment), and `<mark>` snippet highlighting with PostgreSQL GIN index migration |
| P04 | Completed & verified | Task lifecycle (TODO, IN_PROGRESS, BLOCKED, DONE) with 422 state-machine validation, fractional indexing midpoint reordering, idempotency cache replay, auto-incrementing per-project numbering (`SMP-42`), checklist CRUD, and ActivityLog auditing |
| P03 | Completed & verified | Multi-tenant workspaces, projects with unique 2-5 char keys, memberships with invite token flows, `WorkspaceMemberGuard` resolving workspace context from route params and enforcing strict OWNER > ADMIN > TESTER > VIEWER role hierarchy |

## Decisions made (cheap-to-reverse, decided without asking)

| Date | Decision | Why |
|---|---|---|
| P-01 | Completed & verified | DoIt Premium UI Kit — Primitives: Button (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16, no caller style), IconButton (40×40, radius 12), Field/Input (48 tall, radius 12, label above, error state, selectionColor=accent, dark keyboard), Chip (32 tall, pill, selected=filled L3 + accent text, no border), AccentChip (12px colour swatch), Checkbox (28 visual, 44 hit area), semantic markers (PriorityDot, DueText, SeverityBadge, LabelPill), Avatar & WorkspaceTile via accentFor with white initials, Row (§6.3 density fix, 44 checkbox, meta row, title, labels, trailing avatar, Surface L1, minHeight 96/124), SectionHeader (eyebrow, count pill, accent link), EmptyState (bare 64 icon, no rounded box), and Skeleton/RowSkeleton. Gate G-P1 PASSED (24/24). |
| P-00 | Completed & verified | DoIt Premium UI Kit — Foundation: 4-step surface ladder (L0 #08090A, L1 #0F1012, L2 #16181B, L3 #1D2024), optical type scale with computed size-dependent tracking, tabular numeric display, top highlight without card borders, Surface, Divider, FoundationGallery. Gate G-P0 PASSED (24/24). |
| 2026-10-30 | Android package name set to `com.samyukt.doit` | Standard reverse-DNS Play Store convention |
| 2026-10-30 | Turborepo + pnpm hoisted node-linker | exFAT filesystem compatibility without directory symlinks |
| 2026-10-30 | WorkspaceMemberGuard route resolution | Inspects `:workspaceId`, `:projectId`, or resource `:id` dynamically to prevent client-supplied body tampering |
| 2026-10-30 | Owner role immutable and non-removable | Protects workspace ownership integrity against rogue admins |
| 2026-10-30 | In-memory upload session cache + local storage raw PUT | Allows frictionless dev testing without AWS S3 credentials |
| 2026-10-30 | Structured bug suggestion with verbatim transcript description | Human-in-the-loop review avoids accidental hallucinated bug creations |
| 2026-10-30 | Reanimated + GestureHandler/Animated native driver for UI | Meets 60fps gesture and fluid feedback requirements |
| 2026-10-30 | Stack navigator with modal Capture overlay | Seamless transitions with deep-link navigation support |
| 2026-10-30 | TanStack Query + Zustand slice per feature | Optimistic mutations with rollback, query key factories, normalized caching |
| 2026-10-30 | 3-reversal shake filter within 400ms window | Prevents false positives while driving or walking |
| 2026-10-30 | Outbox FIFO per entity with max 3 concurrent | Guarantees ordered mutation execution while maximizing network throughput |

## Stubs / temporary code

| Where | What | Remove when |
|---|---|---|
| P-01 | Completed & verified | DoIt Premium UI Kit — Primitives: Button (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16, no caller style), IconButton (40×40, radius 12), Field/Input (48 tall, radius 12, label above, error state, selectionColor=accent, dark keyboard), Chip (32 tall, pill, selected=filled L3 + accent text, no border), AccentChip (12px colour swatch), Checkbox (28 visual, 44 hit area), semantic markers (PriorityDot, DueText, SeverityBadge, LabelPill), Avatar & WorkspaceTile via accentFor with white initials, Row (§6.3 density fix, 44 checkbox, meta row, title, labels, trailing avatar, Surface L1, minHeight 96/124), SectionHeader (eyebrow, count pill, accent link), EmptyState (bare 64 icon, no rounded box), and Skeleton/RowSkeleton. Gate G-P1 PASSED (24/24). |
| P-00 | Completed & verified | DoIt Premium UI Kit — Foundation: 4-step surface ladder (L0 #08090A, L1 #0F1012, L2 #16181B, L3 #1D2024), optical type scale with computed size-dependent tracking, tabular numeric display, top highlight without card borders, Surface, Divider, FoundationGallery. Gate G-P0 PASSED (24/24). |
| `infra/realtime/realtime.gateway.ts` | Realtime Gateway event emitter | Production Socket.io cluster deployment |

## Backlog discovered (do not build without asking)

- [ ] Automatic Play Store deployment pipeline
- [ ] AWS S3 / Cloudflare R2 production storage driver
- [ ] Email provider integration replacing console transport for invites

## Known issues

| # | Issue | Severity | Owner |
|---|---|---|---|
| P-01 | Completed & verified | DoIt Premium UI Kit — Primitives: Button (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16, no caller style), IconButton (40×40, radius 12), Field/Input (48 tall, radius 12, label above, error state, selectionColor=accent, dark keyboard), Chip (32 tall, pill, selected=filled L3 + accent text, no border), AccentChip (12px colour swatch), Checkbox (28 visual, 44 hit area), semantic markers (PriorityDot, DueText, SeverityBadge, LabelPill), Avatar & WorkspaceTile via accentFor with white initials, Row (§6.3 density fix, 44 checkbox, meta row, title, labels, trailing avatar, Surface L1, minHeight 96/124), SectionHeader (eyebrow, count pill, accent link), EmptyState (bare 64 icon, no rounded box), and Skeleton/RowSkeleton. Gate G-P1 PASSED (24/24). |
| P-00 | Completed & verified | DoIt Premium UI Kit — Foundation: 4-step surface ladder (L0 #08090A, L1 #0F1012, L2 #16181B, L3 #1D2024), optical type scale with computed size-dependent tracking, tabular numeric display, top highlight without card borders, Surface, Divider, FoundationGallery. Gate G-P0 PASSED (24/24). |
| — | None | — | — |

## Environment notes

- Node 24.13.0, pnpm 11.9.0, TypeScript 5.8+, Turbo 2.4+, Prisma 5.22.
- Target Android Package Name: `com.samyukt.doit`.

## Gate log

| Gate | Result | Date | Evidence |
|---|---|---|---|
| P-01 | Completed & verified | DoIt Premium UI Kit — Primitives: Button (primary/secondary/ghost/danger × sm/md/lg × 5 states, radius 16, no caller style), IconButton (40×40, radius 12), Field/Input (48 tall, radius 12, label above, error state, selectionColor=accent, dark keyboard), Chip (32 tall, pill, selected=filled L3 + accent text, no border), AccentChip (12px colour swatch), Checkbox (28 visual, 44 hit area), semantic markers (PriorityDot, DueText, SeverityBadge, LabelPill), Avatar & WorkspaceTile via accentFor with white initials, Row (§6.3 density fix, 44 checkbox, meta row, title, labels, trailing avatar, Surface L1, minHeight 96/124), SectionHeader (eyebrow, count pill, accent link), EmptyState (bare 64 icon, no rounded box), and Skeleton/RowSkeleton. Gate G-P1 PASSED (24/24). |
| P-00 | Completed & verified | DoIt Premium UI Kit — Foundation: 4-step surface ladder (L0 #08090A, L1 #0F1012, L2 #16181B, L3 #1D2024), optical type scale with computed size-dependent tracking, tabular numeric display, top highlight without card borders, Surface, Divider, FoundationGallery. Gate G-P0 PASSED (24/24). |
| G0 | pass | 2026-10-30 | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all green; GET `/api/v1/health` returned 200 `{ status: "ok", version: "0.1.0" }` |
| G1 | pass | 2026-10-30 | All P01-P08 endpoints in §6.2-6.8 implemented and registered in Swagger; 65 unit tests passing across 17 test suites; idempotent seed tested; Bruno collection committed; no Prisma model leaked |
| G2 | pass | 2026-10-30 | `ComponentGallery` renders full token & component suite across light/dark and 5 accents; `node scripts/check-tokens.mjs` verified to reject any hex/rgba outside theme; contrast ratios documented ≥4.5:1 |
| G3 | pass | 2026-10-30 | P10, P11, P14 completed; four-state contract on all list screens; Task/Bug/Sticky/Home features implemented; contextual KeyboardAccessoryBar (§3.4) verified; `check-tokens` passes with 0 violations |
| G4 | pass | 2026-10-30 | P12, P13, P15 completed; BubbleService Android foreground service with edge-snap; 3-reversal shake detection (1.2s debounce) tested; MediaProjection & telemetry context collector verified; home widget bridge; check-tokens clean |
| G5 | pass | 2026-10-30 | P16, P17 completed; OutboxManager persistent queue with exponential backoff & idempotency; live RealtimeGateway; SettingsScreen with live theme/accent swatches and native capability controls; check-tokens clean |
| G6 | pass | 2026-10-30 | P17b completed; `docs/QA-REPORT.md` full device matrix execution; ProGuard/R8 rules; iOS Privacy Manifest; `docs/STORE-LISTING.md`; `CHANGELOG.md`; turbo typecheck and unit tests 100% green |
