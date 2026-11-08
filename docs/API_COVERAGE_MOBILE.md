# API → UI coverage (2026-11-08)

Spec: `openapi.json` · Source: `apps/mobile/src` · **52%** covered or waived (97 operations, 47 uncovered)

## Health
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /health` | Liveness health check verifying database | ❌ |  |
| `GET /health/ready` | Readiness probe checking db, storage, and queue | ❌ |  |

## Config
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /config` | Get client app policy and minimum required version | ✅ | apps\mobile\src\features\system\useVersionPolicy.ts |

## Auth
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /auth/register` | Register a new account | ✅ | apps\mobile\src\features\auth\api\mutations.ts |
| `POST /auth/login` | Login with credentials and create device session | ✅ | apps\mobile\src\features\auth\api\mutations.ts |
| `POST /auth/refresh` | Rotate and exchange refresh token for a new pair | ❌ |  |
| `POST /auth/logout` | Logout and revoke current device session | ❌ |  |
| `POST /auth/logout-all` | Revoke all device sessions for current user | ❌ |  |
| `GET /auth/sessions` | List active device sessions | ❌ |  |
| `DELETE /auth/sessions/{id}` | Revoke a specific device session | ❌ |  |
| `POST /auth/password/forgot` | Request password reset | ❌ |  |
| `GET /auth/me` | Get current user profile and workspace memberships | ✅ | apps\mobile\src\features\auth\store.ts |

## Workspaces
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces` | List all workspaces the user belongs to | ✅ | apps\mobile\src\features\workspace\store.ts<br>apps\mobile\src\features\workspace\queries.ts<br>apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `POST /workspaces` | Create a new workspace | ✅ | apps\mobile\src\features\workspace\components\ProjectSwitcherSheet.tsx<br>apps\mobile\src\features\workspace\components\WorkspaceSwitcherSheet.tsx<br>apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `GET /workspaces/{workspaceId}` | Get workspace details | ✅ | apps\mobile\src\features\workspace\queries.ts<br>apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx<br>apps\mobile\src\features\labels\api\queries.ts |
| `PATCH /workspaces/{workspaceId}` | Update workspace (OWNER, ADMIN) | ❌ |  |
| `DELETE /workspaces/{workspaceId}` | Delete workspace (OWNER only) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |

## Projects
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/projects` | List projects in workspace | ✅ | apps\mobile\src\features\workspace\queries.ts |
| `POST /workspaces/{workspaceId}/projects` | Create project in workspace (OWNER, ADMIN) | ✅ | apps\mobile\src\features\workspace\components\ProjectSwitcherSheet.tsx |
| `GET /projects/{id}` | Get project by ID | ✅ | apps\mobile\src\features\bugs\api\queries.ts<br>apps\mobile\src\features\stickies\api\queries.ts<br>apps\mobile\src\features\tasks\api\queries.ts |
| `PATCH /projects/{id}` | Update project (OWNER, ADMIN) | ❌ |  |
| `DELETE /projects/{id}` | Delete project (OWNER, ADMIN) | ❌ |  |

## Members & Invitations
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/members` | List workspace members | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `GET /workspaces/{workspaceId}/invitations` | List pending and active workspace invitations (OWNER, ADMIN) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `POST /workspaces/{workspaceId}/invitations` | Create invitation / shareable link (alias) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `POST /workspaces/{workspaceId}/members/invite` | Invite new member or generate shareable link (OWNER, ADMIN) | ❌ |  |
| `DELETE /workspaces/{workspaceId}/invitations/{id}` | Revoke pending workspace invitation (OWNER, ADMIN) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `POST /workspaces/{workspaceId}/invitations/{id}/resend` | Resend invitation email (OWNER, ADMIN) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |
| `GET /invitations/validate/{token}` | Publicly validate invitation token without authentication | ✅ | apps\mobile\src\screens\InviteAcceptScreen.tsx |
| `POST /invitations/accept` | Accept workspace invitation token | ✅ | apps\mobile\src\screens\InviteAcceptScreen.tsx |
| `POST /members/accept-invite` | Accept workspace invitation token (backward compatible alias) | ❌ |  |
| `PATCH /workspaces/{workspaceId}/members/{id}` | Update member role (OWNER only) | ❌ |  |
| `DELETE /workspaces/{workspaceId}/members/{id}` | Remove member from workspace (OWNER, ADMIN) | ✅ | apps\mobile\src\features\workspace\screens\TeamMembersScreen.tsx |

