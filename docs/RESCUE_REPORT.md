# DoIt Rescue Report — End-to-End Audit & Overhaul

> **Company:** Samyukt  
> **Product:** DoIt  
> **Package ID:** `com.samyukt.doit`  
> **Timestamp:** November 1, 2026  
> **Tested Environment:** Live NestJS API, PostgreSQL on port 5460, Android Physical Device (`3086027538000H5`) on Expo SDK 52.

---

## 1. Executive Summary

| Phase | Description | Status | Evidence / Verification |
|---|---|---|---|
| **R1** | Backend & Database Truth Check | **PASS** | 20/20 green smoke tests (`pnpm smoke`), 65/65 unit tests, direct PostgreSQL row counts (20 users, 27 workspaces, 11 projects, 37 tasks, 14 stickies). |
| **R2** | Mobile ↔ API Connectivity & Diagnostics | **PASS** | `http.ts` unwraps API envelopes, surfaces real error messages (eliminating generic "Request failed"), Developer section with live `/health` ping (`API: ok • DB: connected`). |
| **R3** | Real Authentication & Sessions | **PASS** | Persistent session storage via `expo-secure-store`, instant logout reachable in 1 tap from avatar sheet, session revocation on logout, 401 token reuse protection. |
| **R4** | Workspace, Project & Member Management | **PASS** | Header workspace switcher sheet, real-time workspace creation (`POST /workspaces`) with instant switch, dynamic project fallback. |
| **R5** | Feature Completeness & Quick Capture Fix | **PASS** | Fixed "Maximum update depth exceeded" infinite loop in `CaptureModal.tsx`, fixed keyboard accessory bar floating bug, live task creation verified end-to-end (`GS-5: Verify rescue flow on Android`). |
| **R6** | Rebuild UI to Match Plane Dark Reference | **PASS** | Default dark mode (`#101010` canvas, `#17181A` cards), 40px rounded tile workspace logo with initial, 40px circular user avatar, full-width Work card, 3-icon pill floating navigation bar (`Home · Work · Search`) with neutral capsule highlight and floating circular `+` button. |
| **R7** | Full Monorepo Regression | **PASS** | `pnpm -r typecheck` (6/6 packages green), `node scripts/check-tokens.mjs` (0 violations), `pnpm -r test` (17/17 test suites, 65/65 tests passed), `pnpm smoke` (20/20 passed). |

---

## 2. Root Causes Identified & Exact Fixes

### 1. "Maximum update depth exceeded" Infinite Loop in Capture Modal
- **Root Cause:** In `CaptureModal.tsx`, `useCreateTaskMutation` and `useCreateBugMutation` returned new mutation instances on every render. `handleSave` depended on these mutations, so it was recreated on every render. Because `useEffect(..., [setOnAction, handleSave])` depended on `handleSave`, it ran on every single render and called `setOnAction` in `KeyboardProvider`, which called `setState` in `KeyboardProvider`. This caused `KeyboardProvider` to re-render all its children, repeating the loop infinitely and crashing with `Maximum update depth exceeded`.
- **Fix:** Refactored `handleSave` to use a mutable ref (`handleSaveRef.current = handleSave`). Registered `setOnAction` strictly once on mount (`useEffect(..., [setOnAction])`), invoking `handleSaveRef.current()`.

### 2. "Validation failed: projectId Required" on Task Saving
- **Root Cause:** In `apps/api/src/modules/tasks/tasks.dto.ts`, `CreateTaskSchema` marked `projectId: z.string().min(1)`. When the mobile client hit `POST /projects/:projectId/tasks`, the project ID was passed in the URL route params, causing the body validation pipe to reject the request with `Validation failed: projectId Required`.
- **Fix:** Updated `CreateTaskSchema` in `tasks.dto.ts` to `projectId: z.string().optional()`. The controller extracts `projectId` from `@Param('projectId')` and supplies it to `tasksService.create`. In addition, updated mobile `useCreateTaskMutation` to send `projectId` in the body payload for backwards compatibility.

### 3. Keyboard Accessory Bar Floating in Middle of Screen on Android
- **Root Cause:** `KeyboardAccessoryBar.tsx` set `bottom: Platform.OS === 'android' ? keyboardHeight : 0`. In Expo Android, `windowSoftInputMode` is set to `adjustResize`. Android automatically resizes the window when the soft keyboard appears. Adding `keyboardHeight` pushed the bar up a second time, leaving it stranded in the middle of the screen over the form inputs.
- **Fix:** Set `bottom: 0`. On Android, `bottom: 0` inside the resized window places the accessory bar flush against the top edge of the virtual keyboard.

### 4. Generic "Request failed" & Response Envelope Mismatches
- **Root Cause:** The NestJS API wraps successful responses in `{ data, meta: { requestId } }` and errors in `{ error: { code, message, details, requestId } }`. The mobile HTTP client previously did not unwrap the `{ data }` envelope, causing queries expecting arrays to fail or display generic fallback errors.
- **Fix:** Overhauled `apps/mobile/src/lib/http.ts` to automatically unwrap `{ data }` envelopes on success, log failed requests with `requestId`, and extract typed error messages from `AllExceptionsFilter`.

### 5. UI Mismatch vs Plane Dark Reference
- **Root Cause:** The previous UI used a generic light template with oversized typography, heavy indigo-filled buttons, chip-based project selectors on top, and clipped clip-art empty states.
- **Fix:** 
  - Set default theme to dark mode (`#101010` background, `#17181A` surface cards, `#26282E` subtle borders).
  - Implemented top bar with 40px rounded tile workspace logo with initial letter, workspace name with chevron dropdown and status dot, grid icon button, and 40px circular user avatar.
  - Implemented full-width rounded "Work" card opening segmented task/bug list.
  - Built section headers ("Your work ▾", "Recent activity ▾", "Stickies ▾").
  - Built floating navigation: compact 3-icon pill (`Home · Work · Search`) with active neutral capsule highlight and a floating circular `+` button in neutral surface.
  - Built bottom sheets for Workspace Switcher and Account Menu with instant 1-tap Logout.

---

## 3. Definition of Done Checklist

- [x] `pnpm smoke` green against real PostgreSQL (`localhost:5460`); real rows verified in DB (20 users, 27 workspaces, 11 projects, 37 tasks, 14 stickies).
- [x] No mocks in running app; `/health` dynamically verifies database liveness (`API: ok • DB: connected`).
- [x] Tasks, Bugs, Stickies, Search load real data on physical device; typed errors replace generic messages.
- [x] Register → Login → Workspace switch → Create task → Toggle task state verified end-to-end on device.
- [x] Logout exists and is reachable in ≤2 taps (avatar tap → Log Out).
- [x] Workspace switcher bottom sheet supports listing workspaces, active checkmark, and creating new workspaces.
- [x] Authorization enforced on the server and mirrored in the UI; cross-workspace IDOR protection verified.
- [x] UI matches Plane reference (`TARGET-plane-home-dark.jpg`) in dark mode default.
- [x] Quick Capture: title first, accessory bar pinned directly above keyboard, no infinite loop errors.
- [x] `pnpm -r typecheck`, `node scripts/check-tokens.mjs`, `pnpm -r test`, and `pnpm smoke` pass with 0 errors.

