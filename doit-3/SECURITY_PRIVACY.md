# Security and Privacy Requirements

## Authentication
- JWT access tokens should be short-lived.
- Use rotating refresh tokens with revocation and reuse detection where practical.
- Store refresh credentials only in OS-backed secure storage on mobile.
- Never store access/refresh tokens in plain AsyncStorage.
- Implement logout, token expiry, refresh failure and revoked-session handling.
- Rate-limit authentication and sensitive endpoints.
- Avoid leaking whether an email exists in public auth errors where appropriate.

## Authorization
- Workspace and project membership must be checked server-side on every relevant endpoint.
- Define roles and permissions explicitly (e.g. owner, admin, member, viewer).
- Never trust workspace/project/assignee IDs sent by the client without validation.
- Add tests proving one workspace cannot access another workspace's tasks, notes, files or activity.
- Apply least privilege to administrative actions.

## Attachments
- Validate file type, size and extension server-side; do not trust client MIME alone.
- Use private object storage and short-lived signed URLs.
- Use random object keys, not user-provided paths.
- Prevent public bucket exposure.
- Define retention and deletion behavior.
- Consider malware scanning for uploaded files when feasible.
- Avoid logging attachment content or speech transcripts unnecessarily.

## Privacy
- Explain what metadata is attached to bug reports.
- Let the user preview screenshot/audio attachments before submission.
- Do not silently capture screens, record audio or upload content.
- Collect only device metadata necessary for debugging.
- Provide a privacy policy before public distribution.
- Avoid including personal data, tokens or secrets in logs and crash reports.
- Keep telemetry minimal and documented.

## API and deployment
- Validate environment variables at startup.
- Keep secrets in deployment secret storage and `.env` files out of Git.
- Commit `.env.example` with placeholder values only.
- Use TLS in deployed environments.
- Configure CORS intentionally.
- Apply request size limits, upload limits and rate limits.
- Use structured logs with request IDs and redaction.
- Back up PostgreSQL and test restoration.
- Keep dependencies patched and run dependency/security checks in CI.

## Auditability
Record actor, action, target, workspace and timestamp for important actions such as role changes, assignment, deletion/archive and membership changes. Do not store sensitive payloads in audit logs.