## Email & SMTP
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /admin/smtp` | Get current public SMTP settings (passwords masked) | ❌ |  |
| `POST /admin/smtp` | Save or update SMTP configuration | ❌ |  |
| `POST /admin/smtp/test-connection` | Test connection to SMTP server | ❌ |  |
| `POST /admin/smtp/send-test` | Send test email via SMTP | ❌ |  |

## Tasks
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/bugs` | List bugs in a project | ✅ | apps\mobile\src\features\bugs\api\queries.ts |
| `POST /projects/{projectId}/bugs` | Create a new bug in a project | ✅ | apps\mobile\src\features\bugs\api\mutations.ts |
| `GET /bugs/{id}` | Get bug details | ✅ | apps\mobile\src\features\bugs\api\queries.ts |
| `PATCH /bugs/{id}` | Update bug status or details | ✅ | apps\mobile\src\features\bugs\api\mutations.ts |
| `GET /projects/{projectId}/tasks` | List tasks in a project with filtering & cursor pagination | ✅ | apps\mobile\src\features\tasks\api\queries.ts |
| `POST /projects/{projectId}/tasks` | Create a new task in a project (idempotent) | ✅ | apps\mobile\src\features\tasks\api\mutations.ts |
| `GET /workspaces/{workspaceId}/tasks` | List all tasks in a workspace | ❌ |  |
| `GET /workspaces/{workspaceId}/tasks/my-day` | List My Day tasks for current user in workspace | ❌ |  |
| `GET /tasks/my-day` | List My Day tasks by query param workspaceId | ❌ |  |
| `GET /workspaces/{workspaceId}/tasks/inbox` | List Inbox unassigned tasks in workspace | ❌ |  |
| `GET /tasks/inbox` | List Inbox tasks by query param workspaceId | ❌ |  |
| `GET /tasks/{id}` | Get full task details | ✅ | apps\mobile\src\features\tasks\api\queries.ts<br>apps\mobile\src\features\tasks\components\SolutionPromptSection.tsx |
| `PATCH /tasks/{id}` | Update task properties | ✅ | apps\mobile\src\features\tasks\api\mutations.ts |
| `DELETE /tasks/{id}` | Delete task | ✅ | apps\mobile\src\features\bugs\api\mutations.ts<br>apps\mobile\src\features\tasks\api\mutations.ts |
| `POST /tasks/{id}/status` | Update task status through validated state machine | ❌ |  |
| `POST /tasks/{id}/reorder` | Reorder task via fractional indexing | ❌ |  |
| `POST /tasks/{id}/assign` | Assign task to user or unassign | ❌ |  |
| `POST /tasks/{id}/labels` | Set task labels | ❌ |  |
| `POST /tasks/{id}/checklist` | Add an item to task checklist | ❌ |  |
| `PATCH /checklist/{itemId}` | Update a checklist item text or completion status | ❌ |  |
| `DELETE /checklist/{itemId}` | Delete a checklist item | ❌ |  |

