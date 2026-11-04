# DoIt Premium UI Loop Kit

For the current state of the app (9 screenshots in `reference/current/`): functional, but visually wireframe-grade. This kit contains a **loop-engineered prompt**, a concrete **design language with verified colors**, **per-screen redesign specs**, and **scripts** that let the agent test its own work (layout audit from `uiautomator`, WCAG contrast check, before/after contact sheets).

## Use
1. Copy the folder into the repo as `kit-premium/`.
2. Connect an Android device/emulator with the app installed and logged in.
3. Give your agent `PREMIUM_UI_LOOP_PROMPT.md`. It runs L0 → L8 with 3 human gates.

## Contents
| Path | What |
|---|---|
| `PREMIUM_UI_LOOP_PROMPT.md` | Master prompt (rules, loop, phases, gates) |
| `docs/01-audit-of-current-screens.md` | 30+ itemized defects (A1…F5) found in your screenshots |
| `docs/02-design-language.md` | Palette, type, spacing, depth, icons, components, microcopy |
| `docs/03-screen-redesign-specs.md` | Home, Tasks, Bugs, Search, New item, Account, Settings, switchers, overlay |
| `docs/04-loop-protocol-and-rubric.md` | The loop, visual tests, 10-dimension rubric, anti-patterns |
| `docs/05-skills-and-libraries.md` | Verified agent skills to install + libraries |
| `templates/premium-tokens.json` | Dark/light surface ramps, text, semantic colors, 5 accents (all contrast-checked) |
| `scripts/contrast.py` | WCAG check for the token file |
| `scripts/ui_audit.py` | Finds edge-flush text, clipped text, overlaps, small targets from a uiautomator dump |
| `scripts/capture_screens.sh`, `routes.txt` | Batch screenshot + XML capture via adb |
| `scripts/contact_sheet.py` | Before | after review sheets |
| `prompts/L0…L8` | Phase prompts |
| `reference/` | Your current screens + the Plane target |

## Honest limits
- A rubric and scripts catch layout bugs, contrast failures and inconsistency; **taste still needs your eyes**, hence the 3 gates with side-by-side sheets.
- "Apple-level" is the feel (tone, hierarchy, motion, restraint), not a pixel clone; SF Pro/SF Symbols can't ship on Android, so Inter + an open icon set are used.
- Run it on a real mid-range phone; emulator smoothness proves nothing.
