# P00 — Bootstrap Monorepo

**Lane** A · **Depends on** nothing · **Branch** `feat/p00-bootstrap`

## Load
- `09-AGENT-RULES.md`
- `04-ARCHITECTURE.md` §4.1, §4.2, §4.3

## Goal
Create the empty, correctly-shaped monorepo so every later prompt has a home. Nothing
product-specific yet — just the skeleton, the tooling, and proof that the three packages talk to
each other.

## Deliverables
- `pnpm-workspace.yaml`, root `package.json`, `turbo.json`, `.gitignore`, `.editorconfig`,
  `.nvmrc` (20), `README.md`
- `packages/config/` — shared `tsconfig.base.json`, `eslint.config.mjs` (with the rules from
  `09-AGENT-RULES.md`), `prettier.config.mjs`
- `packages/contracts/` — `src/index.ts` exporting one zod schema (`PingSchema`) and its type
- `packages/design-tokens/` — `src/tokens.ts` exporting placeholder `colors`, `space`, `radius`,
  `typography`, `shadow` objects (real values land in P09)
- `apps/api/` — NestJS skeleton: `main.ts`, `app.module.ts`, `GET /health` returning
  `{ status: "ok", version, uptime }`
- `apps/mobile/` — React Native + Expo (prebuild/bare) skeleton, TypeScript, one placeholder
  screen that imports `PingSchema` from `packages/contracts` and displays its parse result
- `.github/workflows/ci.yml` — install, lint, typecheck, test
- `docs/` — copy this kit in verbatim
- `PROGRESS.md` — initialised from `13-PROGRESS-TEMPLATE.md`
- `.env.example` for both apps

## Requirements
- pnpm workspaces with `apps/*` and `packages/*`; Turborepo pipeline for `lint`, `typecheck`,
  `test`, `build`.
- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`, path aliases
  `@samyukt/contracts`, `@samyukt/tokens`, `@samyukt/config`.
- ESLint must already enforce: `no-console` (error), `@typescript-eslint/no-explicit-any` (error),
  `no-restricted-imports` (no deep cross-feature imports), `import/order`.
- API: NestJS 10+, `@nestjs/config` with zod-validated env, pino logger, global prefix
  `/api/v1`, CORS for localhost dev.
- Mobile: Expo SDK current, `app.config.ts` (not `app.json`), Reanimated + Gesture Handler
  installed and the babel plugin configured, New Architecture on, Hermes on.
- Both apps must be runnable with a single documented command in the README.

## Do not
- Do not install state, query, navigation, or UI libraries yet — later prompts own those.
- Do not create any `features/` folder or any screen beyond the placeholder.
- Do not commit `.env`, `android/` build outputs, or `node_modules`.

## Acceptance checks
- [ ] `pnpm install && pnpm typecheck && pnpm lint && pnpm test` all exit 0 from a clean clone.
- [ ] `pnpm --filter api start:dev` serves `GET http://localhost:3000/api/v1/health` → 200.
- [ ] `pnpm --filter mobile start` boots on an Android emulator and shows the ping screen.
- [ ] CI workflow runs green on the initial push.
- [ ] `git ls-files | grep -E '\.env$|node_modules'` returns nothing.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
