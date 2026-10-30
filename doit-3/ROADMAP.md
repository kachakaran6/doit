# Delivery Roadmap — Optimize for Fast, Reliable MVP

## Phase 0 — Feasibility and decisions
- Read this kit.
- Confirm product scope and initial Android-first priorities.
- Decide Expo development build vs bare React Native by validating required native capabilities.
- Choose ORM and storage adapter.
- Record ADRs.
- Deliver architecture diagram, data flow and risk list before coding.

**Gate:** No assumptions that cross-app overlay, shake detection, or screenshot capture will work universally.

## Phase 1 — Foundation
- Monorepo, strict TypeScript, lint/format, environment validation.
- NestJS modular monolith, PostgreSQL, migrations, OpenAPI.
- Mobile app shell, navigation, theme tokens and shared components.
- API client, auth/session flow and consistent errors.
- CI lint/typecheck/tests.

**Gate:** app boots, API health check works, migrations run, design tokens render in light/dark.

## Phase 2 — Core team workflow
- Auth, workspace, membership and roles.
- Projects, task CRUD, status/priority, assignment, labels and due dates.
- Search/filter, comments/activity.
- Sticky notes and convert-to-task.
- Authorization integration tests.

**Gate:** a user can complete the full task lifecycle and cross-workspace access tests pass.

## Phase 3 — Fast capture
- Global quick composer and draft preservation.
- Voice dictation into editable text.
- Audio recording attachment.
- Image picker and upload pipeline.
- Bug template with device/app context where available.
- Retry, offline/error states and upload progress.

**Gate:** end-to-end bug report can be created without losing typed content when optional permissions fail.

## Phase 4 — QA quick access experiment
- Test notification action, app shortcut, Quick Settings tile and overlay feasibility.
- Implement the least-privileged viable option.
- Add shake-to-open only if reliable in supported lifecycle states.
- Implement consent-based screen capture only if justified and compliant.
- Document limitations and fallback.

**Gate:** tests on real devices and target Android versions; user can disable feature; no silent capture/recording.

## Phase 5 — Hardening and release readiness
- Accessibility, keyboard, performance, crash handling.
- Security review, upload validation, backup/restore test.
- Real-device permission matrix and regression suite.
- Privacy policy and store disclosures if publishing.
- Internal team pilot and bug triage.

## Speed strategy
Deliver Phases 1–3 first. Do not delay the useful task-management MVP while attempting a complex cross-app overlay. Build the stable capture path first, then validate OS-specific accelerators independently.
