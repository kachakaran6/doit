# DoIt Mobile UI/UX Redesign Kit
## Tasks, Bug Tracker, and Detail Screens

**Platform:** React Native + Expo  
**Backend:** Existing NestJS backend — preserve it  
**Primary goal:** Replace the current visually heavy, inconsistent mobile screens with a compact, polished, professional task and bug-tracking experience.

---

## 1. Instructions to the implementation agent

Treat this document and the three screenshots in `reference_screenshots/` as the design brief.

**Do not make a superficial restyling pass.** First inspect the existing app, navigation, reusable components, theme system, API integration, and current screen behavior. Then redesign the affected screens as one coherent product experience.

### Non-negotiable constraints

- Keep the existing React Native + Expo application.
- Keep the existing NestJS backend, API contracts, database schema, authentication, and authorization.
- Do not replace working features with mock data or hard-coded UI.
- Do not remove or silently disable any existing action.
- Preserve task and bug creation, editing, deletion/trash, status changes, priority/severity changes, labels, project selection, attachments, comments/description, AI prompt generation, copy/save/regenerate, resolution, and quick capture wherever currently supported.
- Keep all existing navigation destinations and deep links working.
- Do not introduce a new state-management or navigation library unless the project genuinely requires it.
- Reuse the current architecture and dependencies where practical. Avoid adding unnecessary packages.
- Do not change backend behavior to compensate for a frontend layout issue.
- Do not invent new product functionality. If a control currently has no working implementation, report it rather than presenting a fake working control.
- Support both light and dark themes. Respect the app's existing theme/accent settings.
- Test on a real Android device or emulator with small and large screen sizes.

**Definition of success:** The app looks intentionally designed, feels compact and calm, and every existing workflow still works.

---

## 2. Current UI problems shown in the references

Review all three images before implementation.

### Reference 01 — Task detail

`reference_screenshots/01-task-detail-current.jpg`

Observed problems:
- The top area consumes too much vertical space.
- The task identifier and title are oversized and visually disconnected.
- Status appears more than once without a clear reason.
- Metadata is presented in a large, heavy card.
- The attachment preview is oversized relative to its importance.
- The AI solution-prompt area occupies a huge amount of screen space despite showing very little content.
- There is too much empty space and weak information hierarchy.

### Reference 02 — Bugs list

`reference_screenshots/02-bugs-list-current.jpg`

Observed problems:
- The page heading and filter area use excessive vertical space.
- Bug rows are large cards with too much padding.
- Status and severity indicators compete for attention.
- Repeated rounded containers make the page look inflated.
- The bottom navigation and floating action button need more deliberate positioning and consistent spacing.
- The explanatory telemetry panel is too large for a list screen.

### Reference 03 — Bug detail

`reference_screenshots/03-bug-detail-current.jpg`

Observed problems:
- The bug ID, status, and title are spread across too many vertical sections.
- Project, reported date, and status use a large summary card.
- Severity controls are oversized.
- Description is isolated in another large card.
- The AI solution prompt is a large empty workspace with controls pushed to the bottom.
- Screenshots/attachments and destructive/resolve actions are not organized into a compact action hierarchy.
- The page feels like a stack of unrelated cards rather than one coherent issue detail view.

---

## 3. Product design direction

Aim for a **quiet, precise, information-dense productivity interface**.

Use the following as inspiration for interaction quality and information hierarchy — do not copy their branding or exact screens:
- Linear: issue hierarchy, compact metadata, keyboard-like action clarity.
- Things 3: calm spacing and typography.
- Todoist: understandable task organization and quick status changes.
- Modern native Android apps: predictable navigation, touch targets, safe-area behavior.

### Visual principles

1. **Content first:** the task or bug title is the primary content.
2. **Compact, not cramped:** remove wasteful space without making touch targets too small.
3. **Flat hierarchy:** use page background, subtle separators, and only a few meaningful surfaces. Avoid wrapping every field in a card.
4. **One clear primary action:** each screen should make the most relevant next action obvious.
5. **Consistent components:** status, priority, severity, labels, metadata, and action menus should look and behave the same throughout the app.
6. **No decorative noise:** no gradients, neon/glow effects, excessive shadows, random accent colors, or decorative badges.
7. **Useful density:** show more meaningful content above the fold.
8. **Native-feeling behavior:** smooth scrolling, stable bottom navigation, proper keyboard handling, and safe-area insets.

---

## 4. Global layout and navigation rules

### Screen header

Remove the oversized, repeated screen-name header pattern.

