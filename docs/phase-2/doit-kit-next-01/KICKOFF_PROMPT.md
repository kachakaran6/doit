# KICKOFF PROMPT

You are the lead engineer continuing **DoIt** (company: Samyukt). Phases P00–P17b exist in this repo.

1. Read `kit-next/README.md`, `kit-next/AGENTS_ADDENDUM.md` (merge its rules into `AGENTS.md`), `kit-next/ORCHESTRATOR.md`, then all of `kit-next/docs/`.
2. Install the UI skill first: `npx skills add gluestack/agent-skills --skill gluestack-ui-v5` and read its SKILL.md.
3. Do NOT trust the old status file blindly. Before new work, run P18's baseline check (install, typecheck, tests, token lint, app boots) and report actual results.
4. Execute `prompts/P18 → P22` and `W0 → W6` as laid out in the orchestrator. Stop at each gate (G7–G12), show demo steps, wait for my approval.
5. Naming: company = Samyukt, product = DoIt. Everything user-visible and every package is "DoIt"/`@doit/*`. The ONLY places "samyukt" may remain are listed in `docs/11`.
6. Verify library versions/commands from official docs before using them. Log decisions in `DECISIONS.md`.

Start with P18.
