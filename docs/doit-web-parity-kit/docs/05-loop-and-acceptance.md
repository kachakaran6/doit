# 05 — Loop & Acceptance (two tracks, one loop)

## Tracks
- **Track F (features)**: close the API→UI coverage matrix (doc 02) with panels from doc 04.
- **Track L (layout/UX)**: container system, shell, sidebar, identity (doc 03) + the visual rubric from the premium web kit (`kit-web-premium/docs/04`).

## The loop (per feature group or page)
```
┌─► MEASURE   node scripts/api_coverage.mjs …  +  Playwright capture (3 viewports × dark/light × 2 accents)
│             + dom-audit (RAW_ENUM, GUTTER_ASYMMETRY, NESTED_PADDING, PLACEHOLDER_IDENTITY, …) + axe
│   CHOOSE    next uncovered group by user value, or the worst layout defect
│   BUILD     from the spec: API client fn + hook + UI (dialog/sheet/page) with all states + permission gating
│   TEST      Playwright happy path + permission-denied path; unit tests for logic; typecheck/lint
│   REVIEW    open screenshots; rubric (≥ 43/50, no dim < 4) for the touched pages
└── RECORD    docs/API_COVERAGE.md (generated) + docs/UI_LOOP_LOG.md row, then repeat
EXIT per group: coverage ✅ for its operations, tests green, rubric pass, audit 0 ERROR.
EXIT overall: coverage 100% (or owner-approved waivers), all pages pass rubric, identity/gutter/nested-padding audits 0, e2e green.
```

## Definition of done for a feature (checklist the agent ticks in the log)
- [ ] Reachable from nav / menu / ⌘K; deep-linkable
- [ ] Create/Read/Update/Delete as far as the API allows
- [ ] Validation errors mapped to fields; server errors show reason + retry
- [ ] Skeleton, empty, error, success toast; optimistic where safe
- [ ] Permission gating verified for owner/admin/member/guest (hidden/disabled + server 403 handled)
- [ ] Keyboard + a11y (axe clean), responsive at 390/1024/1440
- [ ] Realtime/cache invalidation correct (other tabs/phones see the change)
- [ ] Playwright test(s) + coverage matrix ✅

## Gates (stop, show evidence, wait for approval)
- **GATE 1** after F1: new shell + identity fixed + container system on every existing page. Evidence: before/after sheets, `layout-widths.json` (consistent), audit 0 for gutter/padding/identity.
- **GATE 2** after F3: projects/workspace/team/invitations + full work-item management. Evidence: coverage % by tag, recordings of create project → invite member → create task with all fields → bulk edit.
- **GATE 3** after F6: coverage closed, e2e green, rubric table. Evidence: final `API_COVERAGE.md`, waiver list for approval, test report.

## Waiver policy
A waiver needs: operation, reason (internal/mobile-only/deprecated), reviewer approval from the human. No waivers for CRUD on user-visible resources.

## Honest limits
Coverage detection is heuristic (it can miss generated clients or dynamic paths and can false-positive on string matches). The agent must (1) tune the script's patterns to the repo's client style in F0, (2) still click through each flow, (3) keep Playwright tests as the real proof.
