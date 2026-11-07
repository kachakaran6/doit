# Technical Architecture

## System boundaries

- React Native Expo: mobile UI, local form state, file selection, navigation and API calls.
- React web: browser UI, Markdown editor, project/task views and API calls.
- NestJS: authentication, authorization, business logic, secret handling, AI orchestration, attachment authorization and persistence.
- PostgreSQL: projects, context, tasks, labels, prompt records and metadata.
- Existing attachment storage: private image/file storage. Reuse the current implementation.
- AI provider: called only by NestJS.

Both clients use the same backend contracts. Neither client stores provider credentials.

## Request flow: prompt generation

1. Client sends task ID, selected attachment IDs and generation options.
2. NestJS authenticates the caller.
3. NestJS verifies workspace/project/task access and attachment ownership.
4. NestJS loads project context and task data.
5. NestJS retrieves only the selected private attachments through the existing storage service.
6. Provider adapter loads the user's configured credential from secure storage.
7. Backend constructs a bounded prompt and invokes the provider.
8. Backend validates response and stores prompt text plus non-secret generation metadata.
9. Client receives prompt text and safe metadata.

## Credential storage

Preferred order:
1. Managed secret vault if available.
2. Otherwise authenticated encryption at rest in PostgreSQL, using an encryption key held only in Coolify/server secrets.

Never:
- Return plaintext key from API.
- Put key in Expo public env variables or browser bundles.
- Store key in browser localStorage or mobile AsyncStorage.
- Include key in logs, analytics, exception payloads or URLs.

Use authenticated encryption (e.g. AES-256-GCM) with versioned ciphertext metadata and key rotation strategy. Do not invent your own cryptography. If no safe encryption key is configured, refuse to persist the credential and explain setup requirements.

## Project context

Context is project-scoped, permission-checked, Markdown text, size-limited and sanitized on render. Track updatedAt and updatedBy. Use optimistic concurrency/version checks if practical.

## Attachments and vision

The AI service must use the existing private attachment service. Verify MIME type, size, access rights and selected attachment IDs. Do not generate public URLs. For a vision-capable model, pass image bytes or secure provider-compatible image inputs server-side. For unsupported models, clearly omit image analysis and tell the user.

## Idempotency and failure handling

- Use idempotency keys for generation requests where appropriate.
- Do not duplicate prompt records on client retries.
- Task creation is independent of AI.
- Provider timeout/quota/invalid key must not corrupt task state.
- Preserve user text and completed attachments after failures.
- Record status and safe error codes, not secrets.

## Deep links

Use an explicit invitation route matcher. The absence of a URL is not an invitation. Only a URL matching the configured invitation path may enter invitation handling. Clear stale pending invite state after terminal outcomes. Keep normal launcher route independent of invitation parsing.

## Navigation surface

Trace the rendered view hierarchy to identify the full-width background behind the floating tab bar. Make only the parent/container transparent as appropriate while retaining the floating bar's own surface, elevation, safe-area padding and touch area. Verify on device and both themes.
