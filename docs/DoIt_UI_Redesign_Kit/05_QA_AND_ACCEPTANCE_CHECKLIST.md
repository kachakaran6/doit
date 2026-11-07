# DoIt — QA and Acceptance Checklist

Use this checklist during implementation and before declaring the redesign complete.

## 1. Visual consistency
- [ ] Every screen uses the centralized design tokens.
- [ ] Light theme has intentional surface, border, text, and accent contrast.
- [ ] Dark theme has intentional surface separation and readable secondary text.
- [ ] Typography hierarchy is consistent.
- [ ] Spacing follows the shared scale.
- [ ] Buttons, inputs, chips, sheets, and rows are consistent.
- [ ] No unexplained one-off colors, radii, shadows, or icon styles remain.
- [ ] No unwanted full-width background behind floating navigation.
- [ ] No content is obscured by navigation, safe areas, or floating actions.

## 2. Functional regression
- [ ] Login/session restoration still works.
- [ ] Workspace switching works.
- [ ] Account menu actions work.
- [ ] Task create, edit, complete, filter, and detail flows work.
- [ ] Kanban board interactions work.
- [ ] Bug create, edit, filter, and detail flows work.
- [ ] Telemetry remains visible and accurate.
- [ ] Sticky create, edit, and delete flows work.
- [ ] Search returns real results.
- [ ] Notifications actions work.
- [ ] Sync queue reflects actual sync state.
- [ ] Team member and invite flows work.
- [ ] Quick Capture works in all four modes.
- [ ] Project and label selection uses real supported data.
- [ ] Quick Capture preferences persist correctly.
- [ ] Voice recording and upload retry work.
- [ ] Settings, themes, cache, diagnostics, and AI provider actions work.
- [ ] Invitation acceptance handles valid and invalid states.
- [ ] Project context recovery works.

## 3. State coverage
For every asynchronous screen/action, verify:
- [ ] Initial/loading state
- [ ] Populated/success state
- [ ] Empty state
- [ ] Offline state where relevant
- [ ] API/server failure
- [ ] Retry/recovery action
- [ ] Permission denied state where relevant
- [ ] Long text and overflow state

## 4. Device and interaction checks
- [ ] Small Android phone viewport
- [ ] Typical Android phone viewport
- [ ] Large Android phone viewport
- [ ] Gesture navigation safe area
- [ ] Keyboard open and closed
- [ ] Form scrolls to focused field
- [ ] Primary action remains reachable with keyboard open
- [ ] Sheets open, scroll, dismiss, and restore state correctly
- [ ] Screen reader labels exist for icon-only controls
- [ ] Touch targets are sufficiently large
- [ ] Font scaling does not clip important content

## 5. Engineering checks
- [ ] TypeScript check passes.
- [ ] Lint passes.
- [ ] Unit/component tests pass.
- [ ] Critical flow tests pass.
- [ ] Expo export/build passes.
- [ ] No new runtime warnings/errors.
- [ ] No secrets in logs or source.
- [ ] No fake production data or dead controls.
- [ ] No unintended backend/API/DB changes.

## 6. Required evidence
Capture before/after screenshots for:
- [ ] Home dashboard
- [ ] Tasks list
- [ ] Kanban
- [ ] Task detail
- [ ] Bug queue
- [ ] Bug detail
- [ ] Sticky board
- [ ] Search results
- [ ] Quick Capture task
- [ ] Quick Capture bug
- [ ] Quick Capture voice
- [ ] Quick Capture sticky
- [ ] Settings
- [ ] Light theme and dark theme

## 7. Final report
The final report must state:
- Screens completed and screens not completed
- Files/modules changed
- Tests and commands actually run
- Device/emulator sizes actually checked
- Known bugs and blockers
- Any backend capability gaps
- Links or paths to screenshots and documentation

Never claim a test passed unless it was actually run.
