# API & Data Model — Integration Guidance

These are suggested logical contracts, not instructions to duplicate existing tables. Inspect the current ORM/schema first and map to existing entities.

## Suggested logical entities

### ProjectContext
- id
- projectId (unique or versioned relation)
- markdown
- version
- updatedByUserId
- createdAt
- updatedAt

### AiProviderCredential
- id
- ownerUserId (or workspaceId only for explicitly shared credentials)
- provider
- model
- encryptedSecret
- encryptionKeyVersion
- enabled
- lastTestedAt
- status
- createdAt
- updatedAt

Never expose `encryptedSecret` in DTO responses.

### TaskSolutionPrompt
- id
- taskId
- projectId
- createdByUserId
- promptMarkdown
- generationStatus
- provider
- model
- sourceSnapshotHash
- sourceContextVersion
- selectedAttachmentIds (or normalized relation)
- isUserEdited
- createdAt
- updatedAt

Use an audit/history table if the existing product needs multiple revisions. Avoid storing duplicated large attachment binaries.

### QuickCapturePreference
- userId
- workspaceId
- defaultProjectId (nullable)
- defaultLabelIds (nullable array or normalized relation)
- rememberLastProject
- updatedAt

Use existing user preferences if available.

## Suggested endpoints

Adapt route naming and DTO patterns to existing NestJS conventions.

### Project context
- `GET /projects/:projectId/context`
- `PUT /projects/:projectId/context`

### AI provider settings
- `GET /me/ai-providers`
- `PUT /me/ai-providers/:provider`
- `POST /me/ai-providers/:provider/test`
- `DELETE /me/ai-providers/:provider`

GET must return only safe metadata, never the key.

### Prompt generation
- `POST /tasks/:taskId/solution-prompts/generate`
  - Body: selectedAttachmentIds, optional generation options, idempotency key.
- `GET /tasks/:taskId/solution-prompts`
- `GET /solution-prompts/:promptId`
- `PATCH /solution-prompts/:promptId`
- `POST /solution-prompts/:promptId/regenerate`

### Quick Capture preferences
- `GET /me/quick-capture-preferences`
- `PUT /me/quick-capture-preferences`

Use existing task/bug/quick-capture endpoints for projectId and labelIds where possible. Extend DTOs backward-compatibly.

## Security and validation

- Validate UUID/ID format according to project conventions.
- Confirm project belongs to the selected workspace.
- Confirm user can access the task and every selected attachment.
- Validate labels against workspace/project scope.
- Enforce max context and attachment limits.
- Rate-limit provider test and generation.
- Never expose secrets or private storage URLs.
- Use transactions for relational updates.
- Add ownership checks to every read/update/delete route.

## Migration strategy

- Add nullable/new relations first.
- Backfill existing prompt data if present.
- Preserve legacy prompt content and attachments.
- Deploy compatible backend before clients depend on new endpoints.
- Remove old UI only after data migration and tests pass.
- Keep migration idempotent and document rollback.
