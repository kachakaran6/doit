# P19 — Mobile UI on gluestack-ui v5 (Mobile)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `12`. First run: `npx skills add gluestack/agent-skills --skill gluestack-ui-v5` and read the skill.

## Task
Execute the migration plan in `docs/12`: spike + ADR (NativeWind v5 vs UniWind) → provider/theme → replace `src/ui` groups behind unchanged public API → rebuild FloatingNavBar/Fab/KeyboardToolbar → new token linter → Gallery with 10 theme combos → verify Quick Capture activity + widgets → delete dead code.
Shared token package `@doit/tokens` must emit shadcn-compatible semantic names (web will reuse it in W0).

## Verify
Gallery screenshots (light/dark × 5 accents), typecheck/lint/token-lint, all feature screens visually checked, cold-start + bundle size compared to baseline.

## GATE G7 (together with P18)
Show before/after screenshots; wait for human OK.
