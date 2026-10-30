# 02 — Feature Specification

Priority: **P0** = v1 must ship. **P1** = v1.1. **P2** = later, design for it, don't build it.

---

## F1 — Authentication & Session  (P0)

Email + password. JWT access token (15 min) + rotating refresh token (30 days) stored in the
device keychain/keystore. Multi-device session list with revoke. Sign out everywhere.

**Acceptance**
- [ ] Access token expiry returns `401 TOKEN_EXPIRED`; the client refreshes silently and
      retries the original request once, with no user-visible flicker.
- [ ] Refresh token rotation invalidates the old token; replay of a used refresh token
      revokes the whole session family.
- [ ] Passwords hashed with argon2id. Minimum 8 chars. Login rate-limited to 10/min/IP.
- [ ] A revoked device's next request fails with `401 SESSION_REVOKED` and the app returns to
      the login screen with a message, not a crash.

## F2 — Workspace, Project, Membership  (P0)

A user belongs to one or more workspaces. A workspace has projects. A project holds tasks,
stickies and bug reports. Roles: `OWNER`, `ADMIN`, `TESTER`, `VIEWER`.

**Acceptance**
- [ ] Role matrix enforced server-side on every mutating endpoint (test each role × endpoint).
- [ ] `TESTER` can create tasks/bugs/comments but cannot delete others' items or manage members.
- [ ] Workspace switcher in the app header matches the reference design: avatar chip, name,
      chevron, presence dot.
- [ ] Invites by email with a tokenised deep link; expiry 7 days.

## F3 — Tasks  (P0)

Fields: title, description (plain text with lightweight markdown), status
(`TODO`/`IN_PROGRESS`/`BLOCKED`/`DONE`), priority (`LOW`/`MEDIUM`/`HIGH`/`URGENT`),
due date (+ optional time, timezone-aware), assignee, labels (many), checklist items,
attachments (many), comments, watchers, `createdBy`, `updatedAt`, `completedAt`, `order` (for
drag reordering), `source` (`MANUAL`/`VOICE`/`BUG`/`STICKY`/`WIDGET`).

**Acceptance**
- [ ] Create from a single sheet with only a title required. Everything else is one tap away.
- [ ] Optimistic create: the card appears in the list before the network responds; on failure
      it is marked "failed to sync" and retryable, never silently lost.
- [ ] Checklist completion updates task progress ring; 100% does **not** auto-close the task.
- [ ] Drag-to-reorder persists `order` and is stable across devices (fractional indexing).
- [ ] Filtering by status/priority/label/assignee/due-window and full-text search on title +
      description (Postgres `tsvector`), combinable, and reflected in the URL state object so
      it survives navigation.

## F4 — Views  (P0)

`My Day` (assigned to me + due today/overdue), `Inbox` (unassigned or newly captured),
`Upcoming` (next 14 days grouped by day), `Board` (kanban by status, per project),
`All tasks` (list with filters), `Bugs` (bug-only queue with severity).

**Acceptance**
- [ ] Every view shares one list-row component and one empty-state component.
- [ ] Empty states use the isometric illustration style shown in the reference screenshot,
      with one primary action.
- [ ] Pull-to-refresh invalidates the correct query keys only (no full-app refetch).

## F5 — Stickies  (P0)

Free-form colour-coded notes on a board. Fields: body, colour (5 accent-derived pastels),
pinned, position, `convertedTaskId`. Actions: pin, recolour, delete, **convert to task**.

**Acceptance**
- [ ] Sticky board is a masonry/grid layout with drag reordering and a subtle ±1.5° rotation
      per card (deterministic from the sticky id, not random on each render).
- [ ] Convert-to-task carries the body into the description and links both ways.
- [ ] Creating a sticky is one tap from the `+` FAB and the text field is focused immediately.

## F6 — Voice Capture & Transcription  (P0)

Record audio (m4a/aac, 44.1 kHz mono, ~64 kbps), live waveform, duration cap 5 min. Two-stage
transcription: on-device recogniser for instant text, server pass for accuracy. Both stored.

**Acceptance**
- [ ] Recording starts in < 200 ms of the tap and works with no network.
- [ ] Audio file is persisted to app storage first, then queued for upload. Losing the network
      mid-recording never loses the recording.
- [ ] Transcript is editable after insertion; the original transcript is kept in
      `VoiceNote.rawTranscript`.
- [ ] Language selector: English, Hindi, Hinglish (auto), Marathi, Tamil, Telugu. Default is
      device locale if supported, else English.
- [ ] If the on-device recogniser is unavailable, the UI shows "Recording saved — will
      transcribe when online" and does exactly that.

## F7 — Quick Capture Overlay (Android)  (P0)

A draggable floating bubble drawn over other apps via `SYSTEM_ALERT_WINDOW`, backed by a
foreground service. Tap → compact sheet with: big mic button, text field, screenshot button,
bug toggle, project picker. The sheet is the *same* component as the in-app capture sheet.

