# P15 — Home-Screen Widgets

**Lane** A · **Depends on** P12 · **Branch** `feat/p15-home-widgets`

## Load
- `09-AGENT-RULES.md`
- `02-FEATURE-SPEC.md` F10
- `12-NATIVE-CAPABILITIES.md` (widgets)
- `04-ARCHITECTURE.md` §4.6

## Goal
One-tap task capture from the home screen, on both platforms.

## Deliverables
- Android: Glance widget (`2×1` quick-add, `4×2` today) + a native module that writes into the
  shared outbox
- iOS: WidgetKit extension (`systemSmall` quick-add via App Intent, `systemMedium` today list)
- `src/native/widget/index.ts` bridge: `updateWidgetData()`, `refreshWidget()`
- app-side sync: push today's counts and the 3 nearest tasks into the widget's shared store on
  every relevant query invalidation

## Requirements
- Quick-add writes to the same offline outbox as the app; the widget never blocks on network
  and never shows a spinner.
- Widget respects the active theme and accent (read from MMKV via the shared App Group /
  SharedPreferences).
- Tapping a task deep-links to that task, not the app root.
- Today widget shows: count of due-today, overdue badge in `danger`, top 3 tasks with checkbox.
- Checking a task from the widget completes it optimistically and syncs.
- Update cadence: on app background, on data change, and at midnight (daily rollover). No
  background polling.

## Do not
- Do not build a widget larger than 4×2.
- Do not require the app to be open for quick-add to work.
- Do not duplicate business logic in the widget — it calls the same outbox module.

## Acceptance checks
- [ ] Android: add the 2×1 widget, force-stop the app, add a task from the widget → it appears
      in the app on next launch, exactly once.
- [ ] iOS: quick-add App Intent works from the widget and from Siri.
- [ ] Widget shows dark theme correctly after switching the app theme.
- [ ] Tapping a widget task opens that task's detail screen.
- [ ] No battery regression (widget refresh count per hour ≤ 4).

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
