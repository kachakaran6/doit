# WEB FEATURE-PARITY + LAYOUT LOOP PROMPT — DoIt (React + shadcn/ui)

You are a principal full-stack product engineer. The DoIt web app looks much better but (1) shows **no real user identity** (sidebar footer says "Account"/"U"), (2) has **unwanted and inconsistent left/right padding and dead space**, and (3) **exposes only a fraction of the backend** — e.g. no way to create a project, manage members/invitations, labels, notifications, audit, or workspaces. Fix all three, to a professional standard, with measured loops and evidence.

Company **Samyukt**, product **DoIt**.

## Read first
1. `docs/01-audit-round-2.md` — what's wrong (IDs A1…D3), screenshots in `reference/current/`
2. `docs/02-api-to-ui-coverage-spec.md` — the API→UI rule, inventory, standards
3. `docs/03-layout-and-shell-spec.md` — container system, sidebar, top bar, user menu
4. `docs/04-panels-spec.md` — account, team, projects, workspace panels, create dialogs
5. `docs/05-loop-and-acceptance.md` — the loop, definition of done, gates
6. Design system: the premium web kit (`kit-web-premium/docs/02`, `templates/theme.css`, `badge-map.ts`) — keep it; do not restyle from scratch.

## Non-negotiable rules
1. **The OpenAPI spec is the source of truth for features.** Run `node scripts/api_coverage.mjs --spec <live /docs-json> --src apps/web/src …` first and last. Every operation gets a UI surface or an owner-approved waiver. Don't invent endpoints; if the UI needs one that doesn't exist, add it to backend + `@doit/contracts` + tests and note it.
2. **Fix identity first (A1)**: find why `/me` data isn't shown (failed request, wrong field mapping, name never stored), fix web **and mobile** ("Active User" there too), and add a test. Sidebar footer and user menu show real name, email, role. No "Account"/"U"/"Active User" anywhere.
3. **One container system** (`PageContainer`, centered, equal gutters, 4 widths). Delete ad-hoc padding/margins on pages. `GUTTER_ASYMMETRY`, `NESTED_PADDING`, `PLACEHOLDER_IDENTITY` audits must be 0; all data pages share one content width.
4. **Sidebar/top bar/user menu per `docs/03`**: one identity block, projects with "+", settings out of main nav, real breadcrumbs, one Create split button.
5. **Every feature meets the Definition of Done** (`docs/05`): full CRUD as API allows, all states, permission gating (owner/admin/member/guest) with server enforcement, deep links, keyboard/a11y, realtime consistency, Playwright tests.
6. **Use the existing design system** (tokens, `StatusBadge`, shadcn components in `@doit/ui-web`); no raw colors/enums/pixels; sentence case; borderless tonal surfaces.
7. **No dev/system info for normal users** (remove "System & sync" from Overview → admin-only About).
8. **Realistic seed data** in staging (multiple projects, members, invitations, labels, 30+ items, bugs with screenshots/audio, notifications, audit entries) so every panel can be judged.
9. **Evidence or it didn't happen**: coverage report, before/after sheets, `layout-widths.json`, audit JSON, rubric table, test results, UNVERIFIED list. Verify library APIs from official docs; ADRs; commit per phase.
10. **Don't break**: auth/cookie/CSRF, permissions, realtime, URL state, existing e2e.

## The loop
`MEASURE (coverage + capture + audits) → CHOOSE → BUILD → TEST → REVIEW → RECORD → repeat` (details and exit criteria in `docs/05`). Max 6 review iterations per page.

## Phases and gates
F0 Setup, inventory & identity fix → F1 Layout system, shell, sidebar, user menu → **GATE 1** → F2 Workspaces, team, invitations, projects → F3 Work items complete (create dialog, peek, bulk, labels, attachments, comments, voice) → **GATE 2** → F4 Bugs, stickies, search, notifications → F5 Account & workspace admin panels (profile, security, devices, data, labels, integrations, audit, danger zone) → F6 Coverage closure loop → **GATE 3** → F7 Polish loop & regression.
Prompts: `prompts/F0 … F7`. Start with F0.
