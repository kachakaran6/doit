# Backend Agent Prompt

Implement the Samyukt Pulse API in NestJS + TypeScript + PostgreSQL according to `PRD.md`, `DATA_MODEL.md`, `ARCHITECTURE.md` and `SECURITY_PRIVACY.md`.

Priorities:
1. Validated configuration, health endpoint, database connection and migrations.
2. Auth with short-lived JWT access tokens, refresh rotation/revocation and logout.
3. Workspaces, memberships and roles.
4. Projects and task CRUD, assignment, status, priority, labels and due dates.
5. Notes, conversion to tasks, comments and activity.
6. Private attachment storage abstraction and upload validation.
7. QA context fields and OpenAPI documentation.

Requirements:
- Modular monolith; thin controllers and business rules in services/domain layer.
- Validate all input with DTOs; consistent error envelope and request IDs.
- Enforce workspace membership and role authorization on every relevant operation.
- Never trust client-provided workspace/project IDs without server-side checks.
- Use transactions for multi-entity operations and versioned migrations.
- Add unit/integration tests, especially cross-workspace isolation and attachment authorization.
- No secrets in Git; maintain `.env.example`.
- Do not implement unrelated microservices or overengineer.

Before coding, report the proposed module order and migration strategy. After each phase, report tests and actual outcomes.
