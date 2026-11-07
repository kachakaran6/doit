# DoIt Web Feature-Parity + Layout Kit

Round 2 for the web app (see `reference/current/`): the visuals improved a lot, but the sidebar footer shows "Account / U" instead of the real user, pages have unwanted and inconsistent left/right space (Settings leaves a ~370px dead strip), and most backend capabilities have no screen (no New project, Team/invitations, labels, notifications, audit log, workspace settings…).

## Use
1. Copy to the repo as `kit-web-parity/` (next to `kit-web-premium/`).
2. Make sure the API serves its OpenAPI JSON (Swagger `/docs-json` or similar).
3. Give your agent `WEB_FEATURE_PARITY_LOOP_PROMPT.md`.

## Contents
| Path | What |
|---|---|
| `WEB_FEATURE_PARITY_LOOP_PROMPT.md` | Master prompt: rules, loop, phases F0–F7, 3 gates |
| `docs/01-audit-round-2.md` | Defects A–D found in your 4 new screenshots |
| `docs/02-api-to-ui-coverage-spec.md` | Rule "every API operation gets a UI"; expected inventory (auth, workspaces, members, invitations, projects, work items, labels, comments, attachments, bugs, voice, stickies, search, notifications, audit, SMTP, system) |
| `docs/03-layout-and-shell-spec.md` | PageContainer system, row column grid, sidebar, top bar, user menu, workspace switcher, responsive rules |
| `docs/04-panels-spec.md` | Account, Team, Projects, Workspace settings, Create dialogs, onboarding, role exposure |
| `docs/05-loop-and-acceptance.md` | Loop, definition of done, gates, waiver policy |
| `scripts/api_coverage.mjs` | **Reads the OpenAPI spec and your client source → coverage matrix (✅/❌) per endpoint**; exits non-zero until 100% or waived (tested on a sample) |
| `scripts/dom-audit.js`, `capture.spec.ts` | Extended with GUTTER_ASYMMETRY, NESTED_PADDING, WIDE_GUTTERS, PLACEHOLDER_IDENTITY, cross-page container-width check |
| `templates/api-waivers.json` | Starter waiver list |
| `templates/theme.css`, `badge-map.ts`, `premium-tokens.json` | Design system from the premium kit |
| `prompts/F0…F7` | Phase prompts |

## Honest limits
- I haven't seen your API. The feature inventory is the *expected* shape; the live OpenAPI spec decides what must exist.
- `api_coverage.mjs` is heuristic (string/regex call-site search). It will need tuning to your client style (F0) and doesn't prove the UI is good — Playwright tests do.
- The layout checks are heuristics too; your eyes at the 3 gates are the final judge.
