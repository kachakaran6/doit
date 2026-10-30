# Prompt — Normalize Samyukt / DoIt Naming Safely

Company: **Samyukt**. Product: **DoIt**. Android application ID: **`com.samyukt.doit`**, unchanged.

Before editing, inspect Git status and search occurrences. Categorize each occurrence as user-facing brand, package namespace, native ID, API route, DB/schema, environment variable, documentation, test fixture or historical reference.

Then:
- Set product-facing title, launcher label, splash, onboarding, website metadata and store copy to DoIt where appropriate.
- Use Samyukt for company attribution and package namespace.
- Keep `@samyukt/mobile`, `@samyukt/api` and other valid `@samyukt/*` packages unless a concrete technical reason exists.
- `pnpm --filter @samyukt/mobile android` remains valid if the package remains `@samyukt/mobile`; do not rename its filter merely for branding.
- Never use blind global replacement. Do not modify dependencies or generated output.
- Preserve database/API/native identifiers unless a migration is planned and approved.

Run package resolution, lint, typecheck, tests and app-config checks. Report the diff and explicitly verify Android ID and pnpm filter commands.
