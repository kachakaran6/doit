# 06 — Loop Protocol, Capture Integrity & Rubric

## 1. Capture integrity (new — the last capture run was 50% duplicates)
1. Every screen has a **Maestro flow** `flows/<S-ID>.yaml` that navigates deterministically (seeded data), `assertVisible` on a text unique to that screen, then `takeScreenshot`.
2. After each capture batch run `python3 scripts/dedupe_check.py shots/<run>`; **any duplicate = invalid run** (fix the flow, re-capture). 
3. Maintain `docs/SCREEN_MATRIX.md`: `S-ID | screen | status (E/R/N/U) | screenshot | rubric score | flow | test | verified date`. A screen is **verified** only with a unique screenshot (dark + light), audit pass, flow green, score ≥ 43.
4. Seed data must be realistic: ≥ 3 projects, 6 members, 40 work items (varied states/priorities/dates/labels/assignees), 10 bugs with real screenshots/audio/telemetry, notifications, stickies, cycles/modules once built.

## 2. The loop (per screen or component group)
```
┌─► CAPTURE (flows, dark+light, accent Blue + Violet, font 100%/200%, 360×640 + 412×915)
│   AUDIT   dedupe_check · ui_audit.py (uiautomator) · contrast.py · token lint · typecheck
│   COMPARE side-by-side with Plane reference screens (kit reference + the free Plane app/web) — structure and density, not pixels
│   CRITIQUE+SCORE (rubric below, evidence per dimension)
│   PLAN → FIX (tokens → components → screens; contract-first for new data) → VERIFY (tests) 
└── RECAPTURE → contact sheet (before|after) → repeat. Max 6 iterations per screen, then escalate.
EXIT per screen: 0 ERROR audit, rubric ≥ 43/50 with no dimension < 4, flow green, states all designed.
```
Log in `docs/UI_LOOP_LOG.md` (iteration, screen IDs, before/after, defects, evidence).

## 3. Rubric (0–5, /55)
Dimensions 1–10 from `kit-premium/docs/04` (hierarchy, spacing, typography, color/contrast, surfaces, icons, component consistency, motion/feedback, states/content, platform polish) **plus 11. Information design & feature completeness**: 1 = placeholder data/properties missing; 3 = core properties shown; 5 = Plane-grade row/detail anatomy, all properties editable, filters/display/views where in scope.
Pass: ≥ 47/55, no dimension < 4.

## 4. Mandatory checks per screen
Squint · grayscale · 5-second · alignment · dead-space · dark/light parity · 200% font · small phone · keyboard overlap · back behavior · offline state · permission-denied state · long-text/emoji/RTL · 1000-item performance (lists).

## 5. Finish line (definition of "complete")
- 100% of **T1** screens in the map: built, verified, scored ≥ 47/55, flows + tests green.
- T2 features: each shipped feature ships API + contracts + mobile + web + tests + docs; the matrix shows ✅ for web and mobile.
- API→UI coverage (`api_coverage.mjs`) 100% or waived, for both web and mobile source.
- Play-compliance checklist done (doc 07); production readiness kit gates passed.

## 6. Gates (stop, show evidence, wait for approval)
**G1** after M2 (foundations + shell + Home) · **G2** after M4 (work items + bugs/intake + capture) · **G3** after M6 (T2 planning + collaboration slices) · **G4** after M9 (polish, perf, compliance).
Evidence: SCREEN_MATRIX, contact sheets (before|after), 60 s recordings, rubric tables, coverage reports, test results, UNVERIFIED list.

## 7. Anti-patterns (never)
Bare "[HIGH]" text · square/circle checkbox mix · caps+tracked headers · inline-expanded pickers in sheets · invisible inputs · mismatched switch colors · slugs/IDs in UI · "Is:open" casing · placeholder names · duplicate screenshots as proof · plain-text brand "Dolt" · features without states/tests.
