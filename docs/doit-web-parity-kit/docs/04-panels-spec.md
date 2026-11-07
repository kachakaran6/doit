# 04 — Professional User, Team, Project & Workspace Panels

Design standard: shadcn Dialog/Sheet/Tabs/DropdownMenu/Command/Form; tonal surfaces; sentence case; 720px forms; sticky `UnsavedBar`; every action has loading/success/error states; permissions via `<Can>` + server enforcement.

## A. Account area (personal) — `/settings/account/*` (sub-nav: Profile · Preferences · Notifications · Security · Devices · Data & privacy)
- **Profile**: avatar (initials on deterministic color; upload if API supports), full name, display name, email (read-only or change-with-verify flow if API), timezone/locale if supported, workspace role (read-only).
- **Preferences**: theme cards (System/Light/Dark), accent swatches, density (Comfortable/Compact), default project, default view (List/Board), keyboard shortcuts toggle, reduce motion note.
- **Notifications**: per-event toggles (assigned, mentioned, due soon, new bug in my projects, weekly digest) × channels (in-app, email, push), quiet hours if supported.
- **Security**: change password (current/new/confirm, strength meter), active sessions (device, browser/OS, platform web/android, location/IP if provided, last active, "This device", revoke, **Sign out everywhere**), 2FA/passkeys when the API exists (else a "Coming soon" row is NOT allowed — hide it).
- **Devices**: registered phones (push tokens) with model/OS/last seen, revoke.
- **Data & privacy**: export my data (async job status + download), delete account (consequences list + typed confirmation; blocks if sole owner → guide to transfer ownership).

## B. Team — `/team` (workspace-level, admin gating)
Tabs: **Members · Invitations · Roles**.
- **Members** table: avatar+name+email, role badge, status (Active/Suspended), joined, last active, projects count; search + role/status filters; row menu: Change role (guardrails: not self, last-owner protection, admins can't change admins/owners), Suspend/Reactivate, Remove (confirm), View assigned work (drawer).
- **Invitations**: pending list (email/link, role, projects, expires, invited by), Revoke, Resend, Copy link/QR, **Invite people** dialog (emails chips or link/code mode, role select with descriptions, optional project access, expiry).
- **Roles**: read-only permission matrix (Owner/Admin/Member/Guest × key actions) generated from `@doit/contracts`, plus project-role explainer.

## C. Projects
- **Projects index** (`/projects`): cards or table (emoji/color, name, key, lead, members avatars, progress bar, open tasks/bugs, visibility lock, updated); filters (mine, archived, visibility); **New project** button.
- **New project dialog**: name, key (auto-suggested, 2–5 chars, uniqueness check), emoji/color, description, visibility (Workspace / Private) with explanation, lead, initial members (if private), template (none/software/bugs-only if API). Creates and navigates to the project.
- **Project switcher** (breadcrumb/menu) with search + "New project".
- **Project settings** (`/projects/:key/settings`): General (name, key (locked after items exist), emoji/color, description), Visibility, **Members & roles** (add by name/email, role select, remove), Labels (project-scoped if API), States/workflow (if API), **Danger zone**: Archive/Unarchive, Delete (typed confirm, shows item count).

## D. Workspace settings — `/workspace/settings/*` (owner/admin) (sub-nav: General · Labels · Integrations · Audit log · Billing(if API) · About · Danger zone)
- **General**: name, slug (with warning), logo/color tile, default role for invites, allowed email domains (if API).
- **Labels**: table with color dot, name, usage count; create/rename/recolor/delete (confirm; shows usage); merge if API.
- **Integrations**: SMTP (host, port, security, user, password masked, from; **Send test email** with result), webhooks/Slack if API, API tokens if API.
- **Audit log**: filter by actor/action/target/date; expandable details; export CSV.
- **About**: version, API health, realtime status, storage usage (admin-only; replaces "System & sync" on Overview).
- **Danger zone**: transfer ownership (select member, confirm with password), leave workspace, delete workspace (typed confirm + export prompt).

## E. Create dialogs & quick actions (global)
Create menu → **New task/bug** full dialog: title (autofocus), description (markdown + preview), project, type, status, priority, assignee, labels (with inline create), due date (calendar + presets), attachments (drop/paste), voice note; "Create more" toggle; parsed quick-add line at the top (`!high #label @user tomorrow`). **New sticky**, **Voice note**, **New project**, **Invite people** share the same dialog styling.

## F. Empty & first-run states
New workspace with no projects: onboarding card ("Create your first project" + import sample data), then checklist (invite teammates, install the Android app, report your first bug with a shake) on Overview until completed.

## G. Role matrix for UI exposure
Owner: all. Admin: all except delete/transfer workspace. Member: projects (create/own), items, stickies, personal settings; read-only team. Guest: only granted projects, own items, personal settings. Controls the user can't use are hidden or disabled with a reason; direct URLs to forbidden pages render the 403 page.
