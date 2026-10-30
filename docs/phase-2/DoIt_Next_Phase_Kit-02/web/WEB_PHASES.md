# Web Implementation Phases

- **W00 API map:** endpoint-to-screen matrix, DTOs, auth, roles, missing capabilities. No fake operations.
- **W01 Foundation:** React/TS/Vite, shadcn/ui, routing, providers, typed API client, env validation, lint/typecheck.
- **W02 Auth/workspace:** login, session lifecycle, logout, workspace selector, role-aware routes, safe token storage.
- **W03 Tasks:** Today, Inbox, Upcoming, task list/detail/form, labels, assignee, priority, due dates and state transitions.
- **W04 Board/notes:** Kanban, sticky grid, pinned behavior, task conversion.
- **W05 Bug triage:** severity, expected/actual result, reproduction steps, supported attachments/audio, upload progress/retry.
- **W06 Search/settings:** search, filters, notifications, profile, themes and accent palettes.
- **W07 Polish/realtime:** WebSocket only after auth/scope review, responsive design and accessibility.
- **W08 Release:** security review, regression tests, production build, domain/env setup, monitoring and smoke test.

Each phase must end with evidence, test results and known blockers before the next phase is considered complete.
