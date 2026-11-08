# DoIt Plane-Class Product Kit

Input: your `ALL_Screens.zip` (38 mobile screenshots) + the Plane mobile reference. Output: a complete target (80-screen map), a Plane teardown with tiers, design system v3, detailed specs for the key screens (Work item detail, Bug detail, Quick Capture, Intake, Cycles/Modules/Pages…), a **capture-integrity process**, and 10 phase prompts.

## Use
1. Copy to the repo as `kit-plane/` (alongside the earlier kits).
2. Give your agent `PLANE_CLASS_MASTER_PROMPT.md`.
3. Review at 4 gates with before|after sheets and `SCREEN_MATRIX.md`.

## Contents
| Path | What |
|---|---|
| `PLANE_CLASS_MASTER_PROMPT.md` | Mission, rules, loop, phases M0–M9, gates |
| `docs/01-audit-of-38-screens.md` | Itemized defects + the list of screens that were never actually captured |
| `docs/02-plane-teardown-and-scope.md` | Why Plane feels professional, Plane→DoIt concept map, T1/T2/T3 scope |
| `docs/03-complete-screen-map.md` | ~80 screens with status/tier/notes |
| `docs/04-design-system-v3.md` | Work-item row anatomy, hairline depth, controls, copy |
| `docs/05-key-screen-specs.md` | Detailed specs for the screens that define the product |
| `docs/06-loop-protocol-and-rubric.md` | Capture integrity, loop, rubric /55, gates |
| `docs/07-compliance-and-risks.md` | AccessibilityService, data export/delete, AI consent, licensing |
| `scripts/dedupe_check.py` | Finds duplicate screenshots (found 19 pairs in your zip) |
| `scripts/api_coverage.mjs`, `contrast.py`, `contact_sheet.py` | Coverage matrix, palette check, before/after sheets |
| `templates/maestro/*.yaml`, `screen_matrix_template.md` | Flow patterns with `assertVisible`, matrix |
| `reference/` | Your 38 screens (+ review sheets) and the Plane reference |
| `prompts/M0…M9` | Phase prompts |

## Honest limits
- "Perfect and complete" is a direction: this kit defines a measurable finish line (all T1 screens verified ≥ 47/55; T2 shipped feature-by-feature; coverage 100%). **T2 (Cycles, Modules, Pages, Views, comments…) needs new backend modules on both platforms — weeks of work, not a night.**
- I could only audit what the screenshots show. 19 of 38 were duplicates; Task detail, Bug detail/telemetry, Search results and three Quick-capture modes are **unverified** and must be re-captured.
- Plane facts come from public knowledge; verify against Plane's docs and app. Patterns only — no copying.
