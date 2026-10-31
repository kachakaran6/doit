# DoIt — Project Status & Rescue Audit

> **Updated:** November 1, 2026  
> **Repository:** `K:\Doit`  
> **Company:** Samyukt  
> **Product Name:** DoIt  
> **Android / iOS ID:** `com.samyukt.doit`  
> **Verified Environment:** Live NestJS API, PostgreSQL 18.4 on port 5460, Android Physical Device (`3086027538000H5`) on Expo SDK 52.  
> **Rescue Status:** **All Phases R1 through R7 Verified Live (Gates Passed)**

---

## 1. Physical Device Verification (Live on Android)

The application has been verified end-to-end on physical Android hardware (`3086027538000H5`):
1. **Initial Unauthenticated Gate:** App boots strictly to `AuthScreen` (`LoginScreen`), displaying "DoIt" in dark theme mode, with input validation and quick demo login buttons for Alice (`alice@doit.local`) and Bob (`bob@doit.local`).
2. **Network Authentication & Token Persistence:** Tapping Sign In sends a live HTTP POST to `http://192.168.1.67:3000/api/v1/auth/login`. Tokens and session models are persisted in `expo-secure-store`, keeping the user logged in across restarts.
3. **Plane-Style Home Dashboard:** Matches `TARGET-plane-home-dark.jpg`:
   - Canvas: `#101010` near-black with `#17181A` surface cards and `#26282E` subtle borders.
   - Header: 40px rounded tile workspace logo with initial letter, workspace name with dropdown chevron `▾` and status dot `•`, grid icon, and 40px circular user avatar.
   - Full-width "Work" card opening the segmented task list.
   - Collapsible section headers ("Your work ▾", "Recent activity ▾", "Stickies ▾").
   - Floating Navigation: 3-icon pill (`Home · Work · Search`) with active neutral capsule highlight and a floating circular `+` button in neutral surface with border.
4. **Workspace & Account Management:**
   - Tapping the workspace header opens the **Workspace Switcher bottom sheet**: lists user workspaces with active checkmark, allows switching active workspace, and provides an inline "+ Create workspace" workflow (`POST /workspaces`) that instantly switches to the newly created workspace.
   - Tapping the top-right circular avatar opens the **Account Menu sheet**: displays user details (`alice@doit.local`), appearance toggles (Dark, Light, System + 5 accents), Developer Diagnostics with live `/health` ping (`API: ok • DB: connected`), and instant **Log Out in 1 tap**.
5. **Quick Capture & Task Engine:**
   - Floating `+` button opens Quick Capture bottom sheet with auto-focused title input.
   - Keyboard accessory bar is pinned directly above the Android soft keyboard (`bottom: 0`), eliminating floating obstruction.
   - Eliminated the `Maximum update depth exceeded` infinite loop by decoupling mutation references from action handlers.
   - Fixed `projectId Required` validation bug in backend `CreateTaskSchema` and mobile payload.
   - Tasks and bugs create and update live in PostgreSQL with full optimistic updates and state machine transitions.

---

## 2. Rescue Phases Verification Matrix

| Phase | Description | Built? | Verified Live? | Proof / Command Output |
|:---|:---|:---:|:---:|:---|
| **R1** | Backend + DB Truth Check | YES | **PASS** | `pnpm smoke` 20/20 green; DB row counts verified via Prisma against Postgres. |
| **R2** | Mobile ↔ API Connectivity & Diagnostics | YES | **PASS** | Auto-unwrapped `{ data }` envelopes; Developer Diagnostics ping shows `API: ok • DB: connected`. |
| **R3** | Real Authentication & Sessions | YES | **PASS** | `expo-secure-store` persistent storage; token rotation and reuse rejection (401); 1-tap Logout. |
| **R4** | Workspace, Project & Member Management | YES | **PASS** | Workspace switcher bottom sheet; live workspace creation; project fallback mapping. |
| **R5** | Feature Completeness & Quick Capture Fix | YES | **PASS** | Live task creation tested on device (`GS-5: Verify rescue flow on Android`); status transitions active. |
| **R6** | Rebuild UI to Match Plane Dark Reference | YES | **PASS** | Full dark theme default; 40px tile logo; 3-icon floating pill nav + floating circular `+` button. |
| **R7** | Full Monorepo Regression & Report | YES | **PASS** | `pnpm -r typecheck` (6/6 green), `node scripts/check-tokens.mjs` (0 violations), `pnpm -r test` (65/65 tests passed), `pnpm smoke` (20/20 green). |

---

## 3. Monorepo Quality Gates

- **Typecheck:** `pnpm -r typecheck` passes cleanly across all 6 workspace packages (`@doit/api`, `@doit/mobile`, `@doit/tokens`, `@doit/contracts`, `@doit/web`).
- **Token Linter:** `node scripts/check-tokens.mjs` confirms 0 hardcoded colors outside design tokens.
- **Unit Test Suite:** `pnpm -r test` passes 17 test suites (65 tests).
- **Smoke Suite:** `pnpm smoke` passes 20/20 end-to-end integration flows against live PostgreSQL and NestJS.