## Labels
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /workspaces/{workspaceId}/labels` | List all labels in workspace | ✅ | apps\mobile\src\features\labels\api\queries.ts |
| `POST /workspaces/{workspaceId}/labels` | Create label in workspace | ✅ | apps\mobile\src\features\labels\api\queries.ts |
| `GET /labels/{id}` | Get label by ID | ❌ |  |
| `PATCH /labels/{id}` | Update label name or color | ❌ |  |
| `DELETE /labels/{id}` | Delete label (detaches from all tasks) | ❌ |  |

## Search
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /search` | Global full-text search with operators (#label, @assignee, is:bug, is:done, due:today, project:KEY) | ✅ | apps\mobile\src\core\providers\KeyboardProvider.tsx<br>apps\mobile\src\components\ui\KeyboardAccessoryBar.tsx<br>apps\mobile\src\components\ui\SearchInput.tsx |

## Stickies
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/stickies` | List stickies in project (supports ?pinned=true) | ✅ | apps\mobile\src\features\stickies\api\queries.ts |
| `POST /projects/{projectId}/stickies` | Create a sticky in project | ✅ | apps\mobile\src\features\stickies\api\mutations.ts |
| `GET /stickies/{id}` | Get sticky by ID | ❌ |  |
| `PATCH /stickies/{id}` | Update sticky body, color, or pinned status | ✅ | apps\mobile\src\features\stickies\api\mutations.ts |
| `DELETE /stickies/{id}` | Delete sticky (keeps converted task intact) | ❌ |  |
| `POST /stickies/{id}/reorder` | Reorder sticky with fractional indexing | ❌ |  |
| `POST /stickies/{id}/convert` | Convert sticky to task (atomic, links both ways) | ✅ | apps\mobile\src\features\stickies\api\mutations.ts |

## Uploads & Attachments
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /uploads/init` | Initiate 3-step resumable upload (returns presigned PUT URL valid 15m) | ✅ | apps\mobile\src\screens\CaptureModal.tsx |
| `PUT /uploads/raw/{key}` | Direct PUT endpoint for local dev driver | ❌ |  |
| `POST /uploads/{id}/complete` | Complete upload: sniff magic bytes, verify existence, write row, queue thumbnail | ✅ | apps\mobile\src\screens\CaptureModal.tsx |
| `GET /attachments/{id}` | Get attachment details and short-lived signed URLs | ❌ |  |
| `DELETE /attachments/{id}` | Delete attachment and queue background storage deletion | ❌ |  |

## Voice & Transcription
| Operation | Summary | UI | Where |
|---|---|---|---|
| `POST /voice` | Upload audio clip and begin async transcription | ✅ | apps\mobile\src\features\voice\api\mutations.ts |
| `GET /voice/{id}` | Poll transcription status and get transcript | ❌ |  |
| `PATCH /voice/{id}` | Save user-edited transcript text (preserves rawTranscript) | ❌ |  |
| `POST /voice/{id}/retry` | Retry transcription on a failed voice note | ❌ |  |
| `POST /voice/{id}/structure` | Structure voice note into bug report suggestion (never auto-applied) | ❌ |  |
| `POST /voice/{id}/attach` | Attach voice note to a task or comment | ❌ |  |

## other
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /notifications` | NotificationsController_getNotifications | ✅ | apps\mobile\src\navigation\RootNavigator.tsx |
| `POST /notifications/device` | NotificationsController_registerDevice | ❌ |  |
| `PATCH /notifications/{id}/read` | NotificationsController_markRead | ❌ |  |

## Context and AI
| Operation | Summary | UI | Where |
|---|---|---|---|
| `GET /projects/{projectId}/context` | Get Markdown project context | ✅ | apps\mobile\src\features\projects\ProjectContextScreen.tsx |
| `PUT /projects/{projectId}/context` | Save Markdown project context | ✅ | apps\mobile\src\features\projects\ProjectContextScreen.tsx |
| `GET /me/quick-capture-preferences` | Get quick capture defaults for a workspace | ✅ | apps\mobile\src\screens\CaptureModal.tsx<br>apps\mobile\src\features\settings\screens\QuickCapturePrefsScreen.tsx |
| `PUT /me/quick-capture-preferences` | Save quick capture defaults | ✅ | apps\mobile\src\screens\CaptureModal.tsx<br>apps\mobile\src\features\settings\screens\QuickCapturePrefsScreen.tsx |
| `GET /me/ai-providers` | List personal AI providers without secrets | ✅ | apps\mobile\src\features\settings\screens\AiProviderScreen.tsx |
| `PUT /me/ai-providers/{provider}` | Save a personal AI provider key | ✅ | apps\mobile\src\features\settings\screens\AiProviderScreen.tsx |
| `DELETE /me/ai-providers/{provider}` | Delete a personal AI provider key | ✅ | apps\mobile\src\features\settings\screens\AiProviderScreen.tsx |
| `POST /me/ai-providers/{provider}/test` | Test a saved AI provider key | ✅ | apps\mobile\src\features\settings\screens\AiProviderScreen.tsx |
| `GET /tasks/{taskId}/solution-prompts` | List solution prompts for a task | ✅ | apps\mobile\src\features\tasks\components\SolutionPromptSection.tsx |
| `POST /tasks/{taskId}/solution-prompts/generate` | Assemble or generate a solution prompt | ✅ | apps\mobile\src\features\tasks\components\SolutionPromptSection.tsx |
| `PATCH /solution-prompts/{promptId}` | Save a manual edit of a solution prompt | ✅ | apps\mobile\src\features\tasks\components\SolutionPromptSection.tsx |
| `POST /solution-prompts/{promptId}/regenerate` | Regenerate a solution prompt from the current task | ❌ |  |

