# W02 — Web Design System — shadcn, accents, parity

**Lane** W · **Depends on** W01 · **Branch** `feat/w02-web-design-system`

## Load
- `09-PHASE2-RULES.md`
- `03-WEB-DESIGN-SYSTEM.md` (the whole spec)
- `03-DESIGN-SYSTEM.md` (Phase 1) for the component list and behaviour

## Goal
Install shadcn/ui, map it onto the shared tokens, and build the component layer so no page ever
invents its own styling.

## Deliverables
- `components/ui/` — shadcn primitives installed and adapted: button, input, textarea, select,
  checkbox, switch, badge, avatar, dialog, sheet, dropdown-menu, popover, tooltip, tabs,
  accordion, skeleton, separator, scroll-area, command, sonner
- `components/patterns/` — `PriorityDot`, `SeverityBadge`, `LabelPill`, `TaskRow`, `BugRow`,
  `StickyCard`, `EmptyState`, `FilterBar`, `UserAvatarGroup`
- the five isometric SVG illustrations shared from `@doit/tokens/assets` (same files as mobile)
- `routes/DevComponents.tsx` — a gallery page with every component × theme × accent
- contrast verification script wired into CI

## Requirements
- Map shadcn variables to our tokens exactly as `03-WEB-DESIGN-SYSTEM.md` §3.2 specifies. Never
  maintain two palettes.
- Component API parity with mobile per §3.4: same variant names, same sizes in the web scale,
  same colours. A `SeverityBadge` must look like its mobile sibling.
- `TaskRow` on web is one line with hover-revealed actions; on mobile it is two lines. Same data,
  same colours.
- `StickyCard` uses the same deterministic rotation formula as mobile (hash of id, −1.5°…+1.5°).
- `EmptyState` uses the same SVG illustrations at 160 px.
- Keyboard: every interactive element reachable by Tab, visible focus ring, `Esc` closes
  overlays.
- Dark mode via the `.dark` class on `<html>`, not a media query.

## Do not
- Do not use Tailwind palette colours (`text-blue-500`) anywhere.
- Do not use arbitrary values (`bg-[#...]`, `w-[317px]`).
- Do not build a floating pill navbar on web — the shell uses a docked sidebar (W03).
- Do not fork a shadcn component's styling without documenting why in the file header.

## Acceptance checks
- [ ] `DevComponents` renders every component in light/dark × 5 accents, nothing unstyled.
- [ ] A `SeverityBadge` on web and on mobile are visually equivalent (side-by-side screenshot).
- [ ] Contrast script passes for all accent pairs; it fails if a pair is broken.
- [ ] `check-tokens` equivalent for web exits 0 and catches `bg-[#...]`.
- [ ] Tab through the gallery: every control reachable, focus always visible.
- [ ] Nothing in `components/ui/` contains a raw hex value.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
