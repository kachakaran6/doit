# UI System & Gluestack Skill

## Web
Use React + TypeScript + Vite + **shadcn/ui**. Build shared tokens for surfaces, text, borders, spacing, typography, radii and focus states. Support five accent palettes and light/dark/system themes. Reuse consistent buttons, inputs, dialogs, dropdowns, menus, tables, search, toasts and empty states. Avoid hardcoded colors where tokens exist; no unnecessary badges, neon or glow effects.

## Requested skill
Run from the repository root:

```bash
npx skills add gluestack/agent-skills --skill gluestack-ui-v5
```

Read the installed skill instructions. Gluestack UI v5 is relevant primarily to the React Native mobile app. It is **not** a replacement for shadcn/ui on the web. Do not let the skill overwrite existing tokens or migrate the mobile UI without an explicit plan. Inspect package changes and Git diff before accepting. If installation is blocked, report it and continue using existing conventions; do not claim success.

## Design review
Check login, task list/detail, Kanban, notes, bug triage and settings for consistent spacing and interaction. Test keyboard-only operation, focus visibility, contrast, labels, reduced motion, narrow viewport and desktop. Verify all five accents and theme modes.
