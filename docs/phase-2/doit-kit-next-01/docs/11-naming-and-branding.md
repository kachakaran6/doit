# 11 — Naming & Branding

## Rule
- **Samyukt** = the company (legal owner, publisher, copyright).
- **DoIt** = the product (everything the user or developer sees day to day).

## Convention table
| Thing | Name |
|---|---|
| App display name | DoIt |
| Store title | DoIt – Tasks & Bug Capture (by Samyukt) |
| Developer / publisher | Samyukt |
| Android applicationId / iOS bundle id | `com.samyukt.doit` **(unchanged)** |
| Kotlin/Java source package + folders | `com.samyukt.doit.*` **(unchanged)** |
| Repo / folder | `doit` |
| npm scope | `@doit/api`, `@doit/mobile`, `@doit/web`, `@doit/contracts`, `@doit/tokens` |
| Deep-link scheme | `doit://` |
| Expo `name` | DoIt  (keep `slug` unless the agent confirms EAS project impact; see below) |
| Native module (JS name) | `doit-capture` (was `samyukt-capture`) |
| Env var prefix | `DOIT_*` |
| Docker image / compose project | `doit-api`, `doit-web`, `doit` |
| Seed emails | `alice@doit.local`, `bob@doit.local` (was `@samyukt.com`) |
| Copyright line | `© <year> Samyukt` |

## Allowed to still contain "samyukt"
1. `com.samyukt.doit` and `com/samyukt/doit` (ids and Kotlin paths)
2. Copyright/publisher lines, LICENSE, store listing "by Samyukt", privacy policy legal entity
3. This file and `check-naming.mjs` allowlist

## Rename migration (what the agent must touch)
`pnpm-workspace.yaml`, every `package.json` (`name`, deps, scripts using `--filter`), `tsconfig` paths, all imports `@samyukt/*`, `turbo.json`, Dockerfiles, compose, CI workflows, Expo config (`name`, `scheme`), native module name registration (Kotlin `Name("...")` ↔ JS `requireNativeModule`), config plugin names, docs/README, UI strings, seed data, Bruno collection, store listing copy, `.env.example` keys.

## Danger zones
- **Expo `slug`/EAS projectId**: changing slug can detach the EAS project. Keep slug unless verified safe.
- **Native module rename** requires `expo prebuild --clean` and a fresh dev build; test overlay after.
- **Scheme change** invalidates old deep links/invites (`samyukt://join` → `doit://join`); accept both for one release if invites already shared.
- **Prisma/DB name**: DB is already `doit`; do not rename tables.
- Don't blind find/replace `samyukt` → `doit`; that breaks the package id. Use the allowlist script.

## Guard script
`scripts/check-naming.mjs`: case-insensitive scan of the repo (excluding `node_modules`, `.git`, build output) failing on `samyukt` outside the allowlist; run in CI and pre-commit.
