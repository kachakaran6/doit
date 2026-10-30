# Samyukt Kit — Agent Build Kit for the POC

Samyukt = a simple team task manager whose real purpose is to **kill the gap between finding a bug and logging it**.
Testers tap a floating bubble (or shake the phone) while testing any app → screenshot is captured → they speak or type → bug is created. Done.

## How to use this kit (for you)
1. Create an empty repo, copy this whole kit into the root.
2. Paste `KICKOFF_PROMPT.md` into your AI agent, or give it this single instruction:
   > "Read `AGENTS.md`, then `ORCHESTRATOR.md`, and execute the phases in order. Stop at every gate and report."
3. Agent works phase by phase using `prompts/P00..P08`. State is tracked in `STATUS.md` and `DECISIONS.md`.
4. You review at each GATE (demo checklist is in each prompt).

## Kit map
| File | Purpose |
|---|---|
| `KICKOFF_PROMPT.md` | Paste-ready first message for your agent |
| `AGENTS.md` | Permanent rules the agent obeys in every session |
| `ORCHESTRATOR.md` | Phase order, roles, parallelism, gates, handoff protocol |
| `docs/01-product-brief.md` | What and why, scope, non-goals |
| `docs/02-architecture.md` | Monorepo layout, backend modules, mobile feature architecture |
| `docs/03-tech-stack.md` | Exact stack + library choices |
| `docs/04-data-model-and-api.md` | Entities and REST contract (source of truth) |
| `docs/10-auth-workspaces-access-control.md` | Auth, multi-workspace, roles, permission matrix, invitations (authoritative for access) |
| `docs/05-design-system.md` | Plane-like UI, tokens, 5 accents, floating navbar, contextual keyboard |
| `docs/06-bug-capture-overlay.md` | The killer feature: floating bubble, shake, screenshot, voice |
| `docs/07-deployment-coolify.md` | Docker + Coolify |
| `docs/08-feature-recipe.md` | How to add any future screen/feature in the same pattern |
| `docs/09-acceptance-checklist.md` | POC definition of done |
| `prompts/P00..P08` | Self-contained prompt per phase |
| `templates/` | STATUS.md and DECISIONS.md starters |

## Honest platform notes (read once)
- **Android is the primary target for the overlay.** A bubble drawn over other apps needs `SYSTEM_ALERT_WINDOW`; screenshot of *other* apps needs `MediaProjection`. iOS does not allow either.
- **iOS gets a fallback** (in-app capture, screenshot-detection prompt, Share Sheet / Shortcuts entry). Documented in `docs/06`.
- The rest of the app (tasks, stickies, voice, themes) is fully cross-platform.
