# W2 — Workspace, app shell, authorization
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `01`, `04`, `03`.

## Task
Onboarding (create workspace + first project / join by code), AppLayout (shadcn Sidebar + top bar + breadcrumbs), WorkspaceSwitcher (create/join/switch; cache clear + WS close + permissions reload), ProjectSwitcher, route tree from doc 01 with TanStack Router guards (auth → membership → role → resource), 403/404 pages, `useCan` + `<Can>` using `@doit/contracts`, `/me/permissions` loading, role-aware navigation, Settings → Profile/Appearance/Security skeletons, theme + accent persisted and synced to `/me`.

## GATE G-W1
Playwright role matrix (owner/admin/member/guest) over navigation and guarded routes; IDOR URL-tampering tests return 404; screenshots; wait for human approval.
