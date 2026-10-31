# DoIt — RESCUE PROMPT (Check → Fix → Test, until it truly works)

> Paste this whole file into your AI agent. Company = **Samyukt**, product = **DoIt**, Android/iOS id = `com.samyukt.doit`.
> Reference images are in `reference/`. **Open `TARGET-plane-home-dark.jpg` and every `CURRENT-*.png` first.**

---

## 0. Situation (read carefully)

The previous status claimed "100% built and verified". **That is false.** On a real device the app shows:

1. Tasks and Bugs screens fail with **"Could not load tasks / bugs — Request failed"**. The error is generic and hides the real cause.
2. The backend does not appear to be working end-to-end with a **real database**. Treat every "PASSED" as unproven.
3. **No proper authentication UX**: there is no logout, no way to create a workspace, no way to create/manage projects, no member management.
4. The UI looks like a generic light template, **not** like the target (Plane mobile, dark). Seed names "Samyukt Core / Samyukt Doit / Default Project" leak into the UI.
5. Quick Capture is a long form; the keyboard accessory bar floats in the **middle** of the form instead of sitting directly above the keyboard; the title input is cut off.
6. Empty-state images are clipped/cropped inside rounded squares and look broken.

**Goal for tonight:** a production-quality app where a new user can register, create a workspace and a project, add tasks/bugs/stickies (with voice and screenshots), manage members, log out, and log back in, backed by real PostgreSQL, with a UI matching the Plane reference.

## 1. Operating rules (non-negotiable)

1. **Evidence or it didn't happen.** Never write "fixed/passed/verified" without showing the command output, test result, or screenshot that proves it. Unverified items are labeled `UNVERIFIED`.
2. **Loop discipline** for every item: `CHECK` (reproduce, capture the exact error) → `FIX` (root cause, not a patch over symptoms) → `TEST` (automated where possible, plus run on device/emulator) → `RECORD` (one line in `docs/RESCUE_REPORT.md`). Don't move on until TEST passes. If blocked after 3 honest attempts, write the blocker with evidence and move on.
3. **Fix root causes.** No swallowing errors, no try/catch that returns empty data, no mock fallbacks in non-test code.
4. **No mocks in the running app.** Remove/disable any mock adapter (`USE_MOCK` etc.) from dev and prod paths. Mocks may exist only inside tests.
5. **Real errors, visible.** Replace every "Request failed" with the real reason (network unreachable / 401 / 403 / 404 / 422 field errors / 500 + request id). Add a Developer section in Settings (see §3).
6. Keep `com.samyukt.doit`. Everything user-visible says **DoIt**. Remove demo strings like "Samyukt Core".
7. Work in the order below. If time runs short, use the **cut list** in §9, never skip R1–R4.
8. Commit after each phase with a conventional message.

## 2. PHASE R1 — Truth check of backend + database (do first)

**CHECK**
- Is PostgreSQL actually running and reachable with the `DATABASE_URL` in `.env`? Run `prisma migrate status`, `prisma migrate deploy`, and connect with `psql` to list tables. Set a **non-empty password** for the DB user.
- Does the API boot cleanly? Hit `/api/v1/health` (it must check the DB, not just return ok).
- Search the code for in-memory arrays, fake repositories, hard-coded data, `USE_MOCK`, TODOs, `any` hiding errors. List them.
- Check response envelope vs what the mobile client parses (mismatch is a likely cause of "Request failed").

**FIX**
- Make migrations + seed reproducible from an empty DB with one command: `pnpm db:reset`.
- Seed must create only a **neutral demo**: two users, one workspace "Demo Workspace", one project "Getting Started" with a few sample items. No company names.
- Ensure every endpoint reads/writes Postgres through Prisma.

**TEST — build `scripts/smoke-api.mjs` (command: `pnpm smoke`)**
Runs against a live API + DB and prints PASS/FAIL per step:
register → login → `GET /me` → create workspace → list workspaces → create project → create task (all fields: description, priority, due date, labels, assignee) → update state → create bug with meta → create sticky → convert sticky → upload image + audio → attach → list/filter/search → refresh token rotation → refresh reuse is rejected → logout → old access token rejected → logout-all → cross-workspace access denied (expect 403/404).
After the run, **query Postgres directly** and show that the rows exist.
Gate: `pnpm smoke` 100% green + `pnpm test` green.

## 3. PHASE R2 — Mobile ↔ API connectivity

**CHECK (these are the usual suspects; test each and report which was the cause)**
- Wrong base URL: device cannot reach `localhost`/`10.0.2.2`. Use `adb reverse tcp:3000 tcp:3000` + `http://localhost:3000/api/v1`, or the LAN IP via env.
- Android blocks cleartext HTTP in release/preview builds. Dev: allow cleartext through a config plugin/network security config **only for dev**; production must use **HTTPS**.
- Missing/incorrect `X-Workspace-Id`, expired token with no refresh, 401 loop, envelope mismatch, wrong field names between `@doit/contracts` and API.
- Using Expo Go: native modules don't work there; use a **dev build** (`expo run:android`) or the preview APK.

