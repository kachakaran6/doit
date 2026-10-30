# Proposed PostgreSQL Data Model

This is a conceptual model for planning; the coding agent must validate constraints, indexes and ORM mapping before migrations.

## Core entities
- `users`: id, email, display_name, avatar_url, created_at, updated_at
- `workspaces`: id, name, slug, created_by, created_at, updated_at
- `workspace_members`: workspace_id, user_id, role, joined_at
- `projects`: id, workspace_id, name, key, description, archived_at, created_by, timestamps
- `project_members` (optional for MVP if workspace membership is enough): project_id, user_id, role
- `tasks`: id, workspace_id, project_id nullable, title, description, type, status, priority, creator_id, assignee_id nullable, due_at nullable, completed_at nullable, archived_at nullable, timestamps
- `task_labels`: id, workspace_id, name, color_token, created_at
- `task_label_links`: task_id, label_id
- `notes`: id, workspace_id, project_id nullable, owner_id, title nullable, body, pinned_at nullable, archived_at nullable, timestamps
- `comments`: id, workspace_id, task_id, author_id, body, created_at, updated_at
- `attachments`: id, workspace_id, task_id nullable, note_id nullable, comment_id nullable, uploader_id, storage_key, original_name, mime_type, byte_size, kind (image/audio/file), created_at
- `activity_events`: id, workspace_id, actor_id, entity_type, entity_id, action, safe_metadata JSONB, created_at
- `refresh_sessions`: id, user_id, token_hash, expires_at, revoked_at, replaced_by_id nullable, created_at
- `notifications`: id, user_id, workspace_id, type, payload JSONB, read_at nullable, created_at
- `qa_context`: task_id, app_name nullable, app_version nullable, build_number nullable, device_model nullable, os_version nullable, expected_result nullable, actual_result nullable, reproduction_steps nullable, severity nullable

## Required constraints and indexes
- Use UUIDs or another consistent non-guessable identifier strategy.
- Foreign keys and cascade/restrict rules must be explicit.
- Unique workspace slug and membership pairs.
- Index task list access patterns: workspace_id, project_id, assignee_id, status, due_at, updated_at.
- Index label links and activity by entity/time.
- Use transaction boundaries for multi-table task creation.
- Avoid duplicate label links and duplicate workspace membership.
- Store timestamps in UTC; format for the user's locale on device.
- Add soft archive where recovery is useful.
- Restrict `safe_metadata` to non-sensitive fields.
- Ensure attachment belongs to the same workspace as its parent entity.
- Use migrations, not manual production schema edits.
