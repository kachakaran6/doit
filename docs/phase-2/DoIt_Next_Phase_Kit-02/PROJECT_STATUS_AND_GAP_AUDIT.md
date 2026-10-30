# Project Status & Gap Audit

The status report claims P00–P17b and G0–G6 passed. Treat this as reported status, not proof. Verify actual source, tests, configuration and runtime behavior.

## Remaining work

### 1. Evidence-based audit
- Inspect Git status, workspace config, scripts, API routes, Prisma schema/migrations, mobile app config and shared tokens.
- Run documented lint, typecheck, unit/integration tests and token checks.
- Verify migrations from a clean database.
- Test overlay, shake, keyboard, widgets, permissions, uploads and offline queue on a physical device.
- Mark every item `verified`, `partial`, `unverified`, `blocked` or `failed` with evidence.

### 2. Branding
- Company: **Samyukt**.
- Product: **DoIt**.
- Android ID: **`com.samyukt.doit`**, unchanged.
- Fix user-facing title, launcher label, splash, metadata, website and store copy.
- Keep valid internal packages like `@samyukt/mobile`, `@samyukt/api`, `@samyukt/contracts` and `@samyukt/tokens`.
- Do not globally replace strings or rename DB/API/native identifiers without a dependency-aware migration plan.

### 3. Web client
Build React + TypeScript + Vite + shadcn/ui using the existing API and shared contracts. Include:
- Login/session lifecycle and protected routes
- Workspace selection and role-aware navigation
- Today, Inbox, Upcoming, task list/detail/form
- Kanban board and backend-approved state transitions
- Sticky notes and convert-to-task
- Bug triage, supported attachments and optional audio
- Search, filters, notifications and settings
- Light/dark/system theme and five existing accent palettes
- Loading, empty, error, retry, offline and permission-denied states
- Responsive and keyboard-accessible layouts

### 4. Security
- Verify workspace membership, RBAC and resource scope on every protected API route.
- Test cross-workspace IDOR, invalid task transitions, upload spoofing and unauthorized attachment access.
- Browser route guards are UX only, not security.
- Do not store long-lived refresh tokens in localStorage.
- Validate CORS, HTTPS, refresh rotation/revocation, rate limits, secret handling and log redaction.

### 5. Deployment
- Configure production API/web origins, HTTPS, CORS and environment variables.
- Verify migrations, backups/restore, health checks, monitoring and error tracking.
- Prepare privacy policy, support contact and permission disclosures.
- Produce and test signed Android release builds; validate iOS separately.

## Completion criteria
Do not call the product 100% complete until API/mobile tests and web lint/typecheck/tests/build pass, tenant isolation is tested, real-device flows are verified, production smoke tests pass, and remaining limitations are documented.