**FIX**
- Single API client with: base URL resolution, auth header, workspace header, refresh-once-and-retry, typed error mapping, request id logging in dev.
- **Settings → Developer** (visible in dev/preview builds): shows API URL, `/health` result (API + DB), current user, workspace id, token expiry, last 10 failed requests with status + message, "Copy diagnostics".
- Every list screen shows a meaningful error with Retry (e.g. "Can't reach server at <host>" vs "Session expired" vs "No permission").

**TEST**
Run the app on a device/emulator against the real API. Tasks and Bugs lists must load (empty or with data). Include screenshots in the report.

## 4. PHASE R3 — Real authentication & sessions

**Backend + mobile, both sides, with tests:**
- Register, login, refresh (rotating, reuse detection), logout, logout-all, session list/revoke, change password, forgot/reset password (dev: log link to console; prod: SMTP env), account lockout after repeated failures, password policy, argon2id.
- Access token validated against the session (revoked session stops working immediately).
- Delete account + export my data (store requirements).
- Mobile: auth gate at app start (splash → check session → login or home), secure token storage (SecureStore), secure logout clears tokens, React Query cache, workspace selection and any outbox of the previous user.
- Screens: Login, Register, Forgot password, Reset password, Change password, Active sessions, Delete account.
- **Logout must exist and be reachable in ≤2 taps** (avatar menu → Log out).

**TEST:** backend e2e for each flow + Maestro flow: register → logout → login → wrong password error → lockout message.

## 5. PHASE R4 — Workspace, project & member management (currently missing)

**First-run onboarding:** Register → "Create your workspace" (name) → "Create your first project" (name + key) → Home. Also "Join with invite code".

**Workspace**
- Header tap (workspace name with ⌄, like the reference) opens a **Workspace switcher bottom sheet**: list of my workspaces (active check), **Create workspace**, **Join with code**, Workspace settings.
- Workspace settings: rename, invite members (role + expiry + copy/share link/code), members list (role badges; change role, suspend, remove), leave workspace, transfer ownership, delete workspace (owner, typed confirmation).
- Roles: owner / admin / member / guest. Enforce on the server with a central policy (`@Can(action)`), mirror in the app with `useCan` (hide/disable). Migrate old roles safely (OWNER→owner, TESTER→member).

**Projects**
- Work screen has a project switcher sheet: list, **New project** (name, key 2–5 chars, emoji, visibility workspace/private), edit, archive, delete (typed confirm), project members for private projects.

**Account menu** (top-right avatar, as in the reference): profile, appearance (mode + 5 accents), workspace, sessions, developer (dev builds), **Log out**.

