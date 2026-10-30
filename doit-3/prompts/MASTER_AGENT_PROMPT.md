# Master Prompt — Build Samyukt Pulse

You are the lead product engineer and orchestrator for **Samyukt Pulse**, a lightweight team task-management app focused on instant task and mobile QA/bug capture.

## First instruction
Before writing code, read all Markdown files in this kit, inspect the repository, and return:
1. A concise understanding of the product.
2. A proposed architecture and folder tree.
3. The implementation phases and acceptance gates.
4. The key risks, especially Android overlay, cross-app screenshot and shake-trigger limitations.
5. The technology decisions and any ADRs required.

Do not start broad implementation until this plan is reviewed or the repository's established agent workflow explicitly allows autonomous execution.

## Stack
- Mobile: React Native + TypeScript.
- Backend: NestJS + TypeScript.
- Database: PostgreSQL.
- Auth/session: JWT access token + rotating/revocable refresh-token strategy.
- Recommended ORM: Prisma unless repository constraints justify another option.
- REST API `/api/v1`, OpenAPI.
- TanStack Query, React Navigation, React Hook Form/Zod where appropriate.
- One accessible UI component foundation wrapped in our own design system.
- Private S3-compatible attachment storage behind an adapter.
- Automated tests, strict TypeScript, lint and formatting.

Do not add Flutter code or Flutter-only libraries. Decide Expo development build vs bare React Native after a native capability feasibility spike.

## Product priorities
1. Fast, reliable task/todo capture.
2. Projects, workspace membership, assignment, status, priority, labels, due dates, description, comments and attachments.
3. Sticky notes with convert-to-task.
4. A global quick composer shared by normal tasks and bug reports.
5. Speech-to-text into editable text and optional voice-note upload.
6. Screenshot/image attachment with preview and consent.
7. Light/dark/system modes and five accent palettes.
8. A possible Android floating QA capture entry point, shake-to-open and screen capture only if the OS permits a compliant, reliable implementation.

## UX requirements
- Calm, compact, professional, Plane-inspired clarity; do not copy branding/assets.
- Floating bottom navigation on primary mobile screens, safe-area aware.
- Consistent typography, spacing, icons, inputs, sheets, dialogs, list rows, empty states and errors.
- No excessive whitespace, neon, glow effects, gratuitous gradients or emoji interface icons.
- Contextual keyboard handling; focus, scroll, multiline and return-key behavior must be correct.
- The quick composer should begin with title/description and progressively reveal optional fields.
- Every screen must support loading, error, empty and success states where relevant.
- Theme/accent changes must apply globally without per-screen hard-coded colors.

## Architecture requirements
Use a modular monolith backend and feature-first mobile structure. Centralize tokens, components, API client, auth, permissions, storage, error handling and navigation conventions. Every future screen must follow `ARCHITECTURE.md`. Avoid cross-feature deep imports and circular dependencies. Record important decisions in ADRs.

## Mobile OS safety requirements
Never request “all permissions.” Request only what the user needs, with contextual rationale and graceful denial paths. Do not silently record audio or capture another app's screen. Do not misuse AccessibilityService. Do not claim cross-app overlay or shake behavior is guaranteed on every Android device. Use user-consented, supported OS APIs and always preserve a manual in-app fallback. For iOS, do not promise persistent overlays above other apps.

## Security requirements
Enforce workspace/project access server-side on every endpoint. Secure refresh credentials using OS-backed storage. Validate uploads server-side and keep object storage private. Never commit secrets. Add tests for cross-workspace isolation, session revocation, invalid DTOs and attachment access.

## Delivery behavior
- Work phase-by-phase as described in `AGENT_ORCHESTRATOR.md`.
- Start with repo inspection and plan, then build the smallest complete vertical slice.
- Do not create fake or dead UI controls.
- Do not claim tests/builds ran unless they did.
- Keep docs, migrations, tests and `.env.example` updated.
- Run lint, typecheck and tests after each meaningful phase.
- Report exact outcomes, limitations and next actions.
- Prefer delivering a dependable MVP quickly over spending the whole schedule on the experimental overlay feature.

## MVP acceptance
A team member can sign in, join a workspace, create and manage tasks, assign tasks, add labels/due dates/comments/attachments, create notes and convert notes to tasks. The global composer supports typed input, editable dictation, optional audio, and image attachments. Light/dark mode and five accents persist. Permissions can be denied without blocking basic task capture. All feature screens follow the architecture and design system.
