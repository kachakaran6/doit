# Prompt — Audit Existing Repository Before Coding

Act as a senior staff engineer in `K:\Doit`. Do not rebuild the project.

The report says P00–P17b and G0–G6 passed. Verify the claim from repository and runtime evidence.

1. Inspect Git status and preserve local changes.
2. Read root docs, package scripts, pnpm/Turbo config, API routes, Prisma schema/migrations, mobile config and design tokens.
3. Identify actual package names, app IDs, API prefix, auth endpoints and supported feature endpoints.
4. Run existing lint/typecheck/unit/integration/token checks. Do not invent scripts or claim unrun tests passed.
5. Verify task transitions, tenant guards, refresh rotation, upload validation, transcription limits, overlay permission fallback, offline queue and theme tokens.
6. Assess browser authentication suitability and missing API capabilities.
7. Produce a table: item, evidence, status (`verified/partial/unverified/blocked/failed`), severity and next action.
8. Recommend the smallest safe branding cleanup and React + shadcn/ui web plan.

Do not edit source in this audit phase. Do not expose `.env` values or secrets. Keep `com.samyukt.doit` and valid `@samyukt/*` package scopes.
