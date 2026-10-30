# AGENTS.md — Permanent Rules

You are building **Samyukt**, a team task management POC. Read this file at the start of every session.

## Mission
Speed to a working POC with a **consistent, professional, Plane-like UI** and a **one-tap bug capture** flow. Simple beats clever.

## Hard rules
1. **Follow the docs.** `docs/` is the source of truth. If you must deviate, write the reason in `DECISIONS.md` first.
2. **API contract first.** Never change an endpoint shape without updating `docs/04-data-model-and-api.md` and the shared types package.
3. **Never hardcode UI values.** No raw colors, font sizes, spacing, or radii in screens. Use tokens and shared components from `apps/mobile/src/ui`.
4. **Feature architecture is mandatory.** Every new screen lives in `apps/mobile/src/features/<name>/` following `docs/08-feature-recipe.md`.
5. **TypeScript strict everywhere.** No `any` without a `// reason:` comment.
6. **Validate all input** on the backend with DTOs (class-validator). Never trust the client.
7. **Secrets** only via env vars. Maintain `.env.example` for every app. Never commit real secrets.
8. **Small commits**, conventional messages (`feat:`, `fix:`, `chore:`). One phase = one branch/PR-sized unit.
9. **Verify versions.** Before installing any library, check the latest stable and compatibility with the current Expo SDK. Do not trust memory for versions or APIs; read the library docs.
10. **Don't gold-plate.** Anything not in `docs/01` scope goes to a `BACKLOG.md`, not into code.
11. **Every phase ends with**: lint passes, typecheck passes, app/API runs, `STATUS.md` updated, demo steps listed.
12. **If blocked or ambiguous**, choose the simplest option consistent with the docs, log it in `DECISIONS.md`, and continue. Ask the human only for things that need credentials, devices, or product decisions.

13. **Security by default.** Every route is authenticated, workspace-scoped and policy-checked per `docs/10`. A new endpoint without `@Can(...)` is a bug. Never rely on UI hiding for authorization.

## Definition of done (any task)
- Works on a real Android device/emulator (and iOS simulator where the feature is cross-platform).
- Dark and light mode both look correct, all 5 accents work.
- Loading, empty, and error states exist.
- No console errors/warnings introduced.

## Code style
- Backend: NestJS modular, thin controllers, logic in services, DTO + response mappers.
- Mobile: feature folders, hooks for data (TanStack Query), components are dumb, screens are thin.
- Names: files `kebab-case`, components `PascalCase`, hooks `useThing`.
