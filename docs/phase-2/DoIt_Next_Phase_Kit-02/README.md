# Samyukt DoIt — Next Phase Agent Kit

**Company:** Samyukt · **Product:** DoIt · **Android ID:** `com.samyukt.doit`

This kit directs an AI coding agent to verify the reported completed phases, safely normalize branding, audit production readiness, and build a React + shadcn/ui web client on the existing NestJS API. It intentionally contains specifications and prompts, not application source code.

## Rules
1. Work in the existing repository `K:\Doit`; do not rebuild completed modules without evidence.
2. P00–P17b and G0–G6 are reported complete, not independently verified.
3. Keep `com.samyukt.doit` unchanged.
4. Keep valid company-scoped packages such as `@samyukt/mobile` and `@samyukt/api`. Do not blindly replace `samyukt` with `doit`.
5. Build web with React + TypeScript + Vite + shadcn/ui; browser talks to NestJS, never directly to PostgreSQL.
6. Audit before coding; preserve uncommitted work; do not invent test results or endpoints.
7. Use the requested Gluestack skill for relevant React Native work only; it does not replace shadcn/ui for web.

## Kit contents
- `PROJECT_STATUS_AND_GAP_AUDIT.md`
- `NAMING_AND_BRANDING_POLICY.md`
- `WEB_PRODUCT_SPEC.md`
- `WEB_ARCHITECTURE.md`
- `AUTH_SECURITY_REQUIREMENTS.md`
- `UI_SYSTEM_AND_GLUESTACK.md`
- `RELEASE_READINESS.md`
- `orchestration/MASTER_ORCHESTRATOR.md`
- `orchestration/IMPLEMENTATION_CHECKLIST.md`
- `prompts/REPOSITORY_AUDIT_PROMPT.md`
- `prompts/BRANDING_NORMALIZATION_PROMPT.md`
- `prompts/WEB_IMPLEMENTATION_PROMPT.md`
- `prompts/AUTH_SECURITY_AUDIT_PROMPT.md`
- `prompts/QA_RELEASE_PROMPT.md`
- `web/WEB_PHASES.md`

## Execution order
1. Repository audit prompt.
2. Naming normalization prompt.
3. Install/read UI skill and inspect its diff.
4. Build web foundation, auth, task workflows, notes, bug triage, settings.
5. Security audit, QA and release gates.
