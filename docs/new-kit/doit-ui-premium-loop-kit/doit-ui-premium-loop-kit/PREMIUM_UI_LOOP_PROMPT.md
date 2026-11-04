# PREMIUM UI LOOP PROMPT — DoIt (React Native / Expo)

You are a principal mobile product designer-engineer. The DoIt app works but looks like a wireframe (see `reference/current/*.jpg` and `docs/01-audit-of-current-screens.md`). Your job: make it feel **Apple-premium on Android** — calm, clean, elegant, consistent, smooth — through a **measured loop of look → critique → fix → verify**, not a one-shot rewrite.

Company **Samyukt**, product **DoIt**, id `com.samyukt.doit` (unchanged). Brand blue matches the new logo.

## Read first (in order)
1. `docs/01-audit-of-current-screens.md` — what is wrong and why
2. `docs/02-design-language.md` + `templates/premium-tokens.json` — the system
3. `docs/03-screen-redesign-specs.md` — per-screen design
4. `docs/04-loop-protocol-and-rubric.md` — how you work and how you're judged
5. `docs/05-skills-and-libraries.md` — install the skills and READ their SKILL.md files
6. `reference/TARGET-plane-home-dark.jpg` (structure inspiration) and `reference/current/` (the "before")

## Non-negotiable rules
1. **Look at screenshots every iteration.** You must open the PNGs (dark + light) and critique them against the rubric. No design claims from code alone.
2. **System before screens.** Order: tokens → primitives → shell → screens. Never style a screen with raw values; if a value is missing, add it to tokens first.
3. **Tone, not borders.** No borders on cards/chips/buttons. Depth = surface ramp + soft shadow for floating elements. Hairlines only as list separators.
4. **One accent, sparingly.** Default Blue. White text only on `fill`; use the lighter `text` accent for text on dark. Run `scripts/contrast.py` after every palette change (0 failures).
5. **Sentence case, weight-led hierarchy, one margin (20) on every screen.** No caps+tracking labels.
6. **One create path** (`+`), one button system, one chip system, one icon set.
7. **Fix the listed layout bugs first** (audit A1–A7) and keep them fixed using `scripts/ui_audit.py`.
8. **Remove developer info from user UI** (F2); real names (F1); human microcopy (F3).
9. **Don't break features.** Quick Capture overlay, widgets, offline queue, auth, workspace/role UI, keyboard bar, themes (light/dark/system × 5 accents) must still work; run Maestro/regression after each phase.
10. **Performance is part of premium.** Animations on the UI thread; ≥ 58 fps on a mid-range device; effect tiers (Full/Balanced/Lite) from `kit-ui` if blur is used.
11. **Evidence or it didn't happen.** Every phase ends with: before/after contact sheet, audit output, rubric table, commands run, and anything `UNVERIFIED`.
12. Verify library APIs against current docs; log ADRs in `DECISIONS.md`; commit per phase.

## The loop (applies inside every phase)
`CAPTURE → AUDIT → CRITIQUE → SCORE → PLAN → FIX → VERIFY → RECAPTURE → (repeat)` — exit rules, rubric, mandatory visual tests and the log format are in `docs/04`. Max 6 iterations per screen, then escalate with notes.

## Phases and gates
L0 Setup & baseline → L1 Tokens & type → L2 Primitives → L3 Shell (nav, header, sheets) → **GATE 1** → L4 Home · Tasks · Bugs · Search → L5 New item sheet · Account · Settings · Switchers → **GATE 2** → L6 States, motion, haptics → L7 Polish loop (score-driven) → **GATE 3** → L8 Regression & delivery.
At each gate: contact sheet (before|after, dark+light), 60 s screen recording, rubric table, open issues. **Stop and wait for approval.**

Prompts for each phase: `prompts/L0 … L8`. Start with L0.
