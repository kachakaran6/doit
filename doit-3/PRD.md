# Product Requirements Document — Samyukt Pulse

## 1. Overview
Samyukt Pulse is a simple, team-oriented task management system built around fast capture. Its main differentiator is reducing the friction between noticing a bug while testing a mobile app/game and getting that bug into a shared team queue.

A tester should not have to leave the app under test, remember the issue, write a long report, or send a WhatsApp message. When supported and explicitly enabled, a floating capture entry point or quick action opens a compact composer. The tester can type, dictate, attach a screenshot, record a short voice note, and submit. The resulting item appears in the team workspace with useful metadata.

## 2. Problem
- Bug reports are lost between testing and reporting.
- Testers must switch apps, take notes, and message developers manually.
- Reports often lack reproducible context, screenshots, device details, or clear titles.
- Existing task tools can feel heavy for quick capture.
- Teams need tasks, todos, sticky notes, labels, priorities, due dates, assignees, comments and attachments in one straightforward place.

## 3. Goals
1. Create a task or bug report in seconds.
2. Keep task creation consistent and accessible across the application.
3. Provide a maintainable architecture for adding future feature screens.
4. Support team collaboration with authentication, workspaces/projects, assignments and status.
5. Offer light/dark themes and five selectable accent colors.
6. Support text, speech-to-text, voice attachments, image attachments and screenshot attachment where platform APIs allow.
7. Make the Android QA capture experience the signature workflow without making unsupported OS promises.

## 4. Non-goals for the MVP
- Full project-management suite with complex portfolio planning.
- Public issue tracker or external customer portal.
- AI-based bug diagnosis or automatic code fixes.
- Unrestricted background screen recording or silent screenshot collection.
- Bypassing Android security restrictions or accessibility protections.
- A custom cross-platform overlay guaranteed to appear above every app.
- Desktop/web app in the first delivery unless required as a separate future phase.

## 5. Target users
- Mobile app and game testers
- Developers receiving bug reports
- Small software teams
- Team leads who triage and assign work
- Any team member capturing a quick idea, task or sticky note

## 6. Core journeys
### A. Quick task
Open app → tap global add → type or dictate → optionally set project/label/priority/due date/assignee → save.

### B. QA bug capture
While testing, invoke an OS-compliant capture entry point → compact composer opens where supported → type/dictate a short summary → attach a user-approved screenshot or image → optionally record a voice note → add app/build/device context → submit to selected project.

### C. Sticky note
Tap Add → choose Sticky note → jot a thought → save to personal or team space → optionally convert to task later.

### D. Voice capture
Tap microphone → explain the task → review editable transcription → attach original recording only if chosen → save. Transcription must not be silently treated as perfectly accurate.

### E. Team workflow
Open Inbox/My Tasks/Project → filter/search → open task → assign, comment, add attachments, change status/priority/due date → view activity history.

## 7. MVP scope
- Authentication: email/password and JWT access/refresh session strategy.
- Team/workspace membership and role-based access.
- Projects.
- Tasks/todos and bug-report task type.
- Sticky notes.
- Status, priority, labels, due date, assignee, description, comments and attachments.
- Voice-to-text capture, plus optional voice-note attachment.
- Screenshot/image attachments from user-approved capture or picker flows.
- Search and basic filters.
- Notifications for assignment and task updates, after the core workflow is stable.
- Theme: system/light/dark; five accent choices.
- A global, reusable task composer.
- Android quick-capture experiment: floating bubble/overlay only after explicit opt-in and feasibility validation; safe fallback must always exist.

## 8. Success metrics
- Median time from opening quick capture to saved task: under 15 seconds for a short report.
- At least 90% of task creation flows complete without app crash or lost draft in internal testing.
- Required bug-report fields can be completed without navigating through multiple full screens.
- All primary screens use the same design tokens and shared components.
- No workspace-crossing data leaks in automated authorization tests.
- Permission denials never make the main app unusable.

## 9. Product requirements
- Every task has a title, creator, workspace, status, priority and timestamps.
- A task may have zero or more labels, attachments, comments and assignees according to the chosen data model.
- A task may include a due date and description.
- Bug reports may store app-under-test name, version/build, OS version, device model, reproduction steps, expected result, actual result and severity.
- Drafts must survive accidental composer dismissal where practical.
- Save feedback must be immediate and clear; failures must preserve entered content.
- Global add and quick-capture actions must use the same underlying creation service and validation rules.
- Search, filtering and empty states must be consistent.

## 10. Acceptance criteria
- A new user can sign in and reach a useful empty state.
- A member can create, edit, assign and complete a task in an authorized workspace.
- A member can create and edit a sticky note.
- A member can attach an image and an optional audio recording.
- Speech input works where the platform speech service is available; typed input always remains available.
- Theme and accent selection persist across restarts.
- All feature screens use the common app shell, tokens, components, error handling and navigation conventions.
- Android overlay and shake capture are feature-gated, documented, tested on real devices and never represented as universally available.
