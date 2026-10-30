# Functional Feature Specification

## 1. Navigation and information architecture
Primary navigation should be small and predictable:
- **Inbox** — assigned/recent items and triage queue
- **My Tasks** — tasks assigned to the current user
- **Projects** — projects and their task lists
- **Notes** — personal/team sticky notes
- **Search** — global task/note search
- **Profile & Settings** — workspace, theme, accent, permissions and account

Use a professional floating bottom navigation on primary mobile screens, respecting safe areas and keyboard visibility. The global add action must remain easy to reach but must not cover content or input controls.

## 2. Global quick composer
One reusable composer supports:
- Task, bug, sticky note selection
- Title and multiline description
- Voice dictation into editable text
- Optional voice recording attachment
- Camera/image picker and screenshot attachment
- Project, assignee, status, priority, labels and due date
- Save, cancel and draft recovery
- Contextual keyboard: sensible keyboard type, multiline behavior, submit/next actions, cursor/focus management and keyboard-aware layout

The composer must support a compact mode for quick capture and an expanded mode for full details. Avoid a long form on first open. Reveal optional fields progressively.

## 3. Tasks and todos
Fields:
- Title (required)
- Description (optional)
- Type: task, bug, improvement, question or chore; allow simple configuration later
- Status: Inbox, Todo, In Progress, Blocked, Done (workspace defaults configurable later)
- Priority: None, Low, Medium, High, Urgent
- Creator, assignee(s), project, labels
- Due date (optional; timezone-aware display)
- Attachments, comments, activity history
- Created/updated/completed timestamps

Requirements:
- List, detail, create, edit, complete/reopen, assign, filter, sort and search.
- Optimistic UI only where rollback and error states are reliable.
- Confirm destructive actions; archive is preferred to permanent deletion for ordinary users.

## 4. Bug-report mode
Use a focused template:
- Short title
- What happened? (actual result)
- What should happen? (expected result)
- Steps to reproduce (optional)
- Severity: S1 Critical, S2 High, S3 Medium, S4 Low; label meanings must be visible.
- App-under-test name and version/build
- Device model and OS version, when available and permitted
- Screenshot(s), optional voice note, logs only if explicitly selected
- Project, assignee and labels

Quick mode must allow title + screenshot or voice/text first, with advanced fields optional. Never block submission solely because device metadata cannot be read.

## 5. Sticky notes
- Quick text capture with optional title, color/style chosen from the design system, labels and attachments.
- Personal or project scope.
- Pin/unpin, edit, archive.
- Convert to task while retaining note text and attachments.
- Notes must remain readable in both themes; avoid relying on color alone to convey meaning.

## 6. Voice and speech
Keep two distinct capabilities:
1. **Speech-to-text:** microphone input transcribed into editable text, using a supported native speech service/library.
2. **Voice note:** an audio file recorded by the user and uploaded as an attachment.

Requirements:
- Explain why microphone/speech access is needed before requesting it.
- Start recording only after an explicit user action.
- Show recording state, elapsed time, stop/cancel controls and upload progress.
- Handle no speech service, offline mode, denied permission and transcription errors gracefully.
- Preserve typed input if speech recognition fails.
- Do not upload audio until the user submits the item or explicitly chooses upload.
- Choose React Native-compatible libraries after validating maintenance, platform support, licensing and New Architecture compatibility. Do not add Flutter-only packages to a React Native app.

## 7. Screenshot and attachments
- Provide a native image picker as the reliable baseline.
- Provide an in-app screenshot action only when the app is foregrounded or an authorized platform flow supports it.
- For capturing the app under test from another app, use an explicit Android MediaProjection consent flow if screen capture is implemented; do not silently capture the screen.
- Show thumbnail preview, remove/retry, file size/type validation and upload progress.
- Strip unnecessary metadata from images where practical.
- Support upload retry and clear failed/pending states.

## 8. Floating QA capture and shake gesture
Treat this as an experimental Android capability, not an MVP guarantee.
- User explicitly enables the feature in settings.
- Explain overlay and/or accessibility-related capabilities in plain language.
- Ask only for the specific permission actually needed.
- Use the least-privileged implementation possible.
- Prefer an Android foreground service with a visible notification only if required and permitted for the selected implementation.
- The floating entry point opens the compact composer. It must not intercept unrelated taps, cover critical OS controls or be difficult to dismiss.
- Shake detection must have a sensitivity threshold, cooldown, foreground/background policy and disable switch. Avoid accidental triggers during gameplay.
- Shake may open the capture composer, but must not silently take a screenshot or start audio recording.
- Provide alternatives: Quick Settings tile, notification action, app shortcut, share target, or manual in-app capture depending on feasibility.
- If the OS/OEM blocks overlay behavior, the rest of the app must work normally.

## 9. Theme and design preferences
- System, Light and Dark modes.
- Five accent presets; recommended starting palette: Blue, Violet, Green, Amber, Rose. All must pass contrast checks in both themes.
- Persist preferences per user/device.
- Components consume semantic design tokens, not hard-coded hex values.
- Avoid neon/glow effects, gratuitous gradients, excess cards, oversized empty spacing and emoji as interface icons.

## 10. Team collaboration
- Workspace, members, roles, project membership.
- Assignment, comments, activity log.
- Basic notifications for assignment and relevant updates.
- API must validate membership and permission for every workspace-scoped read/write.

## 11. Accessibility and usability
- Screen-reader labels and sensible focus order.
- Minimum comfortable touch targets, text scaling and contrast.
- Do not use color alone for priority/status.
- Keyboard-safe forms and Android back behavior.
- Permission denial and missing optional capabilities must never block basic typed task creation.
