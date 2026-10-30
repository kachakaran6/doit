# Technology Stack and Decisions

## Required stack
- **Mobile:** React Native + TypeScript. Prefer Expo development builds if all required native capabilities are supported; use bare React Native if native overlay/service integration requires direct Android project control. Make this decision with a proof-of-feasibility spike before committing.
- **Backend:** NestJS + TypeScript.
- **Database:** PostgreSQL.
- **Session/auth:** JWT access tokens plus rotating refresh tokens, secure storage on device, server-side revocation strategy.
- **API:** REST under `/api/v1`, documented with OpenAPI/Swagger.
- **Validation:** DTO validation on NestJS and matching client-side schemas for user experience.
- **Database access:** Prisma ORM is the recommended default for migrations, typed queries and schema maintainability. If the agent chooses TypeORM instead, document the reason and use only one ORM.
- **File storage:** S3-compatible object storage behind an attachment service. Keep provider details behind an interface. Local development can use MinIO; production provider is an environment decision.
- **Client server-state:** TanStack Query for fetching, caching, retries and invalidation.
- **Forms/validation:** React Hook Form + Zod where compatible and useful.
- **Navigation:** React Navigation.
- **UI primitives:** React Native Paper or a carefully selected accessible component library, wrapped by project-owned components. Do not mix multiple competing UI kits.
- **Icons:** one consistent icon library, such as Lucide for React Native, after compatibility review.
- **Local preferences/secure storage:** AsyncStorage for non-sensitive preferences and OS-backed secure storage for refresh credentials.
- **Speech:** evaluate a maintained React Native speech-recognition package and native platform services. Speech-to-text is optional; typed capture is always available.
- **Audio recording:** evaluate a maintained React Native audio-recording library with Android/iOS support.
- **Testing:** Jest + React Native Testing Library; NestJS unit/integration tests; API contract tests; end-to-end tests where practical.
- **Lint/format:** ESLint + Prettier; strict TypeScript.
- **CI:** run lint, typecheck, tests and migration checks on pull requests.

## Important decision: Expo vs bare React Native
Do not assume Expo Go can support Android overlay services, shake-triggered capture while another app is foregrounded, or all native screen-capture requirements. First create a short feasibility spike using a development build. If a reliable Android native service/module is required, choose bare React Native or Expo prebuild with maintained native modules and document the trade-off.

## Backend modules
Auth, Users, Workspaces, Memberships, Projects, Tasks, Labels, Notes, Comments, Attachments, Activity, Notifications, DeviceCapabilities/QA metadata and Health/Diagnostics.

## Engineering rules
- TypeScript strict mode.
- API versioning and consistent response/error envelope.
- Centralized configuration with environment validation.
- No secrets in source control or mobile bundle.
- Migrations are versioned and reviewed.
- Every workspace-scoped endpoint enforces membership and role access.
- Uploads use short-lived signed URLs or an authenticated upload proxy.
- No client-provided workspace ID is trusted without authorization checks.
- Avoid premature microservices. Use a modular monolith for the MVP.
