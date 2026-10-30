# Prompt — Build DoIt Web with React + shadcn/ui

Read the product spec, architecture, security requirements, UI system and actual API contracts first.

Required stack: React + TypeScript + Vite + shadcn/ui, existing Tailwind setup, React Router, TanStack Query, React Hook Form + Zod where appropriate. Reuse shared contracts/tokens. Do not use Next.js by default and do not create a second backend.

Before coding:
1. Confirm web package location/name.
2. Map each screen/action to real API endpoints and roles.
3. Inspect browser auth and choose safe storage; never put long-lived refresh tokens in localStorage.
4. Present plan and file map.

Build order:
1. Foundation, providers, routes, typed API client, env validation and error handling.
2. Login/session lifecycle, protected routes and workspace selection.
3. Main shell and responsive navigation.
4. Today/Inbox/Upcoming and task list/detail/forms.
5. Kanban using server-approved transitions.
6. Sticky notes and conversion.
7. Bug triage and supported attachments/audio.
8. Search, notifications, settings and themes.
9. Tests, accessibility and polish.

Use shared tokens, five accent palettes, light/dark/system. Keep UI minimal and consistent; no hardcoded arbitrary colors, unnecessary badges or neon effects. Include loading/empty/error/retry/denied states.

Browser calls NestJS only. Respect response envelopes, server validation, roles and tenant scope. Do not invent endpoints or fake success. Run lint, typecheck, tests and production build; report exact commands/results, feature/API map, blockers and deployment status.
