# DoIt — Screen-by-Screen Redesign Specification

Use `ALL_Screens.zip` as the visual and feature inventory. Preserve the current information architecture unless source-code inspection reveals a concrete usability or technical reason to change it.

## A. Home and workspace

### 01 — Home Dashboard
- Show workspace identity and concise welcome/context.
- Make the primary task summary immediately understandable.
- Present a short, useful task preview with clear status and due-date hierarchy.
- Give recent stickies a compact preview and a clear route to the full board.
- Avoid stacking multiple large cards with identical visual weight.
- Keep quick capture easy to reach without covering content.

### 02 — Workspace Switcher Sheet
- Use a consistent bottom sheet.
- Clearly distinguish current workspace from other workspaces.
- Provide a clear create/switch action and loading/error states.
- Do not show an empty or confusing sheet when the user has no other workspace.

### 03 — Account Menu Sheet
- Group profile, workspace/team, and account actions logically.
- Use consistent list rows and clear destructive-action treatment.
- Avoid duplicating settings already visible elsewhere.

## B. Tasks

### 04–05 — Task List and Today Filter
- Provide clear page title, compact filter controls, and readable task rows.
- Task title is primary; project, due date, assignee, and status are secondary.
- Make selected filters obvious and easy to clear.
- Support empty, loading, offline, and error states.

### 06 and 37 — Kanban Board
- Make columns readable and horizontally scrollable.
- Ensure cards have consistent height/spacing and do not clip text.
- Provide clear status/column labels and counts where useful.
- Support moving tasks without accidental gestures.
- Keep board scrolling independent from vertical screen scrolling.

### 07 — Project Switcher
- Use searchable selection if project count warrants it.
- Show selected project clearly.
- Include a create-project path only if supported by current permissions/API.

### 08–09 — Task Detail and Telemetry
- Put task title and key status/actions first.
- Group description, assignee, project, labels, dates, attachments, and activity logically.
- Put technical telemetry in a clearly labeled expandable section.
- Keep edit/save/cancel behavior predictable.
- Preserve all existing task fields and API behavior.

## C. Bugs and QA

### 10–11 — Bug Queue and Filtered Queue
- Make bug severity/status scannable without relying only on color.
- Provide compact filters and clear active-filter state.
- Bug title and reproduction context should be prioritized.
- Make assignment and status actions easy to discover.

### 12–13 — Bug Detail and Telemetry
- Prioritize summary, severity, status, reproduction steps, expected/actual behavior, and attachments.
- Keep device/app/environment telemetry in a separate collapsible group.
- Ensure long logs and metadata remain readable and copyable.
- Preserve existing telemetry fields and data.

## D. Sticky notes

### 14 — Sticky Board
- Use a tidy board/grid with a consistent note size and spacing.
- Ensure note colors remain readable in both themes.
- Avoid a large empty canvas when there are no notes; show a helpful empty state.

### 38 — Sticky Detail Sheet
- Provide a focused editing experience.
- Support save, cancel, and delete confirmation.
- Preserve unsaved text on accidental dismissal where possible.

### 36 — Home Stickies Section
- Show a small recent preview with a clear “view all” path.
- Do not let stickies overwhelm the main task dashboard.

## E. Search, notifications, sync, team

### 15–16 — Search Empty and Results
- Provide a prominent search field and useful initial guidance.
- Group results by type where useful.
- Highlight query matches carefully without harming readability.
- Include no-results, loading, and failure states.

### 17 — Notifications Inbox
- Distinguish unread/read states clearly.
- Group or order notifications consistently.
- Provide a clear empty state and mark-read behavior.
- Do not use excessive card decoration.

### 18 — Pending Sync Outbox
- Explain sync status in plain language.
- Show pending count, last sync, and actionable retry where supported.
- Distinguish offline/pending/failed/synced states.
- Never imply data is synced if the server has not confirmed it.

### 19 — Team Members
- Use a clean member list with avatar, name, role, and relevant status.
- Keep invite/member-management actions permission-aware.
- Include loading, empty, and invite failure states.

## F. Quick Capture

### 20 — Task Mode
- Optimize for fast entry: title first, then optional description and metadata.
- Include project and label selection where supported.
- Respect configured defaults from Quick Capture Preferences.
- Keep the create action visible above the keyboard.

### 21 — Bug Mode
- Provide fields for concise title, description/reproduction details, severity, and project.
- Keep advanced device/app telemetry available without cluttering the initial form.
- Validate required fields clearly.

### 22 — Voice Mode
- Provide clear record, pause/stop, playback, upload, and retry states as supported.
- Show recording duration and upload progress.
- Explain microphone permission requirements.
- Do not lose a recording if upload fails; preserve a retry path.

### 23 — Sticky Mode
- Keep note creation immediate and lightweight.
- Support optional color/category only if already supported.
- Make save feedback clear.

### 35 — Quick Capture Guide
- Use concise steps and examples.
- Avoid a long instructional wall of text.
- Make it easy to dismiss and revisit.

### 33 — Quick Capture Preferences
- Let users configure default project and relevant defaults.
- Ensure selected values are reflected in all capture modes where applicable.
- Persist preferences through the existing supported storage/API approach.
- Include save feedback and validation.

## G. Settings and configuration

### 24–26 — Settings, Appearance/Cache, About/Diagnostics
- Group settings into clear sections.
- Appearance must include light/dark/system behavior if supported and accent selection.
- Ensure all accent options pass contrast checks in both themes.
- Cache actions must explain what will be cleared and confirm destructive operations.
- Diagnostics must be readable, copyable where appropriate, and clearly separate technical details from normal settings.

### 34 — AI Provider
- Clearly show configured provider/model and enabled state.
- Explain credential/security handling accurately.
- Do not expose secrets after save.
- Keep test connection, save, and remove actions distinct.
- Preserve backend/provider contracts.

## H. Developer and onboarding

### 27–30 — Component Gallery and Design Tokens
- Treat these as internal development tools, not user-facing production destinations unless the product explicitly requires them.
- Ensure the gallery demonstrates the actual shared components and tokens, not duplicated mock examples.
- Remove or gate debug-only routes from production navigation.
- Use the gallery as a regression surface for light/dark themes and component states.

### 31 — Invitation Acceptance
- Handle expired, invalid, already-used, and unavailable invitations with useful recovery actions.
- Never show a dead-end “Invitation Unavailable” screen without context.
- Verify token and membership state through the existing backend.
- Provide sign-in/account-switch guidance when relevant.

### 32 — Project Context
- Explain what project/workspace context is required and why.
- Provide a clear recovery action when context is missing.
- Do not leave the screen as an empty form or disabled action with no explanation.

## Cross-screen requirements
- All 38 reference screens must be accounted for.
- Use the same component for the same interaction pattern.
- All screens must support light and dark themes.
- All forms must support keyboard-safe layouts.
- Every async action must have loading, success, and failure feedback.
- Preserve navigation, permissions, API payloads, and persisted data.
