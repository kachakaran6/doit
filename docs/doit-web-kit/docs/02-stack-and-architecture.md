# 02 — Stack & Architecture

## Stack
| Concern | Choice |
|---|---|
| Build | Vite + React + TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS variables (shadcn theming) |
| Components | **shadcn/ui** (Radix primitives) in shared package `@doit/ui-web` |
| Routing | TanStack Router (file-based or code-based; type-safe search params) |
| Server state | TanStack Query |
| Client state | Zustand only for UI state (sidebar, view prefs); never duplicate server data |
| Forms | react-hook-form + zod resolvers (schemas from `@doit/contracts`) |
| Tables | TanStack Table + TanStack Virtual |
| Drag & drop | dnd-kit |
| Command palette | shadcn `Command` (cmdk) |
| Toasts | shadcn `Sonner` |
| Charts | shadcn Chart (Recharts) |
| Dates | date-fns + shadcn Calendar (react-day-picker) |
| Markdown | `react-markdown` + sanitizer (rehype-sanitize) for display; simple editor with preview (Tiptap later) |
| Icons | lucide-react (shadcn default) |
| Font | Inter (self-hosted via fontsource, no external CDN) |
| Realtime | native WebSocket + ticket auth |
| Tests | Vitest, Testing Library, MSW (tests only), Playwright, axe-core |
| Lint/format | ESLint (+ custom rules), Prettier |
Verify versions + compatibility before installing.

## Monorepo placement
```
apps/web/                 # @doit/web (Vite app)
packages/ui-web/          # @doit/ui-web  — shadcn components + composites + theme.css
packages/contracts/       # shared zod/types/enums/permissions (existing)
packages/tokens/          # shared design tokens (existing) → emits CSS variables for web
```
shadcn supports monorepos (components.json in app and package, shared `ui` package). Follow the **current official monorepo guide**.

## apps/web structure
```
src/
├─ main.tsx  app.tsx  router.tsx
├─ core/
│  ├─ api/            # http client, error mapping, query client, query-key factory
│  ├─ auth/           # session store (in memory), refresh logic, guards, BroadcastChannel
│  ├─ permissions/    # useCan, <Can>, route guards (uses @doit/contracts matrix)
│  ├─ realtime/       # WS client, cache updaters
│  ├─ workspace/      # current workspace context, switcher logic
│  ├─ theme/          # ThemeProvider (mode + accent), persistence
│  └─ utils/
├─ features/
│  └─ <feature>/{routes,components,hooks,api.ts,keys.ts,index.ts}
│     (auth, workspaces, projects, work-items, bugs, stickies, search, notifications, dashboard, admin, settings, public)
├─ layouts/           # AuthLayout, AppLayout (sidebar/topbar), PublicLayout
└─ styles/globals.css # imports @doit/ui-web/theme.css
```
Rules: `features/*` import from `@doit/ui-web`, `@doit/contracts`, `core/*` only; a feature never imports another feature's internals (use its `index.ts`). Pages are thin: compose feature components. Dependency direction: `routes → features → ui-web/core`.

## Data-layer conventions
- One `api.ts` per feature (typed functions), hooks `useXQuery/useXMutation`, query keys from `keys.ts` factories (`['work-items', workspaceId, filters]`) — workspace id always in keys.
- Mutations: optimistic when safe (state, priority, assignee, board move), rollback on error, invalidate affected keys.
- Create calls send an `Idempotency-Key`.
- Pagination: cursor-based infinite queries; virtualize > 200 rows.
- Query defaults: staleTime 30 s, retry only network/5xx (not 4xx), global `onError` mapping (401 → refresh flow, 403 → toast + refresh permissions).