**Acceptance**
- [ ] Bubble is draggable, snaps to an edge, remembers position, and can be hidden/shown from
      a persistent notification.
- [ ] Bubble is invisible during screen recording/sharing of other apps where possible, and
      never appears over the system UI or the lock screen.
- [ ] Service is a `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` (or `dataSync` where applicable) with
      a clear notification; it stops when the user disables the bubble.
- [ ] Tapping the bubble while Samyukt is already foreground does not open a second sheet.
- [ ] Submitting from the bubble returns focus to the app under test within 1 s of tapping Send.

## F8 — Test Session & Shake Capture  (P0 Android / P1 iOS)

A "Test Session" is an explicit, timed mode: tester picks the app under test, grants screen
capture once, and gets shake-to-capture plus automatic context. Session produces a report of
all bugs found, grouped.

**Acceptance**
- [ ] Session start requires one `MediaProjection` consent dialog; the consent is reused for
      the session lifetime (never re-prompted per capture).
- [ ] Shake detection is accelerometer-based, debounced (no double-fire within 1.2 s),
      sensitivity user-configurable, and disabled by default outside a session.
- [ ] On shake: capture screen frame → open capture sheet pre-filled with the screenshot →
      start audio recording immediately (so the tester can just start talking).
- [ ] Session end produces a summary with bug count, severity split, duration, and a
      shareable markdown report.
- [ ] iOS fallback: in-app shake opens the capture sheet with an in-app screenshot; a Share
      Extension accepts screenshots from any app.

## F9 — Bug Reports  (P0)

A bug is a task with `type = BUG` plus a `BugReport` sidecar holding captured context.

**Acceptance**
- [ ] Auto-context fields are read-only in the UI but visible ("captured automatically").
- [ ] Severity picker: `BLOCKER` / `CRITICAL` / `MAJOR` / `MINOR` / `COSMETIC`, each with a
      colour + label, defaulting to a server-suggested value the tester can override.
- [ ] Steps-to-reproduce is a reorderable list; "Add step" inherits the last step's text.
- [ ] Attachments support screenshot, screen recording (mp4, ≤60 s), audio, and any file.
- [ ] Export as markdown via the OS share sheet, including device block and image links.

## F10 — Home-Screen Widget  (P1)

Android App Widget (Glance) + iOS WidgetKit. Two sizes: `2×1` quick-add (mic + text), `4×2`
today's count + top 3 tasks.

**Acceptance**
- [ ] Quick-add writes to the local outbox immediately; the widget never shows a spinner.
- [ ] Widget reflects theme (dark/light) and the active accent colour.
- [ ] Tapping a task deep-links to that task, not to the app root.

## F11 — Theming  (P0)

Dark / Light / Follow system. Five accent colours. Persisted per device.

**Acceptance**
- [ ] Switching theme or accent re-renders instantly with no screen reload and no flash of the
      wrong theme on cold start (theme resolved from storage before first paint).
- [ ] All five accents pass WCAG AA (4.5:1) against their paired surface in both themes —
      the token file documents the contrast ratio for each pair.
- [ ] Zero hardcoded hex values outside `theme/tokens.ts`; enforced by a lint rule in CI.

## F12 — Notifications  (P1)

Local: due-today, overdue. Push (FCM): assigned to you, mentioned in a comment, bug severity
`BLOCKER`/`CRITICAL` in a project you watch.

**Acceptance**
- [ ] Push permission is requested only after the user's first created task, with a
      pre-permission rationale screen.
- [ ] Tapping a notification deep-links to the item and marks it read.

## F13 — Offline & Sync  (P0)

Every mutation goes through an outbox. Attachments queue as pending uploads.

**Acceptance**
- [ ] Airplane-mode create task, create bug with voice, create sticky → all appear locally,
      marked pending; on reconnect all three land server-side exactly once (idempotency keys).
- [ ] Conflict policy: last-write-wins on scalar fields, union on labels/attachments, and a
      visible "changed on another device" banner on the item.
- [ ] Outbox survives app kill and device reboot.

## F14 — Search  (P1)

Global search across tasks, bugs, stickies and comments, with recent searches and
`#label`, `@assignee`, `is:bug`, `due:today` operator support.

## F15 — Activity & Audit  (P1)

Per-item activity timeline and per-project feed: who changed what, when.

## F16 — Settings  (P0)

Theme + accent, default project, voice language, shake sensitivity, bubble on/off, capture
quality, notification preferences, storage usage + clear cache, session list, sign out.

---

## Deferred (design for, don't build)

Recurring tasks · task templates · per-project custom fields · saved filter views · bulk edit ·
CSV import/export · SLA timers · integrations (Slack/Jira two-way) · SSO · web app.
