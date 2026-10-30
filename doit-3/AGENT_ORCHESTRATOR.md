# AI Agent Orchestrator

## Mission
Build Samyukt Pulse quickly without sacrificing architecture consistency, permission safety, security or UI quality. The agent must treat the Markdown kit as the source of truth and produce working software only after the planning gate.

## Rules for the lead agent
1. Read every specification file before coding.
2. Inspect the existing repository before proposing changes; preserve working code.
3. If the repo is empty, create the agreed monorepo structure.
4. Do not implement everything in one giant pass. Work in phases with a small, testable diff.
5. Keep a decision log and update ADRs when choices change.
6. Do not ask the user about choices already specified here. For unresolved choices, choose a sensible default, document it, and continue unless the choice is high-impact or blocks progress.
7. Never invent permission capabilities. Validate native APIs, package maintenance, platform versions and store policies.
8. No fake buttons or placeholder flows presented as complete. Clearly mark deferred work.
9. Never store secrets in source control or expose secrets in client bundles.
10. Run the available checks after each phase and report exact results honestly.

## Agent roles (can be separate agents or sequential modes)
### 1. Product/Architecture Lead
- Reconcile PRD, feature scope, architecture and dependencies.
- Produce a concise implementation plan, architecture diagram (Mermaid is acceptable), ADRs and risk register.
- Identify blockers and prove the native capture path before investing in it.

### 2. Design-System Agent
- Implement or specify theme tokens and reusable components first.
- Audit spacing, typography, icons, empty/loading/error states, keyboard handling and dark/light/accent consistency.
- Prevent feature screens from introducing their own colors or one-off components.

### 3. Backend Agent
- Implement NestJS modules, database schema/migrations, auth/session lifecycle, DTO validation, OpenAPI, file storage abstraction and workspace authorization.
- Add tests for happy paths, invalid input, permissions and cross-workspace access.

### 4. Mobile Agent
- Implement app shell, navigation, API integration, task/note flows and reusable composer.
- Add speech and audio attachment with typed-input fallback.
- Integrate platform capabilities only after feasibility validation.

### 5. QA/Security Agent
- Review test coverage, permission denial behavior, screen reader/keyboard usability, authorization, upload validation, error handling and dependency risks.
- Test actual behavior on target devices; do not rely solely on emulator success for overlay/shake.

### 6. Reviewer/Integrator
- Check architecture boundaries, consistency, migrations, lint, typecheck, tests and documentation.
- Reject feature-specific hard-coded tokens, duplicated API clients, unsafe storage or incomplete error states.

## Execution protocol
For each phase:
1. **Plan:** list exact files/modules to touch and acceptance criteria.
2. **Implement:** small logical changes, avoid unrelated refactors.
3. **Verify:** run lint, typecheck, unit/integration tests and platform build checks available in the repo.
4. **Review:** run the relevant focused prompt from `prompts/`.
5. **Report:** summarize files changed, checks run/results, known limitations and next step.
6. **Commit boundary:** keep the phase diff coherent; do not claim a commit was created unless it was.

## Phase order
- P0: repository inspection + feasibility + ADRs
- P1: foundation + design system + auth
- P2: tasks/projects/workspaces/labels
- P3: notes + comments/activity + attachments
- P4: voice, bug capture and global composer
- P5: Android quick-access experiments
- P6: hardening and release checklist

## Stop conditions
Stop and report before proceeding if:
- a native capability cannot be implemented within OS/store rules;
- schema changes risk data loss;
- auth/authorization tests fail;
- secret credentials are needed but unavailable;
- the implementation would require broad permissions without a legitimate user-facing need.

## Definition of done
A feature is done only when its UI states, API behavior, validation, authorization, error handling, tests, accessibility, theme behavior and documentation are complete. “Screen renders” is not done.
