# Implementation Checklist

## N0 Audit
- [ ] Read docs/config; preserve Git changes
- [ ] Verify package names, app IDs, API prefix, auth and endpoints
- [ ] Run current lint/typecheck/tests/token checks
- [ ] Audit RBAC, tenant isolation, uploads, overlay and offline behavior
- [ ] Produce evidence-based gap report

## N1 Branding
- [ ] Inventory occurrences before editing
- [ ] Keep `com.samyukt.doit`
- [ ] Keep valid `@samyukt/*` scopes
- [ ] Fix user-facing product display to DoIt
- [ ] Verify package commands and native config

## N2 Web foundation
- [ ] React + TypeScript + Vite + shadcn/ui
- [ ] `apps/web` / `@samyukt/web` if appropriate
- [ ] Shared tokens/contracts, API client, routing, env validation
- [ ] `.env.example` only; no secrets

## N3 Auth
- [ ] Login/logout/session expiry
- [ ] Workspace selection and role-aware UI
- [ ] No long-lived token in localStorage
- [ ] Cross-workspace negative tests

## N4 Features
- [ ] Today/Inbox/Upcoming
- [ ] Task list/detail/create/edit
- [ ] Kanban and valid state transitions
- [ ] Sticky notes and conversion
- [ ] Bug triage and supported uploads
- [ ] Search, notifications, settings

## N5 Quality
- [ ] Five accents and theme modes
- [ ] Responsive layout and keyboard accessibility
- [ ] Loading/empty/error/denied states
- [ ] WebSocket auth/scope verified if enabled

## N6 Release
- [ ] Lint/typecheck/tests/build pass
- [ ] Security and API integration tests pass
- [ ] Production env/CORS/HTTPS documented
- [ ] Monitoring and rollback documented
- [ ] Evidence-based final report
