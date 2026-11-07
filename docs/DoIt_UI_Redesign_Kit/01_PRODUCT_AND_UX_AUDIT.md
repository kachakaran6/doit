# DoIt — Product and UX Audit

## 1. Product intent

DoIt should feel like a polished, professional productivity and QA collaboration tool—not a collection of unrelated screens. Its core use case is helping a team member capture tasks, bugs, voice notes, and sticky notes quickly, then organize and resolve them.

## 2. Current screen coverage observed in the reference archive

The 38 screenshots cover:
- Home dashboard, workspace switcher, account menu
- Tasks list, Today filter, Kanban board, project switcher
- Task detail and scrolled telemetry
- Bug queue, filtered queue, bug detail and telemetry
- Sticky board and sticky detail sheet
- Search empty/results states
- Notifications inbox and pending sync outbox
- Team members
- Quick Capture: task, bug, voice, sticky modes
- Settings, appearance/cache, diagnostics
- Component gallery and design-token gallery
- Invitation acceptance, project context, quick-capture preferences
- AI provider settings and quick-capture guide

Treat these as required product coverage. Do not drop a screen just because it is secondary.

## 3. Main UX risks to resolve

### Visual hierarchy
- Establish clear page titles, supporting context, section headings, and primary actions.
- Reduce competing containers and nested cards.
- Use typography and spacing—not extra borders and colors—to communicate hierarchy.
- Make metadata secondary to task names and primary actions.

### Surface and color consistency
- Define semantic surface levels and use them consistently.
- Avoid near-identical dark surfaces that make the interface muddy.
- Ensure light and dark themes are both intentionally designed, not simple inversions.
- Keep accent color restrained and reserve it for selected states, primary actions, and meaningful emphasis.

### Navigation
- Retain the floating bottom navigation concept.
- Remove any unwanted full-width white/opaque background or separate bar behind the floating navigation.
- The floating navigation must have a clear safe-area offset, consistent width, balanced icon/label alignment, and visible selected state.
- Ensure content is not obscured by the navigation or quick-action button.

### Forms and quick capture
- Quick Capture is a signature workflow. It must be fast, compact, and reliable.
- Make mode switching between Task, Bug, Voice, and Sticky obvious.
- Provide project and label selection in Quick Capture where relevant.
- Project/label options should respect user preferences and available workspace permissions.
- Do not make users configure a project repeatedly if a valid default is available.
- Support keyboard-visible and keyboard-hidden layouts without clipping the submit action.
- Show validation, upload progress, success, failure, and retry states.

### Empty, loading, and error states
- Design every screen for populated, empty, loading, offline, and failure conditions.
- Avoid blank black screens, unexplained spinners, or generic error text.
- Invitation-unavailable and missing-context cases must explain the issue and provide a useful recovery path.

### Interaction quality
- Use consistent touch targets, pressed/disabled states, haptics only where appropriate, and predictable sheets.
- Avoid animation that delays task entry or makes the app feel decorative.
- Respect reduced-motion settings where practical.

## 4. Design principles

1. **Plain, calm, precise:** visual restraint and readable information.
2. **Content first:** tasks, bugs, and notes are the main event.
3. **One clear primary action:** avoid multiple competing filled buttons.
4. **Progressive disclosure:** advanced telemetry and diagnostics stay available without overwhelming everyday workflows.
5. **Consistent patterns:** the same action, field, sheet, and status should look and behave the same everywhere.
6. **Fast capture:** minimize taps and preserve draft content.
7. **Trustworthy feedback:** every save, sync, upload, and failure has a clear state.

## 5. What must not happen

- Do not redesign by changing only colors, radii, or shadows.
- Do not replace the entire app architecture without evidence it is necessary.
- Do not remove existing functionality or silently change business rules.
- Do not create fake data or hard-coded screens to imitate the screenshots.
- Do not introduce a second design system or inconsistent one-off components.
- Do not use excessive gradients, neon colors, glow, glassmorphism, emoji icons, or decorative illustrations.
- Do not add new dependencies unless the current stack cannot reasonably support the requirement.
