# DoIt — Project Context, AI Prompt Generation & Quick Capture Upgrade Kit

This implementation kit specifies the next major DoIt upgrade across:

- React Native Expo mobile application
- NestJS backend
- PostgreSQL database
- React web application
- Existing authentication, workspaces, projects, labels, tasks, bugs, attachments and invitation/deep-link flows

## What is included

| File | Purpose |
|---|---|
| `prompts/MASTER_IMPLEMENTATION_PROMPT.md` | Copy/paste execution prompt for the coding agent |
| `docs/PRODUCT_REQUIREMENTS.md` | Product scope, user journeys and behavior |
| `docs/TECHNICAL_ARCHITECTURE.md` | Architecture, security, data flow and integration constraints |
| `docs/AI_PROMPT_GENERATION_SPEC.md` | Project-context-aware AI prompt generation behavior |
| `docs/API_AND_DATA_MODEL.md` | Suggested entities, API contracts and migration guidance |
| `docs/QA_ACCEPTANCE_MATRIX.md` | Functional, security, regression and device test matrix |
| `docs/RELEASE_AND_MIGRATION_PLAN.md` | Rollout, compatibility, old-flow retirement and rollback |
| `schemas/.env.example` | Safe environment-variable placeholders |

## How to use

1. Extract this ZIP into a convenient location.
2. Open the existing DoIt repository root in your coding agent. The root must contain or provide access to the working Expo app, NestJS backend, and React website.
3. Read this kit, then paste `prompts/MASTER_IMPLEMENTATION_PROMPT.md` into the coding agent.
4. Tell the agent to work in the existing repository and follow the execution sequence.
5. Provide AI provider credentials only through the secure backend configuration flow or deployment secret manager. Never paste real keys into source files, prompts, Git, screenshots, or client-side environment variables.

## Important implementation principles

- The existing NestJS backend and PostgreSQL database remain the source of truth.
- Do not replace working mobile/backend features or create a second system.
- New AI behavior must be opt-in and user-controlled, with clear cost and privacy messaging.
- AI provider keys must never be sent to Expo or React browser clients.
- Existing project/task/attachment data must be migrated safely and retained.
- The new Quick Capture and AI prompt workflow must be verified on a physical Android device and in the React website.
- Do not claim a test passed unless it was actually run.

This kit is an implementation specification, not a claim that code has already been changed in your repository.
