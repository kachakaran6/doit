# MASTER IMPLEMENTATION PROMPT — DoIt Major Upgrade

You are the Principal Engineer responsible for completing a production-quality DoIt upgrade across React Native Expo, NestJS, PostgreSQL and React web.

## Mission

Implement all of the following in the existing repository:

1. Remove the unwanted white background/backplate behind the mobile bottom floating navigation. Keep only the floating navigation surface.
2. Fix the app cold-start bug that opens `Invitation Unavailable` even when the user did not open an invitation.
3. Upgrade Quick Capture with project and label selection, sensible defaults, and fast interaction.
4. Add Markdown project context for every project.
5. Add secure, user-configurable AI provider credentials.
6. Generate copy-ready AI solution prompts from tasks, project context, task details and relevant images/attachments.
7. Add a first-class `Prompt` / `Solution Prompt` section to task details with generation, editing, copying, regeneration and history.
8. Ensure the new experience replaces conflicting legacy prompt-generation flows without deleting user data or breaking existing records.
9. Integrate all changes across mobile, web, backend and database.
10. Test everything thoroughly and report verified results.

This is a major implementation task. Do not stop after analysis or produce mockups only. Inspect, implement, build, run, test, fix and document.

---

## A. Repository discovery and safety

Before editing:

- Inspect the current repository, package manifests, lockfiles, scripts, Git status, environment configuration, mobile app, web app, NestJS modules, database schema/migrations, authentication, project/task/label models, attachment storage, navigation and deep-link configuration.
- Identify the actual ORM and conventions. Do not assume Prisma or TypeORM.
- Inspect existing AI integrations, prompt fields, task detail screens, Quick Capture, bottom navigation and invitation route handling.
- Preserve all uncommitted user work. Never run destructive Git commands.
- Do not replace the working backend, authentication, database or app architecture.
- Do not duplicate existing entities/services if they can be extended.
- Establish baseline builds/tests before making changes.

Create an implementation checklist and continue immediately. Do not wait for approval for routine implementation decisions. Ask only if a destructive or credential-sensitive action genuinely requires user input.

## B. Fix bottom floating navigation

The supplied annotated screenshot identifies the unwanted white/opaque background behind the bottom navigation. The intended design is a single floating navigation component, not a floating bar sitting on a second white container.

Requirements:

- Inspect the actual React Native navigation hierarchy and safe-area wrappers.
- Find which parent, tab bar, navigator, safe-area view, screen container or pseudo-element paints the unwanted white background.
- Remove the redundant background/backplate, not the floating navigation itself.
- Keep the floating navigation surface, rounded shape, shadow/elevation and spacing.
- Ensure the area outside the floating pill uses the screen's actual theme background and does not become a white strip in dark mode.
- Avoid placing the navigation inside a full-width opaque white view.
- Preserve Android gesture navigation and bottom safe-area spacing.
- Verify both light and dark themes, short and tall devices, keyboard-open state, scroll screens and edge-to-edge layouts.
- Avoid clipping, overlap with system navigation and excessive bottom padding.
- Do not merely set a random transparent color without finding the owning view and verifying the complete hierarchy.

Acceptance: the bottom UI visually consists only of the intended floating navbar and its separate action button; no full-width white/gray rectangular background remains.

## C. Fix false “Invitation Unavailable” on normal app launch

The supplied screenshot shows the app opening directly into an Invitation Unavailable screen. This must happen only when a genuine invitation deep link is received and validated.

Investigate:

- Expo Linking configuration and initial URL handling.
- React Navigation/Expo Router linking configuration.
- Initial route selection and persisted navigation state.
- Pending invitation token storage.
- URL parsing, path matching and query parameter handling.
- Cold start versus warm start behavior.
- App links/intent filters and Android manifest configuration.
- Authentication redirects and post-login continuation.
- Invitation token cleanup after acceptance, rejection, expiry or invalid link.

Implement robust routing:

1. Normal launcher icon start → normal authenticated/home/onboarding route. Never invitation error.
2. Genuine invitation URL → invitation flow.
3. Malformed invitation URL → invitation-specific error only after the app has positively identified it as an invitation route.
4. Missing/invalid token on a genuine invite route → invitation error with useful recovery.
5. Unrelated URL or absent initial URL → ignore invitation parser and continue normal startup.
6. Existing invitation pending through login → preserve only the validated pending invite context safely.
7. After completion/cancel, clear pending invite state so it cannot poison the next launch.

Do not infer that an invitation exists from an empty token, stale storage value, default route or failed URL parse. Add structured, redacted diagnostics. Never log invitation tokens.

Test cold start from launcher, genuine invite cold start, warm link, invalid invite, normal restart after failed invite, login redirect and app relaunch after accepting an invite.

## D. Quick Capture: project and label selection

