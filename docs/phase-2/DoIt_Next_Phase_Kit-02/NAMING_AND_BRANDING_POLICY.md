# Naming & Branding Policy

| Context | Canonical value |
|---|---|
| Company | Samyukt |
| Product display name | DoIt |
| Android application ID | `com.samyukt.doit` |
| API package | `@samyukt/api` |
| Mobile package | `@samyukt/mobile` |
| Web package | `@samyukt/web` |
| Contracts/tokens | Keep existing valid `@samyukt/*` package names |

## Rules
1. `Samyukt` is the company; `DoIt` is the product.
2. Keep Android ID `com.samyukt.doit` exactly.
3. Do not rename `@samyukt/mobile` just to match the product. It is a valid company-scoped package.
4. `pnpm --filter @samyukt/mobile android` remains correct if that package name remains unchanged. Fix docs only if the actual package scripts differ.
5. Use DoIt in app title, launcher label, splash, onboarding, website title and store copy.
6. Use Samyukt for company attribution, package namespace and legal/support identity.
7. Classify occurrences before edits: display brand, package, native identifier, API route, database/schema, environment variable, docs, test fixture or historical reference.
8. Never run a blind global replacement. Do not modify node_modules or generated output.
9. Do not rename API prefixes, schemas, OAuth IDs or native identifiers without a reason and migration plan.

## Checks
- Search actual legacy names with `rg -n -i`.
- Inspect `package.json`, `pnpm-workspace.yaml`, Expo config, Android Gradle files, native labels, CI and store config.
- Run package resolution, lint, typecheck, tests and builds.
- Confirm `com.samyukt.doit` and existing pnpm filter commands still work.
