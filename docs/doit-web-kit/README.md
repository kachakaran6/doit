# DoIt Web Kit — React + shadcn/ui

Company **Samyukt** · Product **DoIt** · mobile id `com.samyukt.doit`

Goal: a professional web app (Plane/Trello/Linear class) on the **existing backend**, sharing accounts, sessions, roles and data with the Android app. Same design language everywhere via **shadcn/ui as one shared component package** + the shared `@doit/tokens`.

## Use
1. Copy this folder into the repo as `kit-web/`.
2. Paste `WEB_AGENT_PROMPT.md` into your AI agent. It runs phases **W0 → W7** with gates.
3. Prerequisite: backend + DB working (run the rescue prompt first). The web adds a *small* set of backend changes (cookie auth mode, CSRF, signed attachment URLs, WS ticket). Those are scoped in `docs/04` and W1.

## What you get
| File | Purpose |
|---|---|
| `WEB_AGENT_PROMPT.md` | Master prompt, rules, gates |
| `docs/01-product-and-ia.md` | Sitemap, routes, roles per route, layouts |
| `docs/02-stack-and-architecture.md` | Stack, folder layout, conventions |
| `docs/03-design-system-shadcn.md` | Shared shadcn package, themes, accents, component inventory |
| `docs/04-auth-and-authorization.md` | Login/session design, CSRF, permission matrix mirror, guards |
| `docs/05-api-integration.md` | Typed client, errors, queries, uploads, attachments, realtime |
| `docs/06-pages-spec.md` | Behavior of every page |
| `docs/07-quality-security-testing.md` | Tests, a11y, perf, security |
| `docs/08-deploy-coolify.md` | Container, proxy, headers, Coolify |
| `templates/theme.css` | shadcn CSS variables: light/dark × 5 accents |
| `templates/components.json` | shadcn config starting point |
| `prompts/W0…W7` | One prompt per phase |

## Decisions already made
- **Vite + React + TypeScript SPA** (the app is behind login; no SSR needed). A separate marketing site can use Next.js later; public legal pages live in this app for now.
- **shadcn/ui + Tailwind v4 + Radix**, components living in a shared workspace package (`@doit/ui-web`) so every future web surface is consistent.
- **Cookie-based refresh + in-memory access token**, same-origin `/api` proxy, CSRF protection.
- **Authorization**: server enforces; web mirrors the shared permission matrix from `@doit/contracts`.