Use a compact contextual top bar:
- Leading: back button when the screen is a detail/subscreen; otherwise the screen's primary navigation context.
- Center/leading content: a compact title or breadcrumb only when it helps orientation.
- Trailing: one or two relevant actions, such as overflow menu, search, or create.
- Keep the top bar height consistent across screens.
- Do not render a second large page title immediately below the top bar when it repeats the same information.
- On detail screens, the task/bug title belongs in the content header, not duplicated as a giant app-bar title.

For root tabs, use a compact heading row and place filters directly below it. Avoid a tall hero header.

### Floating bottom navigation

- Keep the existing floating navigation concept; do not add a second conventional bottom tab bar behind it.
- Ensure there is only one visible navigation surface.
- Use a consistent width, height, radius, elevation, and horizontal inset.
- Keep the floating navigation above the system gesture/navigation area using safe-area insets.
- Add enough scroll-content bottom padding so the last row/action is never hidden behind it.
- The floating action button must not collide with the navigation bar or content.
- Avoid a white/gray rectangle or background layer appearing behind the floating navigation.
- Use a subtle border and restrained elevation only if needed for separation.
- Test light and dark themes.

### Safe areas and scrolling

- Use `react-native-safe-area-context` if it is already installed; otherwise use the app's existing safe-area approach.
- Do not hard-code status-bar or bottom inset heights.
- Each screen should have one clear scroll owner. Avoid nested vertical scroll views unless necessary.
- Ensure bottom sheets and menus remain fully visible above the keyboard and system navigation.
- Verify the last item in every bottom sheet can be reached and tapped.

---

## 5. Design tokens

Use the app's existing theme/accent configuration as the source of truth. Consolidate duplicated values into shared tokens instead of introducing unrelated colors.

Suggested baseline tokens (adapt to the existing palette):

| Token | Light theme | Dark theme |
|---|---|---|
| `background` | `#F7F7F8` | `#111214` |
| `surface` | `#FFFFFF` | `#1A1C1F` |
| `surfaceSubtle` | `#F0F1F3` | `#22252A` |
| `textPrimary` | `#17181B` | `#F4F4F5` |
| `textSecondary` | `#686B73` | `#A1A4AD` |
| `border` | `#E5E6E9` | `#30333A` |
| `accent` | Existing selected app accent | Existing selected app accent |
| `danger` | `#C83B3B` | `#F06A6A` |
| `success` | `#23845B` | `#55B98A` |
| `warning` | `#A66A18` | `#D6A04D` |

Do not force the suggested accent if the user has selected another supported app accent.

### Spacing scale

Use a consistent 4-point spacing rhythm:
- `4`: icon-to-label or micro spacing
- `8`: compact internal spacing
- `12`: standard component spacing
- `16`: screen horizontal inset and section spacing
- `20`: major section separation
- `24`: only for distinct major groups

Avoid arbitrary values scattered across components.

### Radius and elevation

- Small controls: 10–12
- Standard surfaces: 14–16
- Floating navigation: existing design-system radius, consistently applied
- Prefer borders and tonal surface differences over large shadows.
- Avoid a card inside a card inside another card.

### Typography

Create a small type scale and use it consistently:
- Screen title: 22–24, semibold
- Detail title: 22–26, semibold; allow 2–3 lines
- Section label: 12–13, medium, secondary color
- Body: 14–16, regular
- Metadata: 12–13, regular
- Button: 14–15, semibold

Do not use all-caps labels everywhere. Use sentence case for most labels.

---

## 6. Tasks list screen

Redesign the task list to be compact and scannable.

### Recommended structure

1. Compact header: `Tasks` plus count if useful.
2. Project/workspace selector in a small secondary row.
3. Search and filter controls.
4. Status filters as a compact segmented row or horizontally scrollable chips.
5. Task list.
6. Existing floating navigation and create action.

### Task row

Each task should be a compact row, not a large card:
- Optional completion checkbox.
- Task title (primary).
- One secondary metadata line: project, due date, or label — show only what is useful and available.
- Priority indicator should be subtle.
- Optional status/assignee metadata only when it adds value.
- Overflow menu for secondary actions.

Behavior:
- Tapping the row opens task detail.
- Tapping the checkbox completes/reopens the task immediately, with appropriate loading/error handling.
- Avoid making the entire row and checkbox trigger the same action.
- Support long titles without breaking layout.
- Use separators or subtle grouped surfaces instead of a large card per task.

---

## 7. Task detail screen

This is a priority screen. Rebuild its hierarchy rather than merely reducing padding.

### Recommended information order

**A. Compact navigation row**
- Back.
- Optional task ID in small secondary text.
- Overflow menu or delete action.

