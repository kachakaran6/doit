# DoIt Web Premium UI Kit (React + shadcn/ui)

Fixes the web app shown in `reference/current/` (dark + light screenshots): default-template look, raw enum labels (`IN_PROGRESS`), two different pill styles for the same status, borders on everything, caps labels, duplicate create buttons, brand shown as "Dolt", a bug queue with no screenshots, a thin Settings page.

## Use
1. Copy to the repo as `kit-web-premium/`.
2. Install Playwright + axe in `apps/web` (`@playwright/test`, `@axe-core/playwright`) and point `scripts/capture.spec.ts` at your staging URL with a test user.
3. Give your agent `WEB_PREMIUM_LOOP_PROMPT.md`.

## Contents
| Path | What |
|---|---|
| `WEB_PREMIUM_LOOP_PROMPT.md` | Master prompt: rules, loop, phases V0–V8, 3 human gates |
| `docs/01-audit-of-current-web.md` | 35 itemized defects found in your screenshots |
| `docs/02-web-design-language.md` | Palette, status system, type, layout, depth, motion, components, copy |
| `docs/03-page-specs.md` | Shell, Overview, Tasks (list/board/table + peek), Bugs triage, Stickies, ⌘K, Settings |
| `docs/04-loop-protocol-and-rubric.md` | The loop, automated checks, 10-dimension rubric, anti-patterns |
| `docs/05-skills-and-libraries.md` | Verified agent skills + libraries |
| `templates/theme.css` | shadcn variables: light/dark × 5 accents, contrast-checked palette |
| `templates/badge-map.ts` | Single source of truth for status/priority/severity labels |
| `templates/premium-tokens.json` | Palette (same as mobile) |
| `templates/*.svg` | New logo/wordmark/favicon |
| `scripts/capture.spec.ts` | Playwright: login → every route × 3 viewports × 2 themes × 2 accents → PNG + DOM audit + axe |
| `scripts/dom-audit.js` | Detects raw enums, uppercase labels, inconsistent status styles, clipped text, tiny targets, missing names, duplicate primary CTAs, border-heavy cards, "Dolt" |
| `scripts/contrast.py`, `contact_sheet.py` | Palette check, before/after sheets |
| `prompts/V0…V8` | Phase prompts |

## Honest limits
- The scripts are provided **untested against your app** (route list, login labels, and theme switching are assumptions); the agent fixes them in V0.
- Automated checks catch objective flaws; **taste needs your eyes** (3 gates with side-by-side sheets).
- Screenshots 3's Windows Snipping Tool toast and the browser status bar text are not app bugs and are ignored in the audit.
