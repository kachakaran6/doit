# DoIt REST API Specification

The DoIt Backend API is built with NestJS 10, strictly typed with Prisma ORM and Zod schemas, and documented via OpenAPI (Swagger).

- **Base URL**: `https://doit-api.kachakaran.me/api/v1`
- **Swagger Documentation**: `https://doit-api.kachakaran.me/api/v1/docs`
- **Response Format**: `application/json`

---

## 1. Authentication & Session Management

All authenticated endpoints require an `Authorization` HTTP header with a Bearer token:
```http
Authorization: Bearer <access_token>
```

### Endpoints

#### Register New User
- `POST /auth/register`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "name": "Jane Doe"
}
```
- **Response** (`201 Created`):
```json
{
  "user": {
    "id": "c1f7b09d-...",
    "email": "user@example.com",
    "name": "Jane Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

#### Login
- `POST /auth/login`
- **Body**: `{"email": "...", "password": "..."}`
- **Response** (`200 OK`): `{"user": {...}, "tokens": {...}}`

#### Refresh Access Token
- `POST /auth/refresh`
- **Body**: `{"refreshToken": "..."}`
- **Response** (`200 OK`): `{"tokens": {"accessToken": "...", "refreshToken": "..."}}`

#### Logout & Invalidate Device Session
- `POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): `{"success": true}`

---

## 2. Health & Telemetry

#### Liveness Probe
- `GET /health`
- **Description**: Verifies service process and PostgreSQL connection.
- **Response** (`200 OK`):
```json
{
  "status": "ok",
  "db": "up",
  "version": "0.1.0",
  "uptime": 452,
  "timestamp": "2026-11-01T19:35:00.000Z"
}
```

#### Readiness Probe
- `GET /health/ready`
- **Response** (`200 OK`):
```json
{
  "db": "up",
  "storage": "up",
  "queue": "up"
}
```

---

## 3. Workspaces & Projects

- `GET /workspaces`: Retrieve user workspaces
- `POST /workspaces`: Create workspace
- `GET /workspaces/:id/projects`: List projects within workspace
- `POST /workspaces/:id/projects`: Create project

---

## 4. Task Management

- `GET /tasks`: Query filtered tasks (query params: `projectId`, `status`, `priority`, `search`)
- `POST /tasks`: Create task (fields: `title`, `description`, `priority`, `status`, `dueDate`, `projectId`, `assigneeId`, `labels`)
- `PATCH /tasks/:id`: Update task properties or move Kanban column (`status`)
- `DELETE /tasks/:id`: Soft delete / archive task

---

## 5. Sticky Notes

- `GET /stickies`: List user stickies with color codes and grid coordinates
- `POST /stickies`: Create new sticky note
- `PATCH /stickies/:id`: Update content, color token, or pinned status
- `DELETE /stickies/:id`: Delete sticky note

---

## 6. Uploads & Attachments

- `POST /uploads`: Multipart file upload (`form-data`, key: `file`)
- **Supported File Types**: Images (`image/*`), Audio notes (`audio/*`), Documents (`pdf`, `txt`, `docx`)
- **Response** (`201 Created`):
```json
{
  "id": "att_9f82...",
  "filename": "screenshot_2026.png",
  "url": "https://doit-api.kachakaran.me/uploads/att_9f82.png",
  "size": 245102,
  "mimeType": "image/png"
}
```

---

## Project context and solution prompts

Personal AI keys are encrypted at rest and are never returned after save. Responses include only `provider`, `model`, `keyHint`, `enabled`, `status`, and `lastTestedAt`.

- `GET /projects/:projectId/context` — Markdown context, version, editor, character limit
- `PUT /projects/:projectId/context` — body `{ markdown, version }`. Version mismatch returns `STALE_WRITE`
- `GET /me/quick-capture-preferences?workspaceId=`
- `PUT /me/quick-capture-preferences`
- `GET /me/ai-providers`
- `PUT /me/ai-providers/openai` — body `{ apiKey?, model, enabled? }`
- `POST /me/ai-providers/openai/test`
- `DELETE /me/ai-providers/openai`
- `GET /tasks/:taskId/solution-prompts`
- `POST /tasks/:taskId/solution-prompts/generate` — body `{ selectedAttachmentIds?, force?, useTemplate? }`
- `PATCH /solution-prompts/:promptId` — body `{ promptMarkdown }`
- `POST /solution-prompts/:promptId/regenerate`

`useTemplate: true` assembles a prompt from saved task and project data and does not call a provider. Provider generation uses the signed-in user's own key. Supported models: `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`, `gpt-4.1`.

