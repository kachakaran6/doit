# 05 — Skills & Libraries

## Agent skills (install, then READ each SKILL.md; verify install syntax with `npx skills add --help`)
| Skill | Install | Use |
|---|---|---|
| **web-design-guidelines** (Vercel, verified) | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` | Audits UI code against Web Interface Guidelines (a11y, interaction, forms, typography). It fetches the latest rules at review time, so the agent needs network access |
| **vercel-react-best-practices** (verified) | `npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices` | React performance rules (bundle, re-renders, data fetching) |
| **frontend-design** (Anthropic skills repo; verify the exact repo/name in the registry) | `npx skills add anthropics/skills --skill frontend-design` | Pushes distinctive, non-template visual decisions |
| **shadcn-ui / tailwind-theme-builder** (community skills seen on skills.sh; vet the SKILL.md and audit badges first) | `npx skills find shadcn` | shadcn + Tailwind v4 theming with `@theme inline`, dark mode |
Rules: skills run with the agent's permissions → read SKILL.md and the skills.sh audit info before installing; pin installed skills in `DECISIONS.md`; if a skill conflicts with `docs/02–03`, the **design spec wins**.

## Libraries (verify against the repo's current versions)
Already in the web kit: React, Vite, Tailwind v4, **shadcn/ui (Radix)**, TanStack Router/Query/Table/Virtual, react-hook-form + zod, dnd-kit, cmdk, sonner, Recharts via shadcn Chart, date-fns, lucide-react.
Add for premium feel:
| Need | Library |
|---|---|
| Layout/enter/exit animations | **Motion** (`motion/react`) — list reorder, popover/drawer, skeleton→content |
| Drawers on mobile widths | **vaul** (shadcn Drawer) |
| Resizable panes | shadcn `Resizable` (react-resizable-panels) |
| Image zoom/pan | `react-zoom-pan-pinch` or lightweight custom |
| Audio waveform-lite | custom canvas/SVG bars or `wavesurfer.js` (lazy-loaded) |
| Virtualized tables | TanStack Virtual |
| Sparklines | Recharts/tiny SVG (no heavy chart in KPI cards) |
| Font | Inter via `@fontsource-variable/inter` (self-hosted) |
| Visual/a11y testing | Playwright, `@axe-core/playwright` |
| Performance budgets | Lighthouse CI |
Avoid: extra component libraries (MUI/Chakra/Ant) mixed with shadcn; icon packs besides lucide + our status SVGs; CSS-in-JS; heavy chart libs in above-the-fold.
