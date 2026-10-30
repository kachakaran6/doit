# Prompt — DoIt Web/API Security Audit

Audit the actual API and web client against `AUTH_SECURITY_REQUIREMENTS.md`.

Review auth expiry/rotation/revocation, browser token storage, CSRF if cookies are used, CORS, HTTPS, rate limits, error leakage, workspace/role guards, cross-workspace IDOR for tasks/notes/projects/uploads/comments/search, server-enforced state transitions, upload size/MIME/magic bytes, private attachment URLs, WebSocket scope, logging/redaction and unsafe rendering.

For each finding include severity, file/route, reproducible test, impact, fix and verification. Add regression tests for confirmed issues. Do not expose secrets or user data. JWT usage alone does not prove security; frontend route guards do not replace backend authorization.
