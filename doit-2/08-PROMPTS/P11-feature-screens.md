# P11 — Feature Screens — Tasks, Stickies, Bugs, Home

**Lane** B · **Depends on** P04, P06, P09, P10 · **Branch** `feat/p11-feature-screens`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F3, F4, F5, F9, F16
- `03-DESIGN-SYSTEM.md` (all)
- `04-ARCHITECTURE.md` §4.4 (the template — obey it exactly)
- `06-API-CONTRACT.md` §6.4–6.6

## Goal
Build the real app screens against the real API, using the feature-folder template. This is the
largest UI prompt; it also creates `src/features/_template` so all future features are copies.

## Deliverables
- `src/features/_template/` with every file from `04-ARCHITECTURE.md` §4.4, including a
  `README.md` that explains each file in two lines
- `src/features/tasks/` — list (My Day / Inbox / Upcoming / Board), detail, create/edit sheet
- `src/features/stickies/` — grid board, create, convert-to-task
- `src/features/bugs/` — bug queue, bug detail with auto-context block, severity picker
- `src/features/home/` — the dashboard matching the reference screenshot: workspace chip header,
  project card, "Your work" section, "Recent activity", "Stickies" empty state, FAB
- `src/components/patterns/` — `TaskRow`, `BugRow`, `StickyCard`, `DueDatePicker`,
  `LabelPicker`, `PriorityPicker`, `SeverityPicker`, `AssigneePicker`, `FilterBar`
- `src/lib/http.ts`, `src/lib/queryClient.ts`, `src/features/auth/` (login screen + session)
- tests: render + empty + error for each list screen

## Requirements
- Every screen follows the four-state contract (loading skeleton / empty / error / data).
- Lists use FlashList with `keyExtractor`, `estimatedItemSize`, and pull-to-refresh that
  invalidates only the relevant keys.
- Optimistic create everywhere: the item appears instantly, marked pending, reconciled on
  success, marked failed with a retry affordance on error.
- The task create sheet requires only a title; due/priority/label/assignee are single-tap rows.
- Board view: horizontal columns with drag between them (Reanimated + Gesture Handler), status
  change on drop, snap-back on API failure with a toast.
- Sticky grid: 2 columns, deterministic rotation per §3.5, long-press menu
  (pin / recolour / convert / delete).
- Bug detail shows a read-only "Captured automatically" card with device, OS, app under test,
  build, timestamp — clearly separated from editable fields.
- Search screen with recent searches and operator chips.
- Home screen must visually match the reference: dark, flat, hairline separators, muted
  section eyebrows, isometric empty state, floating pill navbar.

## Do not
- Do not create screens outside `src/features/`.
- Do not write a single hex colour, magic spacing number, or raw `<Text>`.
- Do not build the capture overlay or voice recording UI here (P12/P08 own those) — stub the
  capture sheet entry point.
- Do not add a web build.

## Acceptance checks
- [ ] A tester can log in, browse My Day, create a task with a due date and two labels,
      complete it, and see it move — end to end against the real API.
- [ ] Every list screen shows the correct empty state when the API returns `[]`.
- [ ] Killing the network mid-create shows the pending → failed → retry flow, and retry works.
- [ ] `src/features/_template` exists and a throwaway feature created by copying it compiles
      with no changes other than names.
- [ ] No file under `features/` or `screens/` contains `#` followed by 6 hex chars (CI script).
- [ ] Screen transitions are 60 fps on a mid-range device.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