Add project and label selection to the existing Quick Capture modal without slowing down capture.

### UI

- Add a compact Project selector.
- Add a Labels multi-select selector.
- Use Lucide icons only; no emoji.
- Match the existing DoIt design system and both themes.
- Show selected project and selected labels clearly.
- Provide search for long project/label lists.
- Provide loading, empty and error states.
- Keep modal compact and keyboard-aware.
- Support accessible touch targets and keyboard navigation where applicable.

### Defaults and settings

Add a Quick Capture preferences section in Settings:

- Default workspace (only if user belongs to multiple workspaces and current app behavior supports it).
- Default project.
- Default labels (optional).
- Remember last selected project (optional preference).
- Whether to show project selector by default.
- Whether labels selector is expanded by default.

Behavior:
- Use the active workspace and current project context when possible.
- Apply a saved default only if it belongs to the currently selected workspace and user has permission.
- Do not silently assign a project from a different workspace.
- Allow the user to change or clear the default.
- Labels must be restricted to the active workspace/project rules.
- When project changes, revalidate selected labels and remove invalid associations with clear UI feedback.
- For Bugs, Tasks and Stickies, follow actual backend association rules. Do not invent unsupported relationships.

### Submission

Send project ID and label IDs through the existing API contract or extend it backward-compatibly. Validate authorization and workspace ownership on the server. Keep existing quick capture types and attachments working.

## E. Project Context — Markdown editor for every project

Add a dedicated Project Context capability.

Purpose: each project can store a concise but useful description of its purpose, domain, architecture, conventions, key paths, constraints and instructions. AI prompt generation will use this context.

### Project UI

Add a `Context` section/tab in project details/settings:

- Markdown editor with preview.
- Comfortable multiline editing.
- Save/cancel and unsaved-change handling.
- Last updated timestamp and editor identity if available.
- Character/token guidance, but do not truncate silently.
- Clear empty state with suggested structure.
- Search within context if practical.
- Support light/dark theme.
- Accessible keyboard behavior.

Suggested starter template (do not force it on users):

```md
# Project overview
What this project does and who uses it.

## Goals
- ...

## Tech stack
- Mobile:
- Backend:
- Web:
- Database:

## Architecture
Important modules, flows and boundaries.

## Conventions
Coding style, naming, patterns and rules.

## Important paths
- ...

## Constraints
Compatibility, performance, security and product constraints.

## Definition of done
What a completed task should include.
```

### Data and permissions

- Store context on the project or a dedicated versioned project-context entity, following existing schema conventions.
- Enforce workspace membership and project permissions.
- Sanitize rendered Markdown to prevent XSS. Do not render raw HTML unless safely sanitized and explicitly supported.
- Limit context size with a configurable server-side maximum and clear UI counter.
- Preserve previous content during failed saves.
- Add updatedAt/updatedBy and optimistic concurrency/version handling if practical.
- Do not expose context across workspaces.
- Add context retrieval to the AI generation pipeline only for authorized users.

## F. AI provider settings and secure API tokens

Add AI configuration so a user can connect a provider and generate prompts.

### Provider strategy

Inspect the project and available SDKs first. Implement a provider adapter interface rather than coupling the whole app to one vendor.

Support at least one provider end-to-end using the existing compatible integration or a current supported SDK. If the codebase already has an AI provider integration, extend it. Make the architecture extensible for additional providers.

Potential configuration fields:
- Provider (e.g. OpenAI or another provider supported by the implementation).
- API key.
- Model.
- Optional base URL only for explicitly supported compatible providers.
- Enabled/disabled.
- Default generation preference.

Do not hardcode a model name without checking provider compatibility. Validate provider/model selection server-side.

### Security — critical

- AI API keys are secrets. They must never be sent back to the mobile or web client after saving.
- Never store raw API keys in ordinary plaintext database columns.
- Prefer a secure secret manager where available. If stored in PostgreSQL, encrypt at rest using authenticated encryption and a key supplied only through server environment/secret management.
- Never commit encryption keys or provider API keys.
- Never put AI provider keys in `EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`, browser localStorage, AsyncStorage, logs, analytics, crash reports or request URLs.
- API requests from mobile/web go to NestJS. NestJS decrypts/uses the key server-side.
- Return only masked metadata such as provider, model, last-four hint if safe, enabled state and validation status.
- Support replace/delete/disable.
- Provide a “Test connection” action with safe error handling and rate limiting.
- Never echo provider error payloads that could contain credentials.
- Scope credentials according to product design. Prefer user-level personal credentials by default; if workspace-shared credentials are supported, require explicit owner/admin permission and communicate who can use them.
- Do not silently use a teammate's personal key.
- Clearly disclose that provider usage may incur charges and that project/task/attachment content is sent to the selected provider when generation is requested.

### AI settings UI

Create a Settings → AI Providers screen:

