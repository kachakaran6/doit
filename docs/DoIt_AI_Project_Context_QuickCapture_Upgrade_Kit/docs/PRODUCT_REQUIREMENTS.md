# Product Requirements — DoIt Project Context & AI-Assisted Workflows

## Product objective

Make DoIt more useful for software teams by allowing users to capture work quickly, preserve project-specific engineering context, and turn tasks/bugs into actionable coding-agent prompts.

## User stories

### Quick Capture
- As a user, I can select a project while creating a task or bug.
- As a user, I can assign one or more labels.
- As a user, I can configure default project and labels in settings.
- As a user, I can still capture quickly without selecting either.

### Project context
- As a project member with edit permission, I can maintain Markdown context.
- As a team member with read permission, I can view context.
- Context is scoped to the correct project and workspace.
- Context is included in AI generation only when I request generation.

### AI provider
- As a user, I can add my own provider credential securely.
- I can test, replace, disable or delete it.
- The client never receives the saved secret again.
- AI usage is clearly disclosed and does not block ordinary DoIt functionality.

### Solution prompt
- As a user, I can generate a developer-ready prompt from a task.
- I can select which attachments/images are sent.
- I can inspect and edit the result before saving or copying.
- I can regenerate without silently overwriting manual edits.
- The prompt is available on mobile and web.

### Startup and navigation
- Normal app launch opens the normal home/auth flow.
- Invitation errors appear only for actual invitation deep links.
- Bottom navigation is a single floating component without a full-width white backing view.

## Non-goals for this release

- Automatically changing source code based on AI output.
- Running coding agents inside DoIt.
- Sending all project files or all attachments to an AI provider by default.
- Silent/background microphone or screenshot capture.
- Replacing the existing authentication or workspace model.
- Making provider API keys available to client applications.

## Product principles

- User explicitly initiates AI generation.
- User chooses attachments shared with the provider.
- Project context is editable, scoped, and transparent.
- Task creation must succeed even when AI is unavailable.
- No hidden AI costs or undisclosed data sharing.
- All changes must be cross-platform and backwards compatible.
