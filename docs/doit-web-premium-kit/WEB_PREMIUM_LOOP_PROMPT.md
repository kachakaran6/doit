# WEB PREMIUM UI LOOP PROMPT — DoIt (React + shadcn/ui)

You are a principal product designer-engineer. The DoIt web app works but reads as a default admin template (see `reference/current/*.jpg`, `docs/01-audit-of-current-web.md`). Make it **Linear/Vercel/Apple-grade**: calm, dense, fast, consistent, and specific to our product (screenshot-first bug triage). **No UI or UX compromises.** You work in a measured **look → critique → fix → verify** loop with automated checks, not a one-shot restyle.

Company **Samyukt**, product **DoIt**. Brand blue matches the new logo.

## Read first (in order)
1. `docs/01-audit-of-current-web.md` — what's wrong (IDs A1…E6)
2. `docs/02-web-design-language.md` + `templates/premium-tokens.json`, `templates/theme.css`, `templates/badge-map.ts`
3. `docs/03-page-specs.md` — every page redesigned
4. `docs/04-loop-protocol-and-rubric.md` — loop, scripts, rubric, gates
5. `docs/05-skills-and-libraries.md` — install skills and READ their SKILL.md
6. `reference/current/` — the "before"

## Non-negotiable rules
1. **Look at screenshots each iteration** (3 viewports × dark/light × 2 accents) and critique them against the rubric. No design claims from code alone.
2. **System before pages**: tokens → shadcn theme → status/priority/severity components → shell → pages. All UI from `@doit/ui-web`; no raw colors/arbitrary px in pages (lint).
3. **One visual per concept**: a single status/priority/severity system via the label map; **no raw enums** (`IN_PROGRESS`) anywhere; same status looks identical on every page.
4. **Tone over lines**: no borders on cards/KPIs/badges/nav; hairlines only on table rows, inputs, sticky headers.
5. **One accent, sparingly**; contrast ≥ 4.5:1 (run `scripts/contrast.py`, 0 failures). Default accent Blue.
6. **Sentence case, 14px base, 13px tables**; no uppercase labels; brand name only as the SVG wordmark (fixes "Dolt").
7. **One global Create** (split button) — remove duplicate page-level create buttons; breadcrumbs reflect the real route.
8. **Show the product's value**: bug rows with screenshot thumbnails, device, reporter, voice indicator; split view with a screenshot viewer and audio player.
9. **Keyboard-first**: ⌘K palette, shortcuts, visible focus/hover/selected states, labeled view switchers.
10. **States everywhere**: skeleton, empty, error (reason + retry), offline, 403/404; designed copy, no jargon.
11. **Don't break**: auth/cookie flow, permission gating (`useCan`), realtime, URL state, Playwright e2e. Run them after each phase.
12. **Evidence or it didn't happen**: every phase ends with before/after contact sheet, `report.json` from the capture script, rubric table, commands run, and an UNVERIFIED list. Verify library APIs from official docs; log ADRs; commit per phase.

## The loop
`CAPTURE → AUDIT → CRITIQUE → SCORE → PLAN → FIX → VERIFY → RECAPTURE → repeat` — exit criteria, mandatory visual tests (squint, grayscale, 5-second, alignment, dead-space, 200% zoom) and log format are in `docs/04`. Max 6 iterations per page, then escalate.

## Phases & gates
V0 Setup & baseline → V1 Tokens, theme, badges → V2 Components & shell → **GATE 1** → V3 Overview + Tasks (list/board/table + peek) → V4 Bugs triage + Stickies + ⌘K → **GATE 2** → V5 Settings & admin pages → V6 States, motion, a11y, responsive → V7 Polish loop → **GATE 3** → V8 Regression & delivery.
(Phase prompts: `prompts/V0 … V8`.) At each gate stop and wait for approval with: contact sheet, 60 s recording, rubric table, open issues.

Start with V0.
