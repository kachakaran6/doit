# P17 — Notifications, Settings, Polish

**Lane** B · **Depends on** P16 · **Branch** `feat/p17-notifications-settings-polish`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F12, F16
- `03-DESIGN-SYSTEM.md` (all)

## Goal
Finish the product surface: push + local notifications, the full settings screen, and a polish
pass that makes every screen feel like the same app.

## Deliverables
- API: `modules/notifications/` (FCM send, device registration, read state)
- mobile: `src/features/notifications/` (inbox screen, permission rationale, deep-link handling)
- mobile: `src/features/settings/` — theme, accent (5 swatches), default project, voice language,
  shake sensitivity, bubble toggle + permission status, capture quality, storage usage with
  clear-cache, session list with revoke, sign out, about
- a polish pass across all screens: consistent header, consistent empty/loading/error, consistent
  haptics, consistent press feedback
- `src/app/dev/ComponentGallery.tsx` updated with anything new

## Requirements
- Push permission is requested only after the first successful task create, preceded by a
  one-screen rationale. If denied, everything still works via local notifications.
- Local notifications: due-today at 09:00 local, overdue reminder at 18:00. Scheduled with
  `notifee` (or the platform equivalent), rescheduled on app foreground.
- Notification tap → deep link → the item opens and is marked read.
- Settings persist immediately (no Save button) and apply live (theme/accent change instantly).
- Storage screen shows bytes used by cache, attachments and outbox, with per-category clear.
- Polish checklist applied to every screen: header style, back affordance, title truncation at
  one line, keyboard dismissal on scroll, safe-area padding, `testID` on primary actions.

## Do not
- Do not add settings for things that aren't implemented.
- Do not use a modal for settings — it is a full screen with the floating navbar hidden.
- Do not send marketing pushes.

## Acceptance checks
- [ ] Push arrives for "assigned to you" and deep-links correctly on both platforms.
- [ ] Denying notification permission leaves the app functional and the setting shows "Blocked"
      with a link to system settings.
- [ ] Changing accent in settings updates the navbar, buttons and chips immediately.
- [ ] Session list shows both devices; revoking the other one logs it out on next request.
- [ ] No screen shows a raw error string or a spinner where a skeleton belongs.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
