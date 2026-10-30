# Architecture and Extensible Folder Structure

## 1. Architectural approach
Use a **modular monolith backend** and a **feature-first mobile architecture**. New screens must be built by composing shared design-system components, shared data/query utilities, navigation conventions and feature modules—not by inventing a separate pattern each time.

## 2. Suggested repository layout
```text
samyukt-pulse/
  apps/
    mobile/
      src/
        app/                  # app entry, providers, navigation
        core/
          config/             # validated environment/config
          errors/             # normalized error mapping
          http/               # API client, auth interceptors
          storage/            # preferences and secure storage adapters
          permissions/        # permission rationale and capability checks
          analytics/          # privacy-respecting event abstraction
        design-system/
          tokens/              # colors, spacing, typography, radius, elevation
          components/          # Button, Input, IconButton, Sheet, Chip, Avatar...
          patterns/            # ScreenHeader, EmptyState, ErrorState, FormSection
          theme/               # system/light/dark + accent resolution
        navigation/
          routes.ts
          RootNavigator.tsx
          linking.ts
        features/
          auth/
            api/ components/ hooks/ screens/ schemas/ types/
          inbox/
          tasks/
          bug-capture/
          projects/
          notes/
          search/
          notifications/
          settings/
          workspace/
        shared/
          components/           # only truly cross-feature components
          hooks/
          types/
          utils/
        assets/
      tests/
      android/
      ios/
    api/
      src/
        main.ts
        app.module.ts
        common/
          auth/ decorators/ guards/ interceptors/ filters/
          database/
          config/
          dto/
          pagination/
          storage/
          observability/
        modules/
          auth/
          users/
          workspaces/
          memberships/
          projects/
          tasks/
          labels/
          notes/
          comments/
          attachments/
          activity/
          notifications/
          qa-capture/
      prisma/
        schema.prisma
        migrations/
      test/
  packages/
    api-contracts/              # shared generated API types/schema if appropriate
    config/                      # shared lint/format/tsconfig if useful
  docs/
    PRD.md
    ARCHITECTURE.md
    ADRs/
  .env.example
  README.md
```
The agent may adapt the exact folders to the selected tooling, but must preserve feature-first separation, shared design-system ownership and module boundaries.

## 3. Mobile feature module convention
Each feature should use only the folders it needs, following a consistent pattern:
```text
features/<feature>/
  api/          # API functions and query keys
  components/   # feature-specific components
  hooks/        # feature-specific hooks
  screens/      # route-level screens
  schemas/      # validation schemas
  types/        # feature domain types
  utils/        # feature-only helpers
  index.ts      # public exports; avoid cross-feature deep imports
```
A tiny feature need not create empty folders. Shared code belongs in `core`, `design-system` or `shared` only when genuinely reusable. Features must not import another feature's private implementation.

## 4. Screen creation contract
Every new screen must:
1. Use the standard screen container and safe-area behavior.
2. Use shared typography, spacing, color and icon tokens.
3. Implement loading, error, empty, success and permission-denied states as applicable.
4. Use the common API client and query/mutation conventions.
5. Use shared form validation and error messages.
6. Respect theme, accent, accessibility, keyboard and reduced-motion settings.
7. Add route typing and tests.
8. Avoid hard-coded colors, ad-hoc margins and duplicated widgets.
9. Document new environment variables and permissions.
10. Update the feature index and navigation only through the agreed route registry.

## 5. Backend module convention
Each NestJS module owns its controller, service, DTOs, domain rules and persistence interactions. Controllers should remain thin. Keep cross-cutting auth, pagination, error handling, config and storage in `common/`. Do not create a new service or microservice for every feature.

## 6. API conventions
- Base path `/api/v1`
- JSON, ISO-8601 timestamps in UTC
- Cursor pagination preferred for growing task/activity lists; document the chosen scheme.
- Consistent error shape: `{ statusCode, code, message, details?, requestId }`
- OpenAPI documents all public endpoints.
- Idempotency protection for retry-sensitive creation/upload completion endpoints where appropriate.
- Never expose database stack traces or secrets to clients.

## 7. Architecture decision records
Create a short ADR in `docs/ADRs/` for important choices:
- ADR-001: Expo development build vs bare React Native
- ADR-002: ORM selection
- ADR-003: object storage provider
- ADR-004: overlay/QA capture feasibility and fallback
- ADR-005: refresh-token revocation strategy

## 8. Dependency direction
Screens → feature hooks/API → core API client → backend.  
Features → design system/shared abstractions.  
Design system must not depend on business features.  
Backend controllers → services/domain rules → persistence/storage adapters.  
Avoid circular imports.
