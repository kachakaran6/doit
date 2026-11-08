# DoIt — Critical UI and Task Workflow Fix Prompt

You are a senior React Native + Expo engineer working on the existing DoIt application. Fix the issues below in the actual codebase. Do not merely describe solutions or redesign unrelated screens.

## Context
- Mobile: React Native + Expo
- Backend: NestJS
- Database: PostgreSQL
- Authentication: existing JWT implementation
- Preserve the existing architecture, API contracts, navigation, and current design system.
- Use the supplied screenshots as exact reproduction references.

## 1. Fix task completion checkbox — critical

### Current bug
On the Home screen, tapping the circular checkbox beside a task does not mark the task as done.

### Required investigation and fix
1. Trace the checkbox press through its callback, state/store/query mutation, API service, and NestJS endpoint.
2. Identify the actual root cause. Do not add a visual-only toggle.
3. Confirm the correct completion field and allowed status values from the existing backend entity, DTO, service, and API. Do not guess field names or invent endpoints.
4. Update the task using the existing supported API.
5. Use optimistic UI only if it can be safely rolled back on failure.
6. On API failure, restore the previous state and show a clear retry/error message.
7. Refresh or invalidate relevant task queries so Home, Tasks, Today, project views, and Task Detail remain consistent.
8. Prevent duplicate submissions and handle rapid taps safely.
9. Respect existing rules for completed tasks and filters.
10. Verify persistence after navigating away and restarting the app.

### Acceptance criteria
- Tapping an incomplete task checkbox marks it complete in both backend and UI.
- Reopening a completed task works if supported by the existing product/API.
- Failed requests never leave a task falsely marked complete.
- No unrelated task fields are overwritten.

## 2. Fix bottom sheets — last actions are clipped or hidden

### Current bug
In the Account/Profile and Workspace Switcher bottom sheets, the last option/action is partly hidden or unreachable. The floating bottom navigation is also visible behind/over the sheet and competes with the sheet content.

### Required fix
1. Inspect the actual sheet implementation (native modal, custom view, or bottom-sheet library).
2. Correct sheet height, content sizing, scroll behavior, and safe-area handling.
3. Make content vertically scrollable when it exceeds available height.
4. Apply bottom padding using the device bottom safe-area inset plus sensible spacing.
5. Ensure the final row/action can be fully scrolled into view and tapped on small and large Android devices.
6. Ensure the keyboard does not cover focused fields or primary actions.
7. While a modal sheet is open, the underlying floating bottom navigation and floating quick-add button must not render above it or receive touches. Fix modal stacking/presentation correctly; do not use arbitrary huge z-index values.
8. Keep backdrop dimming and dismissal behavior consistent.
9. Prevent scrolling and dismissal gestures from conflicting.
10. Do not permanently remove the floating navigation; it should return when the sheet closes.

### Acceptance criteria
- Every option in both sheets is visible and reachable.
- The last row is not clipped by the screen edge or system navigation bar.
- Floating navigation never overlays the sheet.
- Works with Android gesture navigation and 3-button navigation.

## 3. Add workflow status editing to Task Detail

### Current gap
Task Detail has no clear way to change workflow status, such as Backlog, To do, In progress, or Done.

Use the exact status values supported by the backend. If the backend uses different names or has additional states, map the UI labels to those real values. Never invent incompatible statuses.

### Required UI
1. Add a clearly visible **Status** control near the task title or primary metadata.
2. Display the current status as a compact, readable selector.
3. Tapping it opens a polished selection menu or bottom sheet containing all valid statuses.
4. Clearly indicate the currently selected status.
5. Selecting a status updates the task through the existing API and refreshes all relevant screens.
6. Show loading/disabled feedback during save and clear error feedback on failure.
7. Do not require opening a full edit form just to change status.
8. Support both light and dark themes and accessibility.

### Important: status is not the same as labels
- **Status** = workflow stage (Backlog, To do, In progress, Done, etc.).
- **Labels** = user-defined tags/categories attached to a task.

If the app already supports user-defined labels, also add a proper label editor in Task Detail:
- Show assigned labels.
- Allow adding/removing labels using the existing label API/data model.
- Do not replace the status selector with a label picker.
- Do not hard-code fake labels. Only use real available labels.

## 4. Preserve the existing visual language

Make these fixes feel native to DoIt:
- Minimal, professional, clean layout.
- Consistent spacing, typography, icons, and corner radii.
- Proper light and dark theme support.
- No neon colors, glow, heavy gradients, or unnecessary nested cards.
- Keep floating bottom navigation on normal screens.
- Reuse existing icon and bottom-sheet components where appropriate.
- Respect safe areas and minimum touch target sizes.

## 5. Required engineering workflow

Before editing:
1. Locate the Home task row/checkbox component.
2. Trace task completion all the way to the backend.
3. Locate Account/Profile and Workspace Switcher sheet components.
4. Locate Task Detail and inspect task status/label models and API support.
5. Record the root cause of each issue.

Then implement the fixes in the existing architecture. Do not stop after providing an audit or plan.

## 6. Test and verify

Add or update tests for:
- Checkbox completion success.
- Checkbox API failure and rollback.
- Reopen behavior if supported.
- State synchronization across Home, Tasks, and Task Detail.
- Workspace Switcher scrolling and final-row visibility.
- Account/Profile sheet scrolling and final-action visibility.
- Floating navigation hidden/blocked behind sheets and restored after dismissal.
- Status selection and persistence.
- Label add/remove if implemented.

Manually verify on Android:
- Small and typical phone viewports.
- Gesture navigation and 3-button navigation.
- Light and dark themes.
- Sheets with enough content to require scrolling.

Run the project's existing TypeScript, lint, tests, and Expo build/export commands. Report actual results; never claim a check passed if it was not run.

## 7. Final response required

When finished, report:
1. Root cause of the checkbox bug.
2. Root cause of clipped bottom-sheet actions.
3. How status editing was implemented and which real backend statuses are supported.
4. Whether label editing is supported and how it works.
5. Files changed.
6. Tests/build commands run and their real results.
7. Remaining backend limitations or unresolved issues.

**Do not make unrelated redesign changes. Fix these three workflows completely and verify them end to end.**
