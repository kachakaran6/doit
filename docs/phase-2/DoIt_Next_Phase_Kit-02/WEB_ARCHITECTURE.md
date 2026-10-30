# DoIt Web Architecture

Recommended location: `apps/web`, package `@samyukt/web`, unless repository conventions indicate otherwise. Do not restructure the monorepo just to match this proposal.

```text
apps/web/src/
  app/{providers,router,route-guards}/
  components/{layout,shared}/
  design-system/{tokens,theme}/
  features/
    auth/{api,components,hooks,schemas,pages}/
    workspaces/
    tasks/
    board/
    notes/
    bug-triage/
    search/
    notifications/
    settings/
  lib/{api-client,errors,query-client,env,utils}/
  styles/
  test/
```

## API
- Inspect actual NestJS routes, DTOs and shared contracts first.
- Use one typed API client with `VITE_API_URL`.
- Parse standard response envelope and errors centrally.
- Reuse generated OpenAPI/shared types if available.
- TanStack Query owns server cache; invalidate queries consistently.
- Never bypass backend validation, permissions or task transitions.
- Do not assume `/api/v1`; confirm API prefix in source.

## Browser authentication
Inspect existing auth before choosing a strategy. Preferred if backend supports it: short-lived access token in memory; refresh token in `HttpOnly`, `Secure`, suitable `SameSite` cookie; CSRF defenses for cookie-authenticated mutations; server-side rotation/reuse detection. If current API only accepts refresh tokens in request bodies, document risk and propose the smallest safe compatible backend change. Do not store long-lived refresh tokens in localStorage.

## State
Server data: TanStack Query. Form state: React Hook Form. UI state: local component state or a small store only when justified. Clear caches on logout/account/workspace change.

## Realtime/offline
Reuse WebSocket only after verifying authentication and workspace scoping. Reconnect with bounded backoff and refetch/invalidate relevant queries. Prioritize robust online workflows over a second offline outbox. Never claim queued data is saved unless it is durably queued and clearly indicated.
