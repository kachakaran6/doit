# L1 — Tokens & typography
## Before you start
Read `PREMIUM_UI_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work inside the loop from `docs/04` (capture → audit → critique → score → plan → fix → verify → recapture). End with before/after contact sheet, audit output, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02` (§2–§5), `templates/premium-tokens.json`.

## Task
Implement the palette (surface ramp, text levels, semantic colors, 5 accents with `fill/text/soft`), type scale, spacing, radii, shadows as tokens in `@doit/tokens` / theme provider; default accent Blue; dark default, light equal. Run `scripts/contrast.py` (0 failures; adjust shades if needed and record why). Load Inter weights 400/500/600/700; add tabular-number support. Update the token linter to forbid raw colors/sizes/radii/shadows outside tokens. Update the Gallery to show the palette, type scale and elevation in 2 modes × 2 accents.

## Exit
Gallery screenshots pass the rubric dims 3, 4, 5; contrast script 0 fails.