- Provider selection.
- API key input (masked).
- Model selection.
- Test connection.
- Save/update.
- Disable/remove.
- Connection state and last tested time.
- Clear privacy and cost notice.
- No secret is displayed again after saving.

If no provider is configured, show setup guidance and disable generation gracefully. The rest of DoIt must continue working.

## G. AI Solution Prompt generation

Add a `Prompt` or `Solution Prompt` section to Task details.

The output is a copy/paste-ready prompt that a developer can provide to a coding agent. It is not merely a generic summary.

### Inputs

Use only authorized and relevant information:
- Project Context Markdown.
- Task title.
- Task description.
- Task labels.
- Priority and due date where useful.
- Linked project/workspace metadata.
- User-added images and attachments.
- Bug reproduction steps, expected/actual behavior and severity if the source item is a Bug.
- Existing comments/activity only if explicitly useful and permission-checked.
- Relevant technical metadata already recorded by the app.

### Image and attachment handling

Use images intelligently:
- If provider/model supports vision, send authorized image content through a secure backend flow.
- Use signed/private attachment retrieval or existing secure storage service.
- Do not make private attachments public.
- Do not send unrelated project files or every attachment by default.
- Let the user choose which attachments are included.
- Show which attachments will be sent to the AI provider.
- Validate size, MIME type and authorization.
- If vision is unsupported, explain that images were not analyzed; do not pretend otherwise.
- Preserve original attachments on the task regardless of AI generation.

### Prompt structure

Generate a well-structured developer prompt with sections such as:

1. Role and objective.
2. Project overview and relevant architecture.
3. Task/problem statement.
4. Current behavior and expected behavior.
5. Relevant constraints and coding conventions.
6. Image/attachment observations, only if actually analyzed.
7. Required investigation steps.
8. Implementation requirements.
9. Edge cases and regression risks.
10. Testing requirements.
11. Acceptance criteria.
12. Final reporting requirements.

The generated prompt must:
- Be specific to the selected project and task.
- Preserve facts from the source item.
- Clearly label assumptions and missing information.
- Never invent file paths, APIs, stack details or reproduction steps.
- Ask the coding agent to inspect the repository before editing.
- Require backward compatibility and regression tests.
- Require actual verification rather than claiming success.
- Be clean Markdown, immediately copyable.

### UX

On Task detail add:
- `Generate solution prompt` action.
- Preview/editor for generated prompt.
- Regenerate action.
- Copy prompt action with success feedback.
- Edit manually.
- Save prompt to the task.
- Prompt generation status.
- Generation history/version list if practical.
- Model/provider used and timestamp, without exposing secrets.
- Attachment inclusion selector.
- Clear indication that generation uses external AI and may incur provider charges.

Do not overwrite a user-edited prompt silently. Ask before replacing unsaved or saved manual edits.

### Prompt lifecycle

- Save generated prompt and its source task/project association.
- Store generation metadata, not provider secrets.
- Consider storing a snapshot/hash of the project context and task inputs used so users can understand why a prompt was generated.
- Allow regeneration after task/context changes.
- Clearly distinguish generated draft from user-edited final prompt.
- Ensure a prompt created on mobile is visible on web and vice versa.

## H. AI generation backend

Implement a dedicated NestJS service/provider abstraction.

Responsibilities:
- Authenticate user.
- Verify workspace/project/task access.
- Resolve selected provider credential securely.
- Fetch project context and task data.
- Resolve authorized selected attachments.
- Enforce model and request limits.
- Construct a structured generation request.
- Call provider from server only.
- Validate/normalize response.
- Save prompt and generation metadata.
- Return prompt text and safe metadata.
- Record usage/cost metadata if provider makes it available.
- Apply per-user/workspace rate limits and size limits.
- Handle provider timeout, quota, invalid key, unsupported model, vision unsupported, and network errors.

Do not make generation part of task creation in a way that blocks or fails task creation. Task creation must work even if AI is unavailable. AI generation is an explicit follow-up action or optional background step with clear status.

## I. Web integration

Expose the same features in React website:
- Project context Markdown editor and preview.
- AI provider settings.
- Quick Capture project/labels.
- Task prompt section.
- Attachment inclusion and image-aware generation.
- Prompt preview/edit/copy/regenerate/history.
- Same backend APIs and permissions as mobile.

Use the website's established design system and responsive layouts. Do not build a separate AI backend for web.

## J. Mobile integration

Implement in React Native Expo:
- Bottom navbar fix.
- Startup/deep-link fix.
- Quick Capture project and labels selectors.
- Settings for default project/labels and AI provider configuration.
- Project Context editor/preview.
- Task Prompt section.
- Prompt generation/loading/error states.
- Copy/share prompt.
- Attachment selection and preview.

