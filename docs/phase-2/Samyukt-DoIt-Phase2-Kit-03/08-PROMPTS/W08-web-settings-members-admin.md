# W08 — Settings, Members, Roles, Admin & Audit

**Lane** W · **Depends on** W07 · **Branch** `feat/w08-web-settings-members-admin`

## Load
- `09-PHASE2-RULES.md`
- `02-FEATURE-SPEC.md` (Phase 1) F2, F16
- `04-WEB-AUTH-AND-AUTHZ.md` §4.5
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.5 (audit endpoint)

## Goal
Everything an admin needs: members and roles, projects, labels, personal preferences, sessions,
and the audit trail.

## Deliverables
- `features/settings/` — General, Members, Labels, Projects, Notifications, Sessions, Danger
- `features/members/` — invite dialog, role dropdown, remove with confirmation
- `features/admin/` — audit log table with filters (actor, action, date range)
- `/me` — profile, avatar upload, theme + accent, security
- `Danger zone`: transfer ownership, archive workspace, delete workspace (type-to-confirm)

## Requirements
- Role changes are optimistic but revert on `403`. An OWNER cannot demote themselves; the UI
  disables it and the API rejects it.
- Invite dialog: email + role, shows the pending-invite list with resend/revoke.
- Sessions table: device, platform, last seen, revoke. Includes the current browser.
- Preferences (theme, accent, default project) persist to `user.prefs` so they follow the user to
  mobile.
- Audit log: paginated table, filterable, exportable as CSV.
- Danger zone actions require typing the workspace name and are visually separated.

## Do not
- Do not show a role dropdown to a role that cannot change roles (`can()` gate).
- Do not allow deleting a workspace without type-to-confirm.
- Do not store preferences only in localStorage once the user is logged in.

## Acceptance checks
- [ ] OWNER can invite, change roles, remove; ADMIN cannot change roles; TESTER sees no member
      management at all.
- [ ] Changing the accent in settings updates the mobile app on next launch (shared `prefs`).
- [ ] Revoking a browser session from web logs that browser out immediately.
- [ ] Audit log filters by actor and action correctly; CSV export opens in a spreadsheet.
- [ ] Deleting a workspace requires typing its name and cascades correctly.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
