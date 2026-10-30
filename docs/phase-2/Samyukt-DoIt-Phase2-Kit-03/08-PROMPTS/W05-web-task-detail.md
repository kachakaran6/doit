# W05 — Task Detail Drawer

**Lane** W · **Depends on** W04 · **Branch** `feat/w05-web-task-detail`

## Load
- `09-PHASE2-RULES.md`
- `02-WEB-ARCHITECTURE.md` §2.3, §2.4
- `06-API-CONTRACT.md` (Phase 1) §6.4
- `02-FEATURE-SPEC.md` (Phase 1) F3, F9

## Goal
The detail view where a dev actually reads a bug. A route-driven drawer, not a modal.

## Deliverables
- `features/tasks/` — `TaskDrawer`, `TaskHeader`, `TaskProperties`, `DescriptionEditor`,
  `ChecklistBlock`, `CommentList`, `CommentComposer`, `ActivityFeed`, `AttachmentGrid`
- `features/bugs/` — `BugContextCard`, `SeverityPicker`, `StepsEditor`
- route `/p/:projectKey/task/:number` opening the drawer over the board
- inline editing for title and description (click to edit, `Esc` to cancel, `⌘Enter` to save)
- markdown rendering, sanitised

## Requirements
- The drawer is a **route**: deep-linkable, back-button correct, and the board behind it keeps
  its scroll position.
- Read-only "Captured automatically" card for bug context (device, OS, app under test, build,
  timestamp), visually separated from editable fields — same treatment as mobile.
- Attachments: image grid with lightbox, video with a native player, audio with a waveform
  player, files with a download link. Drag-and-drop upload into the drawer.
- Comments: optimistic post, edit/delete per permission, `@mention` autocomplete over workspace
  members.
- Activity: paginated, grouped by day, human-readable ("Alice changed status to Done").
- Markdown: `DOMPurify` sanitised, links open in a new tab with `rel="noopener noreferrer"`.
- `⌘Enter` submits the focused composer; `Esc` closes the drawer and returns focus to the card.

## Do not
- Do not render user HTML without sanitising it.
- Do not lose an in-progress comment when the drawer closes — draft it to local state.
- Do not implement a second copy of the bug context card for mobile-shaped layouts.

## Acceptance checks
- [ ] `/p/SMP/task/42` opens the drawer directly; refresh keeps it open.
- [ ] Editing the title updates the card behind it without a refetch.
- [ ] A bug shows device/OS/app/build captured automatically and they are not editable.
- [ ] Post a comment → appears instantly → survives a refresh.
- [ ] Drag an image into the drawer → uploads → thumbnail appears.
- [ ] `@mention` autocompletes from workspace members.
- [ ] Malicious markdown (`<img onerror=...>`) renders inert.
- [ ] `Esc` closes the drawer and focus returns to the originating card.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