Respect Expo SDK version and installed native dependencies. Do not upgrade Expo major versions casually. Test on a physical Android device.

## K. API and database integration

Inspect existing schema before adding migrations. Suggested entities and contracts are in `docs/API_AND_DATA_MODEL.md`.

Avoid duplicate project/task/label/attachment tables. Use existing relations and extend only where needed.

All new routes must:
- Validate DTOs.
- Enforce authentication and authorization.
- Validate workspace/project/task relationships.
- Rate-limit sensitive actions.
- Return consistent error shapes.
- Be documented.
- Be covered by tests.

## L. Legacy flow retirement — “previous version should stop”

Interpret this as removing conflicting old UI/entry points and making the new integrated workflow the canonical experience, **not deleting historical user data**.

- Inventory all existing prompt-generation implementations, old settings, duplicate buttons and deprecated screens.
- Migrate existing saved prompts/data into the new canonical model if needed.
- Route old entry points to the new prompt experience or remove them after migration.
- Do not leave two competing prompt generators.
- Do not silently discard saved prompt text, attachments, project context or history.
- Use a migration/version marker and idempotent database migration.
- Remove obsolete code only after references and tests are updated.
- If a staged rollout is required, use a server-controlled feature flag; do not leave users stuck with an incomplete legacy/new split.
- Provide rollback instructions for schema and feature rollout.

## M. Mandatory test matrix

### Bottom navigation
- Light theme.
- Dark theme.
- Android gesture navigation.
- Multiple screen sizes.
- Keyboard open.
- Scrollable screens.
- No full-width white backplate.

### Startup and invitation links
- Normal cold start from launcher.
- Normal warm start.
- Genuine invite cold start.
- Genuine invite warm start.
- Invalid invitation URL.
- Empty/malformed URL.
- Restart after invalid invitation.
- Login then return to invitation.
- Accept/revoke/expire invitation.
- No stale token causing invitation error on normal startup.

### Quick Capture
- Task with project and labels.
- Bug with project and labels.
- Default project selected.
- Change and clear project.
- Search project.
- Multi-select labels.
- Project switch invalidates incompatible labels correctly.
- Capture with no project.
- Existing screenshot and audio attachment workflows remain working.
- Offline/error/retry and repeated submissions.

### Project context
- Create, edit, preview, save.
- Markdown sanitization.
- Permission checks.
- Large context limit.
- Concurrent edit/conflict.
- Mobile ↔ web visibility.

### AI credentials
- Save key.
- Verify key is not returned to client.
- Test connection.
- Replace, disable, delete.
- Invalid key.
- Quota/timeout.
- Unauthorized user.
- Ensure key absent from logs, local storage, app bundle and network responses.

### Prompt generation
- Task with text only.
- Task with project context.
- Task with labels.
- Task with selected image.
- Task with multiple selected images.
- Vision-supported model.
- Vision-unsupported model.
- Missing project context.
- No AI key configured.
- Provider timeout/quota.
- Regenerate after task/context change.
- Manual edit then regenerate confirmation.
- Save/copy prompt.
- Mobile prompt appears on web and vice versa.

### Regression
- Login/registration.
- Workspace switching.
- Tasks, Bugs, Stickies.
- Screenshot/audio attachments.
- Invitations.
- Offline queue/sync.
- Search and notifications.
- Website and mobile build.

## N. Execution and delivery

Follow this sequence without stopping:

`DISCOVER → BASELINE → FIX NAV BACKPLATE → FIX COLD START ROUTING → QUICK CAPTURE PROJECT/LABELS → PROJECT CONTEXT → SECURE AI SETTINGS → PROMPT GENERATION SERVICE → TASK PROMPT UI → WEB PARITY → MIGRATE/RETIRE OLD FLOW → DEVICE QA → WEB QA → BUILD → REGRESSION → DOCUMENT`

Run available typecheck, lint, unit, integration, build and end-to-end tests. Install and test on a real Android device if connected. Inspect the actual running website in a browser if available.

Deliver:
- Working implementation in the existing repository.
- Database migrations.
- Updated `.env.example` with placeholders only.
- API documentation.
- Project context and AI usage documentation.
- QA report.
- Migration/rollback instructions.
- List of changed files and exact commands.

Final report must use PASS / FAIL / NOT TESTED for each acceptance area. State root causes found, what was changed, test evidence, remaining blockers, and any credentials/configuration still required.

Never claim device/browser testing that was not performed. Never fake provider success. Never expose secrets. Never break the existing working mobile/backend flows.

**Definition of done:** the floating navbar has no unwanted full-width backplate; normal app launch no longer shows invitation errors; Quick Capture supports project and labels; each project stores Markdown context; users can securely configure an AI provider; task details contain copy-ready, context-aware solution prompts that can use selected images; the same data and prompts are available across mobile and web; old conflicting prompt flows are retired safely.
