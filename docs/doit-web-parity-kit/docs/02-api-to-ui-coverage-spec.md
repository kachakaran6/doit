# 02 — API → UI Coverage (every capability gets a professional screen)

## The rule
**Every operation in the backend's OpenAPI spec must either have a UI surface in the web app (and be listed in `docs/API_COVERAGE.md` as ✅) or an explicit waiver with a reason.** Source of truth = the live spec (e.g. `/docs-json` from Swagger) and `@doit/contracts`, **not** this document. The inventory below is the *expected* shape from earlier phases; reconcile it with the real spec.

## How to measure (script)
```
node scripts/api_coverage.mjs --spec http://localhost:3000/docs-json --src apps/web/src --waivers docs/api-waivers.json --out docs/API_COVERAGE.md
```
Exit 0 only when every operation is covered or waived. Do the same for mobile later (`--src apps/mobile/src`) to see parity gaps. The script is heuristic (call-site search): after it reports ✅ the agent still verifies each flow in the browser and with a Playwright test.
Waivers (allowed only for): internal/system endpoints (health, ws-ticket, refresh), mobile-only device endpoints, deprecated routes. Everything else needs UI.

## Definition of "covered" (per feature)
1. Reachable from navigation (not hidden), correct permission gating (`<Can>`).
2. Create/read/update/delete where the API supports it, with validation errors mapped to fields.
3. Loading skeleton, empty state, error state, success toast, optimistic update where safe.
4. URL-addressable (deep link), keyboard accessible, responsive.
5. Playwright test of the happy path + one permission-denied path.

## Expected feature inventory → UI surface
| Domain | Typical operations | Required web UI | Gate |
|---|---|---|---|
| **Auth & sessions** | register, login, logout, logout-all, forgot/reset password, change password, sessions list/revoke, delete account, data export, email verify/2FA (if present) | Auth pages; *Settings › Security* (password, sessions with "this device", sign out everywhere, 2FA if API), *Data & privacy* (export, delete with typed confirm) | self |
| **Profile (/me)** | get/patch name, avatar/color, preferences (theme, accent, density), permissions | *Settings › Profile* (name, email read-only/change flow, avatar color/upload), *Preferences*; user menu shows real name/email/role | self |
| **Workspaces** | list mine, create, get, patch (name/slug/logo), delete, leave, transfer ownership, join by code | Workspace switcher menu (search, switch, **Create workspace** dialog, **Join with code**); *Workspace settings* (general, danger zone: leave/transfer/delete) | owner/admin |
| **Members** | list, change role, suspend/reactivate, remove, member detail | *Team* page: table (avatar, name, email, role badge, status, last active, projects), row menu (change role, suspend, remove), member drawer (assigned items), role explainer | admin+ |
| **Invitations** | create (email/link/code, role, expiry, projects), list, revoke, resend, preview, accept | *Team › Invitations* tab + "Invite people" dialog (email chips, role, expiry, copy link/QR), public `/accept-invite` page | admin+ |
| **Projects** | list, create (name, key, emoji/color, description, visibility, lead), get, patch, archive/unarchive, delete, members CRUD with project roles | Sidebar Projects with **"+" New project** dialog; Projects index page (cards/table with progress, lead, visibility, archived filter); *Project settings* (general, visibility, members & roles, archive/delete danger zone) | member+/project_admin |
| **Work items** | list/filter/search/sort/group, create (all fields), get, patch, delete, duplicate, convert type, bulk update/delete, quick-add parse, summary, move project, reorder (board), subtasks/relations if present | Tasks page (List/Board/Table), **full create dialog** (title, description markdown, project, type, status, priority, assignee, labels, due date, attachments, voice), **peek panel**, bulk bar, display options (group/sort/columns), quick-add row, item full page | per matrix |
| **Labels** | list, create, rename, recolor, delete, assign | *Workspace settings › Labels* (CRUD table with color picker), label picker everywhere with inline "Create label" | admin (create: member) |
| **Comments & activity** (if API) | list/create/edit/delete comment, activity feed | Peek/full page: comments (markdown, @mention), activity timeline | member+ |
| **Attachments** | upload image/audio/file, signed URL, delete, transcript | Dropzone + paste screenshots, gallery + lightbox, audio player with transcript, delete with confirm, progress/retry | member+ |
| **Bugs** | list (type=bug), severity, meta/device, screenshot, audio, triage state, assign, duplicate-of, test sessions/builds | Bug Queue split view (see premium kit), triage actions, device meta, session/build filter | member+ |
| **Voice** | voice upload → task/bug, transcription status/retry | "Voice note" in Create menu (upload/record in browser if allowed), status chip, retry | member+ |
| **Stickies** | list, create, update, pin, color, delete, convert to task | Stickies board (masonry), editor dialog, pin/color/convert | self |
| **Search** | global search with `#label @user is:open due:today` | Search page with tabs + highlighted results; ⌘K integration | member+ |
| **Notifications** | list, mark read/all, preferences, devices/push tokens | Bell popover + Inbox page; *Settings › Notifications* (per-event toggles); *Security › Devices* (registered phones, revoke) | self |
| **Audit log** | list/filter | *Workspace settings › Audit log* (filters by actor/action/date, export CSV) | admin+ |
| **Integrations / mail** | SMTP config, test email, feature flags/config | *Workspace settings › Integrations* (SMTP form with "Send test email", secrets masked), flags as read-only list | owner/admin |
| **Analytics/summary** | summary counts, charts endpoints | Overview KPIs/charts; optional *Reports* page (created vs resolved, bugs by severity/build/device) | member+ |
| **System/health** | health, version, status | Admin-only "System status" in *Workspace settings › About* (not on Overview) | owner/admin |
| **Realtime** | WS events | live updates + toasts (no UI page) | — |

## Per-feature screen standards
- **Create/edit = dialog or sheet** (not a new page) unless the object is rich (item full page).
- **Forms**: sentence-case labels, helper text, inline validation, disabled-until-valid primary, Enter submits, Esc cancels, unsaved-changes guard.
- **Destructive**: confirm dialog stating consequences; typed confirm for workspace/project/account deletion.
- **Lists**: search + filters + sort + pagination/infinite scroll, bulk where the API supports it.
- **Permission UX**: hide what is irrelevant; disable with an explanatory tooltip when the user could request it.

## Closing the matrix
Loop: run coverage → pick the uncovered group with highest user value → build UI to the standards → test → rerun coverage. Track in `docs/API_COVERAGE.md` (generated) and `docs/api-waivers.json` (reviewed by the owner). **Done = 100% covered or waived, every ✅ verified by a Playwright test.**
