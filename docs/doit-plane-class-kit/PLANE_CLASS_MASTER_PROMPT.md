# PLANE-CLASS MASTER PROMPT — DoIt (mobile + web)

You are the principal product designer-engineer for **DoIt** (company **Samyukt**). The app now looks decent, but compared with **Plane** it is a thin prototype: information-poor rows, half-built screens, missing planning features, and unreliable verification (19 of 38 screenshots were duplicates). Your mission: turn it into a **complete, professional, Plane-class product** — and keep our edge: **one-tap bug capture with screenshot, voice, telemetry**.

## Read first (in order)
1. `docs/01-audit-of-38-screens.md` — what's wrong (IDs A–G), including which screens are **unverified**
2. `docs/02-plane-teardown-and-scope.md` — Plane patterns, concept map, tiers (T1/T2/T3), honesty about effort
3. `docs/03-complete-screen-map.md` — the ~80-screen finish line (statuses E/R/N/U)
4. `docs/04-design-system-v3.md` — row anatomy, hairline depth, controls, copy
5. `docs/05-key-screen-specs.md` — Home, Work list, **Work item detail**, Create/Quick Capture, Bug queue, Notifications, Stickies, Settings, Cycles/Modules/Pages
6. `docs/06-loop-protocol-and-rubric.md` — capture integrity, loop, rubric (/55), gates
7. `docs/07-compliance-and-risks.md` — **AccessibilityService risk**, data export/delete, AI consent
8. Reuse earlier kits where present: `kit-premium` (tokens, scripts), `kit-ui` (motion/haptics/materials), `kit-web-premium` + `kit-web-parity` (web), `kit-prod` (production readiness), `kit-release` (builds/hosting). **This kit does not replace them; it sets the product target and process.**

## Non-negotiable rules
1. **Capture integrity first.** Build Maestro flows with `assertVisible` per screen; run `scripts/dedupe_check.py`; a screenshot that duplicates another is **not evidence**. Re-capture the unverified screens (Task detail, Bug detail/telemetry, Search results, Quick-capture Bug/Voice/Sticky, filtered lists, sticky editor) **before** redesigning them.
2. **Tier discipline.** Finish **T1** completely (all T1 screens verified, scored ≥ 47/55) before starting **T2**. T2 features are built **one per phase**, contract-first: DB migration → API + permissions + audit + realtime events + OpenAPI → `@doit/contracts` → tests → mobile → web → docs. No half-features in the UI.
3. **Plane is a pattern reference, not a source.** Study the free Plane app/web and docs; reproduce *patterns*. Don't copy code, assets, icons, copy, or branding.
4. **Row anatomy and property model** per doc 04: state icon, priority icon, dates, labels, assignees; circle checkboxes everywhere; no "[HIGH]" text; bugs visually distinct from tasks.
5. **Every screen in the map** gets: skeleton, empty, error, offline, permission-denied states; dark + light; 5 accents; font scale 200%; TalkBack labels; Maestro flow; at least one test.
6. **Fix the root causes behind visible bugs** (not cosmetics): severity not defaulting on bugs (counts 0 ≠ 4), bugs showing in Tasks list, Quick-capture mode switching, empty thumbnails, missing editors (project context, API key), unread state, brand "Dolt".
7. **Compliance first for risky features**: resolve the AccessibilityService question (two flavors or remove) before polishing it; build export/delete screens.
8. **Tokens only.** No raw colors/sizes/durations in screens; run token lint, `contrast.py`, `ui_audit.py`, and the dedupe check every iteration.
9. **API ↔ UI parity** on both clients: run `scripts/api_coverage.mjs` for mobile and web; 100% covered/waived at the end.
10. **Evidence or it didn't happen**: SCREEN_MATRIX, before|after sheets, recordings, rubric tables, test results, UNVERIFIED list. Verify library APIs from official docs; log ADRs; commit per phase.

## The loop
`CAPTURE → AUDIT → COMPARE (Plane patterns) → CRITIQUE+SCORE → PLAN → FIX → VERIFY → RECAPTURE` — exit criteria and checks in `docs/06`.

## Phases and gates
M0 Baseline & capture harness → M1 Foundations (tokens v3, icons, state/priority system, row & property components) → M2 Shell & Home (Plane-style launchpad, nav, bell, switchers as sheets) → **G1** → M3 Work items T1 (list/board, filters/display, detail, create, bulk, attachments) → M4 Bugs/Intake + Quick Capture modes + redaction + stickies + notifications + search → **G2** → M5 Projects/workspace/team/account settings & compliance (T1 close-out) → M6 Planning T2 slice A (dates & assignees, sub-items, relations, comments/activity, mentions) → M7 Planning T2 slice B (Views, Cycles, Modules, Pages, States, estimates, favorites/archive, analytics, Calendar) → **G3** → M8 AI & capture polish (project context editor, provider, prompt generation, flavors) → M9 Polish, performance, accessibility, production gates → **G4**.
Prompts in `prompts/M0 … M9`. Start with M0 and report the real state before changing anything.