**B. Task heading**
- Title as the main visual focus.
- Editable title behavior must remain intact.
- Avoid displaying the same status twice in the header and metadata section.

**C. Inline property editor**
Use compact property rows or a clean two-column/flow layout:
- Status
- Priority
- Project
- Labels
- Due date
- Assignee, if supported

Show only fields that exist for the task. Make each property clearly tappable and accessible. Do not put every property inside a large card.

**D. Description**
- Show the description directly below the properties.
- If empty, show a subtle `Add description` affordance rather than a large empty placeholder card.
- Preserve editing and save behavior.

**E. Attachments**
- Use compact thumbnails or a horizontal attachment strip.
- Display filename and file size in secondary text where appropriate.
- Tapping opens the existing preview behavior.
- Do not let one attachment dominate the whole screen.

**F. Related content**
- Comments, activity, subtasks, or other existing sections should be grouped logically.
- Keep section headers compact and consistent.

**G. AI solution prompt**
- Make it a collapsible or compact section.
- Before generation, show a short explanation and a clear `Generate solution` action.
- After generation, show the generated text in a readable content area.
- Keep Save, Copy, and Regenerate actions close to the generated content.
- Do not reserve a huge blank area when no prompt exists.
- Preserve image inclusion and task-context assembly if currently supported.
- Clearly communicate that selected context/images may be sent to the configured AI provider and may incur charges, using concise helper text.

---

## 8. Bugs list screen

The bug list should behave like a professional issue tracker.

### Recommended structure

**Header**
- Compact `Bugs` title and count.
- Project/workspace selector as a small secondary control.
- Search/filter action.

**Severity filters**
- Compact horizontally scrollable filters: All, Critical, Major, Minor, Trivial.
- Show counts in a restrained way.
- Selected state should use a subtle tinted surface and text treatment, not oversized pills.
- Preserve current filter behavior and counts.

**Bug row**

Use a compact issue row with:
- Bug ID and reported time as quiet metadata.
- Bug title as the main text.
- Small severity marker/label.
- Status as secondary metadata, not a large badge on the far right unless space permits.
- Optional thumbnail only when a screenshot exists.
- Consistent row height based on content, not a fixed oversized card.

Do not show the same severity/status information in multiple places.

### Instant Bug Telemetry panel

- Move telemetry explanation into a compact info panel, collapsible section, or secondary entry point.
- Keep `Report bug` and `Shake settings` available.
- Do not let the telemetry explainer take more visual space than the actual bug list.
- Keep the shake-to-capture feature and its permission/settings flow unchanged.

---

## 9. Bug detail screen

Treat a bug as an issue record with a clear, compact structure.

### Recommended information order

**A. Compact top row**
- Back.
- Bug ID.
- Overflow menu.

**B. Title**
- Bug title, readable and editable if currently supported.
- Status displayed once, with a compact status control.

**C. Metadata**
Show project, reported date, reporter/device metadata only when available. Use compact inline metadata, not a large three-column card.

**D. Severity**
- Compact segmented control or a small property row.
- Keep Critical, Major, Minor, and Trivial.
- Selected state must be clear in both themes.
- Ensure the whole control remains tappable and accessible.

**E. Description and diagnostics**
- Description first.
- If no written description exists, use a short muted empty state.
- Device diagnostics, logs, memory, battery, and other telemetry should be in a collapsible `Device diagnostics` section.
- Do not dump a long diagnostic payload into the primary reading flow.

**F. Screenshots and attachments**
- Compact thumbnail strip or preview.
- Empty state should be one concise line with an action to capture/attach if supported.
- Tapping a thumbnail opens the existing viewer.

**G. AI solution prompt**
- Same shared component and behavior as task detail.
- Compact when empty; readable when generated.
- Keep generation, save, copy, regenerate, assemble-from-bug, and image inclusion behavior intact where supported.

**H. Bottom actions**
- `Mark as resolved` should be the primary action when the bug is unresolved.
- Move to trash/delete belongs in the overflow menu or a clearly separated destructive action area.
- Do not make destructive actions visually compete with the primary action.
- Confirm destructive operations using the existing confirmation pattern.

---

## 10. Shared component system

Build or consolidate reusable components. Follow the existing project conventions and avoid creating a large, confusing folder hierarchy.

Suggested small, understandable component set:

- `ScreenContainer`
- `CompactHeader`
- `PropertyRow`
- `StatusSelector`
- `PrioritySelector`
- `SeveritySelector`
- `LabelSelector`
- `TaskListItem`
- `BugListItem`
- `SectionHeader`
- `AttachmentStrip`
- `EmptyState`
- `InlineAction`
- `AIResolutionPanel`
- `FloatingNavigation`

