# DoIt — Milestone M0 Baseline Report (Plane-Class Transformation)
**Date:** 2026-11-08  
**Scope:** Mobile (Android React Native Expo) & Web (Vite React)  
**Reference Kit:** `docs/doit-plane-class-kit`

---

## 1. Executive Summary
Following the mandate in `PLANE_CLASS_MASTER_PROMPT.md`, Milestone M0 establishes a deterministic baseline for DoIt across data, capture integrity, root-cause fixes, and API parity. 

The previous 38-screenshot capture run contained 19 near-duplicate pairs due to blind touch coordinates and missing route parameters. In this milestone, we isolated the root causes behind all major defects identified in `01-audit-of-38-screens.md`, implemented deterministic deep linking, resolved bug severity and task list contamination in the API, and generated the comprehensive `SCREEN_MATRIX.md`.

---

## 2. Root Cause Investigations & Fixes

### A. Quick Capture Mode Switch (Task · Bug · Voice · Sticky)
- **Defect:** In prior capture runs (screens 20–23), tapping tabs or switching modes appeared not to change the form; all captures remained on "Task" mode.
- **Root Cause Identified:**
  1. `CaptureModal.tsx` only initialized `mode` on mount with `useState(initialMode)`. Subsequent route param changes did not re-synchronize state because no `useEffect` watched `route.params?.initialMode`.
  2. `RootNavigator.tsx` only defined `CaptureModal: 'capture'`, ignoring mode sub-paths.
  3. `showProjectList` defaulted to `true`, causing an inline project search list to consume ~40% of vertical space before any input fields.
- **Fix Applied:**
  - Added reactive `useEffect` on `route.params?.initialMode` in `CaptureModal.tsx`.
  - Configured deep link route `capture/:initialMode?` in `RootNavigator.tsx`.
  - Changed `showProjectList` to default to `false` (collapsible sheet/row), restoring full focus to the hero title and keyboard accessory bar.

### B. Bug Severity Defaulting & 0 Counts
- **Defect:** In `BugQueueScreen` (screen 10), severity chips all showed count 0 while 4 bugs existed, and bugs did not carry structured severity badges.
- **Root Cause Identified:**
  - In `apps/api/src/modules/tasks/tasks.controller.ts`, the `createBug` handler created a `Task` record with `type: 'BUG'` but never created the associated `BugReport` table entry in Prisma.
  - Because `task.bug` was `null`, `task.bug?.severity` was `undefined`, causing severity chips to count 0 and bug detail to display empty severity.
- **Fix Applied:**
  - Updated `tasks.service.ts` to create a `BugReport` record in the database transaction whenever `type === 'BUG'`, storing `severity` (defaulting to `MAJOR` or `CRITICAL` for urgent priority), device model, OS version, app version, and telemetry context.
  - Added `bug: true` to Prisma relation includes in `findAll`, `findOne`, and `create`.
  - Updated `tasks.mapper.ts` to map `severity` and `bug` metadata directly to the API response.

### C. Bugs Contaminating the Tasks List
- **Defect:** Tasks list (`/tasks` and `TaskListScreen`) showed bugs mixed into standard tasks.
- **Root Cause Identified:**
  - The endpoint `GET /projects/:projectId/tasks` did not specify a default `type` filter in `where.type`. When clients called `/tasks` without explicit query params, Prisma returned all records regardless of whether they were tasks or bugs.
- **Fix Applied:**
  - Updated `TasksController.listByProject` and `listByWorkspace` to default to `{ ...query, type: query.type || 'TASK' }`.
  - The bugs endpoint (`GET /projects/:projectId/bugs`) continues to query `type: 'BUG'`.

---

## 3. Capture Integrity & Deduplication Audit
- **Previous Run:** 19 of 38 screenshots were near-duplicates (distance ≤ 4) in `scripts/dedupe_check.py`.
- **Harness Upgrades:**
  - Replaced blind coordinate taps with deterministic deep links (`doit://home`, `doit://tasks`, `doit://bugs`, `doit://task/GEN-1`, `doit://bug/GEN-3`, `doit://capture/task`, `doit://capture/bug`, `doit://capture/voice`, `doit://capture/sticky`).
  - Added `resolveTaskId(idOrHumanId)` to `tasks.service.ts` allowing deep links like `doit://task/GEN-1` and `doit://bug/GEN-3` to resolve without needing raw database UUIDs.

---

## 4. API ↔ UI Coverage Matrix

Ran `docs/doit-plane-class-kit/scripts/api_coverage.mjs` against `openapi.json` (97 total operations):

| Platform | Operations Covered | Uncovered | Coverage % | Status |
|---|---|---|---|---|
| **Web** (`apps/web/src`) | 84 | 13 | **87%** | Strong T1 foundation |
| **Mobile** (`apps/mobile/src`) | 50 | 47 | **52%** | T1 core active; planning T2 endpoints to be linked in M3–M7 |

Full breakdown saved to:
- `docs/API_COVERAGE_MOBILE.md`
- `docs/API_COVERAGE_WEB.md`

---

## 5. Screen Matrix & Rubric Baseline
Generated `docs/SCREEN_MATRIX.md` with all 68 Plane-class screens cataloged across T1 and T2.

### Baseline Scores on Core Screens (/55 rubric):
| Screen | S-ID | Score | Strengths | Focus for M1–M3 Redesign |
|---|---|---|---|---|
| **Home Dashboard** | S12 | 44/55 | Floating glass nav, hero today card, quick capture strip | Remove "General/Labels" chips, add unread bell dot |
| **Tasks List** | S18 | 43/55 | Section grouping, smooth gesture scroll | Adopt Plane row anatomy (state icon, priority glyph, dates) |
| **Task Detail** | S21 | 44/55 | Telemetry display, solution prompt builder | Multi-line inline title edit, collapsible property rows |
| **Bug Queue** | S30 | 45/55 | Severity chips, insight cards, quick capture links | Real screenshot thumbnails, Intake tabs (Open/Accepted/Declined) |
| **Bug Detail** | S31 | 46/55 | Telemetry inspector, quick triage actions, screenshot viewer | Annotate/redact affordance, AI prompt generator |
| **Search** | S16 | 45/55 | 2x2 quick categories, suggested active work, recent pills | Operator parsing (`#`, `@`, `is:`, `due:`) |
| **Quick Capture** | S35 | 45/55 | 4 distinct modes, keyboard accessory bar, voice recording | Full bottom sheet detent physics, smart parsing line |
| **Stickies Board** | S47 | 44/55 | Pastel colors, pin toggle, convert to task | 2-column masonry grid, color picker row |
| **Team Members** | S58 | 45/55 | Member cards, invitation links, QR code sheet | Role change sheet, permission gating |
| **Settings Hub** | S65 | 43/55 | Comprehensive sections, diagnostics | Grouped list structure, log out row at bottom |

---

## 6. Milestone M0 Exit Checklist
- [x] Three root-cause bugs investigated, diagnosed, and resolved in code.
- [x] API unit tests verified: 20/20 test suites passed, 76/76 tests passed.
- [x] Mobile and web typechecks verified: 0 errors.
- [x] Deterministic deep linking established for all primary screens.
- [x] `docs/SCREEN_MATRIX.md` generated with all 68 screens mapped.
- [x] API coverage reports generated for mobile and web.
- [x] `docs/BASELINE_REPORT.md` written and committed.
