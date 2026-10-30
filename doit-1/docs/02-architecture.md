# 02 — Architecture

## Monorepo
```
samyukt/
├─ apps/
│  ├─ api/                    # NestJS
│  └─ mobile/                 # Expo (React Native, dev client)
├─ packages/
│  └─ shared/                 # TS types, zod schemas, enums shared by api+mobile
├─ docker/                    # Dockerfiles, compose
├─ docs/  prompts/  templates/
├─ AGENTS.md  ORCHESTRATOR.md  STATUS.md  DECISIONS.md  BACKLOG.md
└─ package.json (pnpm workspaces)
```
Use **pnpm workspaces**. Shared enums/types live ONLY in `packages/shared`.

## Backend (apps/api)
```
src/
├─ main.ts  app.module.ts
├─ config/            # env validation (zod/joi), typed config
├─ common/            # guards, filters, interceptors, decorators, pagination, dto base
├─ prisma/            # PrismaService, schema in /prisma/schema.prisma
└─ modules/
   ├─ auth/           # register, login, refresh, logout, sessions
   ├─ users/
   ├─ workspaces/     # + members, invitations, ownership transfer
   ├─ policy/         # PolicyService, permission matrix, PolicyGuard, WorkspaceGuard
   ├─ audit/          # AuditLog writer + query
   ├─ projects/
   ├─ work-items/     # task|bug|todo
   ├─ labels/
   ├─ stickies/
   ├─ attachments/    # upload, serve, storage abstraction
   └─ health/
```
Rules: controller → service → prisma. DTO in, response mapper out. Global `ValidationPipe` (whitelist, transform), global exception filter with a consistent error shape:
`{ "statusCode": 400, "code": "VALIDATION_ERROR", "message": "...", "details": [...] }`.
Storage: `StorageService` interface with `LocalDiskStorage` (volume mounted) now; S3/MinIO adapter later without touching callers.

## Mobile (apps/mobile) — the Feature Architecture
```
src/
├─ app/                       # expo-router routes ONLY (thin wrappers that render feature screens)
├─ core/
│  ├─ api/                    # http client, interceptors (auth refresh), query client
│  ├─ auth/                   # token storage (SecureStore), session store
│  ├─ theme/                  # tokens, ThemeProvider, useTheme, accents
│  ├─ navigation/             # floating navbar, route registry
│  ├─ config/                 # env, constants
│  └─ utils/
├─ ui/                        # Design-system components (the ONLY place with styling primitives)
│  ├─ primitives/             # Text, Box, Icon, Pressable
│  ├─ inputs/                 # TextField, SearchField, QuickAddInput
│  ├─ feedback/               # Toast, Skeleton, EmptyState, ErrorState
│  ├─ overlays/               # BottomSheet, Modal, Menu
│  ├─ data/                   # ListItem, Card, Badge, Chip, Avatar
│  └─ index.ts
├─ features/
│  └─ <feature>/
│     ├─ screens/             # screen components (thin)
│     ├─ components/          # feature-only components
│     ├─ hooks/               # useXQuery, useXMutation
│     ├─ api.ts               # API calls for this feature
│     ├─ store.ts             # (optional) zustand slice
│     ├─ types.ts             # (re-export from @samyukt/shared when possible)
│     └─ index.ts             # public surface + route/nav registration
└─ native/                    # JS bridges for the Android module (bubble, capture)
```
Dependency direction: `app → features → ui/core`. `ui` never imports `features`. Features never import other features' internals (only their `index.ts`).

### Feature registration
Each feature exports a `FeatureManifest` from `index.ts`:
```ts
{ id: 'work-items', routes: [...], navItem?: {...}, quickActions?: [...] }
```
`core/navigation` reads manifests so **adding a feature never means editing the navbar by hand** beyond adding one line to the registry. See `08-feature-recipe.md`.

### Access control
See `10-auth-workspaces-access-control.md`. Request pipeline: `JwtAuthGuard` (+session check) → `WorkspaceGuard` (`X-Workspace-Id`) → `PolicyGuard` (`@Can(action)`) → service (always workspace-scoped queries).
Mobile adds features `workspaces`, `members`, `projects` and a `useCan(action, resource?)` hook fed by `GET /me/permissions` and the shared matrix.

## Data flow
Screen → hook (TanStack Query) → feature `api.ts` → `core/api` client → API.
Server state in React Query, UI/session/theme state in Zustand. No duplicated server state in stores.

## Auth/session flow
- Access JWT (15 min) + refresh token (30 d, opaque random, stored **hashed** in `sessions` table with device name, ip, user-agent, last-used).
- Refresh rotates the token (old one invalidated; reuse detection → revoke session).
- Mobile stores tokens in `expo-secure-store`. Client interceptor refreshes once on 401 and retries.
- Logout revokes the current session; "logout all" revokes all.

## Native (Android) module
Local Expo module `apps/mobile/modules/samyukt-capture` (Kotlin). Details: `06-bug-capture-overlay.md`.