Keep components close to the relevant feature if that matches the current architecture. Do not create abstractions for one-off elements without a clear reuse case.

**Important:** Task detail and bug detail should share the same property, attachment, and AI panel patterns wherever the behavior is the same.

---

## 11. Interaction and accessibility requirements

- Minimum touch target should be approximately 44–48 dp, even when the visual control is compact.
- Every icon-only action needs an accessibility label.
- Ensure text contrast is readable in light and dark themes.
- Avoid relying on color alone to communicate status or severity.
- Add clear pressed, disabled, loading, and error states.
- Prevent accidental double submissions.
- Use optimistic updates only if the current data layer supports safe rollback.
- Show a useful error if an API update fails; do not leave the UI pretending it succeeded.
- Keep keyboard dismissal, input focus, and bottom-sheet behavior predictable.
- Respect Android back behavior and hardware back button.
- Avoid layout shifts when loading or changing status.

---

## 12. Implementation workflow

Work in this order:

### Phase 1 — Audit before editing
1. Inspect the current screen files and navigation.
2. Identify the existing theme tokens and shared components.
3. Map each visible control to its current handler/API call.
4. Record existing behavior that must not regress.
5. Identify duplicated headers, cards, and property components.

### Phase 2 — Establish the design foundation
1. Consolidate spacing, typography, color, border, and radius tokens.
2. Fix the screen container and safe-area handling.
3. Fix floating navigation and bottom content insets.
4. Create/reuse compact header and property components.

### Phase 3 — Redesign screens
Recommended order:
1. Bug detail.
2. Task detail.
3. Bugs list.
4. Tasks list.
5. Other screens that share the same header/property patterns.

### Phase 4 — Functional verification
Test:
- Task create, open, edit, complete, reopen, status change, priority change, label change, project change, attachment preview, delete/trash.
- Bug create/report, open, severity change, status change, diagnostics, screenshot preview, AI prompt actions, resolve, trash.
- Search, filters, project selection, navigation, quick capture, shake capture.
- Dark/light theme and every configured accent.
- Long titles, empty descriptions, no attachments, many attachments, loading states, API failures.
- Small screen, large screen, keyboard open, bottom sheet open, and Android system navigation.

### Phase 5 — Cleanup
- Remove obsolete styles/components only after confirming they are unused.
- Remove dead code introduced by the redesign.
- Do not reorganize the entire repository.
- Run the project's lint, type-check, and build commands.
- Fix all regressions before declaring completion.

---

## 13. Acceptance checklist

The work is not complete until all applicable items pass.

### Visual quality
- [ ] No oversized repeated screen-name header.
- [ ] No duplicated status or metadata.
- [ ] Task and bug detail screens have clear hierarchy.
- [ ] Lists show more useful rows above the fold.
- [ ] Excessive cards and empty vertical space are removed.
- [ ] AI panel is compact when empty and useful when populated.
- [ ] Floating navigation has no unwanted background layer behind it.
- [ ] Bottom actions and bottom-sheet options are not clipped.
- [ ] Light and dark themes are visually consistent.
- [ ] No neon, glow, excessive gradients, or decorative visual noise.

### Functionality
- [ ] Existing API integrations remain unchanged and working.
- [ ] Every existing action still works.
- [ ] Status, priority, severity, and labels persist correctly.
- [ ] Attachments open correctly.
- [ ] AI generation and prompt actions retain their behavior.
- [ ] Resolve and trash actions work correctly.
- [ ] Search, filters, navigation, and quick capture still work.
- [ ] Loading and error states are handled.

### Engineering
- [ ] No mock data replacing real API data.
- [ ] No unnecessary dependencies.
- [ ] No unnecessary folder restructuring.
- [ ] No backend/database changes.
- [ ] Type-check/lint/build pass.
- [ ] Tested on Android at more than one screen size.

---

## 14. Required final report from the agent

When finished, report:

1. Screens/components redesigned.
2. Shared design tokens/components created or reused.
3. Existing functionality verified.
4. Any functionality that was already broken before the redesign.
5. Commands run and their results.
6. Any remaining issues, with exact file/screen references.

Do not claim the redesign is complete if only the screenshots were visually changed or if any existing interaction stopped working.

---

## Final design instruction

Make DoIt feel like a focused, premium productivity tool: **compact, calm, consistent, precise, and effortless to use.** Prioritize hierarchy and usability over decoration. The screenshots are evidence of what needs to be fixed, not a style to preserve.