**TEST:** two real accounts: A creates workspace + project + invites B; B accepts; role limits verified (member can't remove members; guest sees only added projects); A removes B; B loses access immediately; cross-workspace IDOR attempts fail. Add these to `pnpm smoke` and Maestro.

## 6. PHASE R5 — Feature completeness (verify each on a device)

Work items (task / bug / todo): create, edit, delete; title, markdown description, state, priority, due date, labels (create/edit/delete), assignee, severity for bugs, attachments (image viewer, audio player), sequence id (e.g. `GS-12`), filters (state, priority, label, assignee, due), search (`#label @user`), pagination/infinite scroll, pull-to-refresh, optimistic updates with rollback.
Stickies: create/edit/pin/color/delete/convert to task.
Quick add: parse `!priority #label @user date type`, mic → speech-to-text, optional audio attach.
Bug capture (Android): permission wizard, bubble, shake, screenshot, Quick Capture, upload, offline queue; follow the earlier docs. **Verify on a real device and record results** (device model, steps, pass/fail).
Notifications/FCM: register device token; verify on a device if credentials exist, otherwise mark `UNVERIFIED (needs Firebase creds)`.

**TEST:** Maestro flows for everything except the overlay (manual script in `docs/QA_RESULTS.md`).

## 7. PHASE R6 — Rebuild the UI to match the Plane reference

Study `reference/TARGET-plane-home-dark.jpg`. Match its look and structure. **Default theme = dark.** Light mode, system mode and the 5 accents remain supported, with Plane-like neutrals in both.

### 7.1 Why the current UI is wrong
Large oversized type, bright white default, heavy indigo-filled buttons and chips, project chips on top, clip-art empty states in tinted squares, nav items with labels and a raised center button, long forms. Plane is **calm, dense, monochrome, small-radius-soft, accent used sparingly**.

### 7.2 Target specification (Home)
- **Canvas**: near-black (`~#101010`), cards one step lighter (`~#17181A`) with a 1px subtle border, no heavy shadows. Light mode: white canvas, `#F7F7F8` cards, same structure.
- **Header row**: workspace logo = 40px rounded-square colored tile with the initial; workspace name (~20px, medium) + chevron-down + small status dot; right side: "add widgets/grid-plus" icon button and a 40px **circular avatar** (initial) which opens the account menu.
- **"Work" card**: full-width rounded card (radius ~24), leading icon, label "Work", trailing chevron → opens Work (tasks/bugs list with segmented All / Mine / Bugs).
- **Section headers**: "Your work ▾", "Recent activity ▾" (+ "View all" right), "Stickies ▾"; muted gray, ~16px medium, small filled caret that collapses the section.
- **Rows**: leading outline icon (24px), label (~18px), trailing muted count and chevron; ~64px tall; no row borders (spacing only).
- **Recent activity**: emoji/icon + project/item title, muted type subtitle.
- **Stickies**: horizontal/2-col preview; empty state = quiet monochrome isometric line illustration (draw simple SVG, not clip-art), one muted caption, **outline** button ("Create your first sticky").
- **Floating nav**: pill container (`surfaceRaised`, subtle border), **icon-only** items **Home · Work · Search**; active item = lighter rounded segment (neutral, not accent-filled); a separate **circular `+` button** (~72px) floating bottom-right above the pill, neutral surface with border. Long-press `+` → Task / Bug / Sticky / Voice. Nav hides on scroll down, returns on scroll up, never covers content (bottom inset).
- **Type scale (smaller than now)**: caption 12, body 14, row 16–18, title 18–20, screen title 24 max. Font: Inter.
- **Accent usage**: only for primary actions in sheets, selected chips' text/outline, focus ring, checkmarks, links. No full-width filled purple buttons on Home.

### 7.3 Other screens
- **Work**: header (project switcher ⌄ + filter icon), segmented control, compact list rows (state icon, priority icon, `KEY-12`, title, label chips, due date, assignee avatar), swipe actions, skeleton/empty/error. Optional board view later.
- **Item detail**: Plane-like — big editable title, description, property rows (State, Priority, Assignee, Labels, Due date, Project) each opening a compact picker sheet, attachments, activity.
- **Quick Capture (fix completely)**: bottom sheet with **title input first and auto-focused**, optional description, mic button; the **keyboard accessory bar is pinned directly above the keyboard** (priority, due, label, assignee, project, mic, Send) and never inside the scroll content; Task/Bug/Voice switch as a small segmented control at the top; Save lives in the accessory bar. Opens < 500 ms.
- **Search**, **Stickies**, **Settings/Account**, **Auth** screens: same visual language.
- Illustrations: replace the clipped images with consistent simple SVG empty states.
- If gluestack-ui v5 migration (P19) is not done, **do not block on it**; implement against the existing tokens/components, but **no raw colors/sizes in screens** (run the token linter) so the migration can happen later.

### 7.4 UI acceptance
Side-by-side screenshots (TARGET vs DoIt) for Home in dark and light; Work, Item detail, Quick Capture (keyboard open), Workspace switcher, Account menu; all 5 accents; font scale 130%; small phone (360×640). Explain any deviation from the reference.

## 8. PHASE R7 — Full regression + report

1. Run: `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm smoke && node scripts/check-naming.mjs && node scripts/check-tokens.mjs`.
2. Run Maestro flows on an emulator; run the manual overlay script on a **real device**.
3. Fresh-clone test: follow README only; app + API + DB come up and a new user can complete onboarding.
4. Produce `docs/RESCUE_REPORT.md`: for every item in R1–R6: `status (PASS / FAIL / UNVERIFIED)`, evidence (command, test name, screenshot path), root cause found, fix summary. Include a list of anything still broken.
5. Rewrite `STATUS.md` honestly from that report.

## 9. Time budget (one night) and cut list

| Phase | Target |
|---|---|
| R1 backend + DB truth | 1.0 h |
| R2 connectivity + diagnostics | 0.5 h |
| R3 auth + logout | 1.0 h |
| R4 workspace/project/members | 1.5 h |
| R5 features verify/fix | 1.5 h |
| R6 UI to Plane reference | 2.5 h |
| R7 regression + report | 0.5 h |

If behind schedule, cut in this order: iOS widgets → realtime WebSocket → FCM → Whisper/ASR provider extras → Board view → annotation tools. **Never cut** R1–R4, Quick Capture fixes, or the home/work/nav UI.

## 10. Definition of done

- [ ] `pnpm smoke` green against a real Postgres; rows visible in the DB
- [ ] No mocks in the running app; `/health` verifies DB
- [ ] Tasks, Bugs, Stickies, Search load real data on a real device; real error messages everywhere
- [ ] Register → create workspace → create project → add items → log out → log in works
- [ ] Logout, logout-all, change/reset password, sessions, delete account exist and work
- [ ] Workspace switcher, create/join/rename/leave workspace; invites; member roles; project CRUD and members
- [ ] Authorization enforced on the server and mirrored in the UI; IDOR tests pass
- [ ] UI matches the Plane reference (dark default, floating icon-only pill nav, circular `+`), light mode and 5 accents work
- [ ] Quick Capture: title first, accessory bar above keyboard, voice works, opens fast
- [ ] Android bug capture verified on a real device (results recorded)
- [ ] `docs/RESCUE_REPORT.md` with evidence; `STATUS.md` honest; unverified items clearly marked

**Start with R1. Report real results before you change anything else.**
