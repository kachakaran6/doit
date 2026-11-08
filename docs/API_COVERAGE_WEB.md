# API → UI coverage (2026-11-08)

Spec: `openapi.json` · Source: `apps/web/src` · **87%** covered or waived (97 operations, 13 uncovered)

## Health
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /health` | Liveness health check verifying database | ✅ | apps\web\src\pages\WorkspaceSettingsPage.tsx |
| `GET /health/ready` | Readiness probe checking db, storage, and queue | ❌ |  |

## Config
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /config` | Get client app policy and minimum required version | ❌ |  |

## Auth
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /auth/register` | Register a new account | ✅ | apps\web\src\lib\api.ts |
| `POST /auth/login` | Login with credentials and create device session | ✅ | apps\web\src\lib\api.ts |
| `POST /auth/refresh` | Rotate and exchange refresh token for a new pair | ❌ |  |
| `POST /auth/logout` | Logout and revoke current device session | ✅ | apps\web\src\lib\api.ts |
| `POST /auth/logout-all` | Revoke all device sessions for current user | ✅ | apps\web\src\lib\api.ts |
| `GET /auth/sessions` | List active device sessions | ✅ | apps\web\src\lib\api.ts |
| `DELETE /auth/sessions/{id}` | Revoke a specific device session | ✅ | apps\web\src\lib\api.ts |
| `POST /auth/password/forgot` | Request password reset | ✅ | apps\web\src\lib\api.ts |
| `GET /auth/me` | Get current user profile and workspace memberships | ✅ | apps\web\src\lib\api.ts |

## Workspaces
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces` | List all workspaces the user belongs to | ✅ | apps\web\src\lib\api.ts |
| `POST /workspaces` | Create a new workspace | ✅ | apps\web\src\lib\api.ts |
| `GET /workspaces/{workspaceId}` | Get workspace details | ✅ | apps\web\src\lib\api.ts |
| `PATCH /workspaces/{workspaceId}` | Update workspace (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `DELETE /workspaces/{workspaceId}` | Delete workspace (OWNER only) | ✅ | apps\web\src\lib\api.ts |

## Projects
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/projects` | List projects in workspace | ✅ | apps\web\src\lib\api.ts |
| `POST /workspaces/{workspaceId}/projects` | Create project in workspace (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `GET /projects/{id}` | Get project by ID | ✅ | apps\web\src\lib\api.ts |
| `PATCH /projects/{id}` | Update project (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `DELETE /projects/{id}` | Delete project (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |

## Members & Invitations
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/members` | List workspace members | ❌ |  |
| `GET /workspaces/{workspaceId}/invitations` | List pending and active workspace invitations (OWNER, ADMIN) | ❌ |  |
| `POST /workspaces/{workspaceId}/invitations` | Create invitation / shareable link (alias) | ✅ | apps\web\src\lib\api.ts |
| `POST /workspaces/{workspaceId}/members/invite` | Invite new member or generate shareable link (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `DELETE /workspaces/{workspaceId}/invitations/{id}` | Revoke pending workspace invitation (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `POST /workspaces/{workspaceId}/invitations/{id}/resend` | Resend invitation email (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |
| `GET /invitations/validate/{token}` | Publicly validate invitation token without authentication | ✅ | apps\web\src\lib\api.ts |
| `POST /invitations/accept` | Accept workspace invitation token | ✅ | apps\web\src\lib\api.ts |
| `POST /members/accept-invite` | Accept workspace invitation token (backward compatible alias) | ❌ |  |
| `PATCH /workspaces/{workspaceId}/members/{id}` | Update member role (OWNER only) | ✅ | apps\web\src\lib\api.ts |
| `DELETE /workspaces/{workspaceId}/members/{id}` | Remove member from workspace (OWNER, ADMIN) | ✅ | apps\web\src\lib\api.ts |

## Email & SMTP
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /admin/smtp` | Get current public SMTP settings (passwords masked) | ✅ | apps\web\src\lib\api.ts |
| `POST /admin/smtp` | Save or update SMTP configuration | ✅ | apps\web\src\lib\api.ts |
| `POST /admin/smtp/test-connection` | Test connection to SMTP server | ✅ | apps\web\src\lib\api.ts |
| `POST /admin/smtp/send-test` | Send test email via SMTP | ✅ | apps\web\src\lib\api.ts |

## Tasks
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/bugs` | List bugs in a project | ✅ | apps\web\src\lib\api.ts |
| `POST /projects/{projectId}/bugs` | Create a new bug in a project | ✅ | apps\web\src\lib\api.ts |
| `GET /bugs/{id}` | Get bug details | ✅ | apps\web\src\lib\api.ts |
| `PATCH /bugs/{id}` | Update bug status or details | ✅ | apps\web\src\lib\api.ts |
| `GET /projects/{projectId}/tasks` | List tasks in a project with filtering & cursor pagination | ✅ | apps\web\src\lib\api.ts |
| `POST /projects/{projectId}/tasks` | Create a new task in a project (idempotent) | ✅ | apps\web\src\lib\api.ts |
| `GET /workspaces/{workspaceId}/tasks` | List all tasks in a workspace | ✅ | apps\web\src\lib\api.ts |
| `GET /workspaces/{workspaceId}/tasks/my-day` | List My Day tasks for current user in workspace | ✅ | apps\web\src\lib\api.ts |
| `GET /tasks/my-day` | List My Day tasks by query param workspaceId | ❌ |  |
| `GET /workspaces/{workspaceId}/tasks/inbox` | List Inbox unassigned tasks in workspace | ✅ | apps\web\src\lib\api.ts |
| `GET /tasks/inbox` | List Inbox tasks by query param workspaceId | ❌ |  |
| `GET /tasks/{id}` | Get full task details | ✅ | apps\web\src\lib\api.ts |
| `PATCH /tasks/{id}` | Update task properties | ✅ | apps\web\src\lib\api.ts |
| `DELETE /tasks/{id}` | Delete task | ✅ | apps\web\src\lib\api.ts |
| `POST /tasks/{id}/status` | Update task status through validated state machine | ✅ | apps\web\src\lib\api.ts |
| `POST /tasks/{id}/reorder` | Reorder task via fractional indexing | ✅ | apps\web\src\lib\api.ts |
| `POST /tasks/{id}/assign` | Assign task to user or unassign | ✅ | apps\web\src\lib\api.ts |
| `POST /tasks/{id}/labels` | Set task labels | ✅ | apps\web\src\lib\api.ts |
| `POST /tasks/{id}/checklist` | Add an item to task checklist | ✅ | apps\web\src\lib\api.ts |
| `PATCH /checklist/{itemId}` | Update a checklist item text or completion status | ✅ | apps\web\src\lib\api.ts |
| `DELETE /checklist/{itemId}` | Delete a checklist item | ✅ | apps\web\src\lib\api.ts |

## Labels
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/labels` | List all labels in workspace | ❌ |  |
| `POST /workspaces/{workspaceId}/labels` | Create label in workspace | ✅ | apps\web\src\lib\api.ts |
| `GET /labels/{id}` | Get label by ID | ✅ | apps\web\src\lib\api.ts |
| `PATCH /labels/{id}` | Update label name or color | ✅ | apps\web\src\lib\api.ts |
| `DELETE /labels/{id}` | Delete label (detaches from all tasks) | ✅ | apps\web\src\lib\api.ts |

## Search
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /search` | Global full-text search with operators (#label, @assignee, is:bug, is:done, due:today, project:KEY) | ✅ | apps\web\src\lib\api.ts<br>apps\web\src\components\layout\Breadcrumbs.tsx<br>apps\web\src\components\layout\Sidebar.tsx |

## Stickies
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/stickies` | List stickies in project (supports ?pinned=true) | ✅ | apps\web\src\lib\api.ts |
| `POST /projects/{projectId}/stickies` | Create a sticky in project | ✅ | apps\web\src\lib\api.ts |
| `GET /stickies/{id}` | Get sticky by ID | ✅ | apps\web\src\lib\api.ts |
| `PATCH /stickies/{id}` | Update sticky body, color, or pinned status | ✅ | apps\web\src\lib\api.ts |
| `DELETE /stickies/{id}` | Delete sticky (keeps converted task intact) | ✅ | apps\web\src\lib\api.ts |
| `POST /stickies/{id}/reorder` | Reorder sticky with fractional indexing | ✅ | apps\web\src\lib\api.ts |
| `POST /stickies/{id}/convert` | Convert sticky to task (atomic, links both ways) | ✅ | apps\web\src\lib\api.ts |

## Uploads & Attachments
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /uploads/init` | Initiate 3-step resumable upload (returns presigned PUT URL valid 15m) | ✅ | apps\web\src\lib\api.ts |
| `PUT /uploads/raw/{key}` | Direct PUT endpoint for local dev driver | ❌ |  |
| `POST /uploads/{id}/complete` | Complete upload: sniff magic bytes, verify existence, write row, queue thumbnail | ✅ | apps\web\src\lib\api.ts |
| `GET /attachments/{id}` | Get attachment details and short-lived signed URLs | ✅ | apps\web\src\lib\api.ts |
| `DELETE /attachments/{id}` | Delete attachment and queue background storage deletion | ✅ | apps\web\src\lib\api.ts |

## Voice & Transcription
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /voice` | Upload audio clip and begin async transcription | ✅ | apps\web\src\lib\api.ts |
| `GET /voice/{id}` | Poll transcription status and get transcript | ✅ | apps\web\src\lib\api.ts |
| `PATCH /voice/{id}` | Save user-edited transcript text (preserves rawTranscript) | ✅ | apps\web\src\lib\api.ts |
| `POST /voice/{id}/retry` | Retry transcription on a failed voice note | ✅ | apps\web\src\lib\api.ts |
| `POST /voice/{id}/structure` | Structure voice note into bug report suggestion (never auto-applied) | ✅ | apps\web\src\lib\api.ts |
| `POST /voice/{id}/attach` | Attach voice note to a task or comment | ✅ | apps\web\src\lib\api.ts |

## other
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /notifications` | NotificationsController_getNotifications | ✅ | apps\web\src\components\layout\Breadcrumbs.tsx<br>apps\web\src\components\layout\Sidebar.tsx<br>apps\web\src\components\layout\TopBar.tsx |
| `POST /notifications/device` | NotificationsController_registerDevice | ❌ |  |
| `PATCH /notifications/{id}/read` | NotificationsController_markRead | ✅ | apps\web\src\lib\api.ts |

## Context and AI
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/context` | Get Markdown project context | ✅ | apps\web\src\lib\api.ts |
| `PUT /projects/{projectId}/context` | Save Markdown project context | ✅ | apps\web\src\lib\api.ts |
| `GET /me/quick-capture-preferences` | Get quick capture defaults for a workspace | ✅ | apps\web\src\lib\api.ts |
| `PUT /me/quick-capture-preferences` | Save quick capture defaults | ✅ | apps\web\src\lib\api.ts |
| `GET /me/ai-providers` | List personal AI providers without secrets | ❌ |  |
| `PUT /me/ai-providers/{provider}` | Save a personal AI provider key | ✅ | apps\web\src\lib\api.ts |
| `DELETE /me/ai-providers/{provider}` | Delete a personal AI provider key | ✅ | apps\web\src\lib\api.ts |
| `POST /me/ai-providers/{provider}/test` | Test a saved AI provider key | ✅ | apps\web\src\lib\api.ts |
| `GET /tasks/{taskId}/solution-prompts` | List solution prompts for a task | ❌ |  |
| `POST /tasks/{taskId}/solution-prompts/generate` | Assemble or generate a solution prompt | ✅ | apps\web\src\lib\api.ts |
| `PATCH /solution-prompts/{promptId}` | Save a manual edit of a solution prompt | ✅ | apps\web\src\lib\api.ts |
| `POST /solution-prompts/{promptId}/regenerate` | Regenerate a solution prompt from the current task | ✅ | apps\web\src\lib\api.ts |

