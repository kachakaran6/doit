# 04 — Loop Protocol & Rubric (web)

## 1. The loop (per page/component group)
```
┌─► CAPTURE   Playwright screenshots: 1440×900, 1024×768, 390×844 × dark/light × accent Blue + Violet
│   AUDIT     scripts/dom-audit.js (via capture.spec.ts) + axe-core + contrast.py + token/raw-color lint
│   CRITIQUE  open the images; write findings against the rubric; cite audit IDs (A1…F)
│   SCORE     0–5 per dimension (/50) with one-line justifications
│   PLAN      top 3–5 defects by impact (hierarchy → structure → type → color → polish)
│   FIX       tokens/components first, pages last
│   VERIFY    typecheck + lint + unit + Playwright e2e
└── RECAPTURE ─► contact sheet (before|after) ─► repeat
EXIT: 0 DOM-audit ERRORs, 0 axe serious/critical, contrast 0 fails, no rubric dimension < 4, average ≥ 4.3,
      dark+light and 3 viewports pass. Max 6 iterations per page; then escalate with notes.
```
Log each iteration in `docs/UI_LOOP_LOG.md`: `iteration | page | before | after | defects fixed | remaining | evidence`.

## 2. Automated checks (scripts)
| Script | Catches |
|---|---|
| `scripts/capture.spec.ts` | logs in, visits every route × viewport × theme × accent, saves PNG, runs the DOM audit and axe, writes `shots/<run>/report.json` |
| `scripts/dom-audit.js` | raw enum text (`IN_PROGRESS`), uppercase-transformed labels, text < 12px, clipped/overflowing text without ellipsis, interactive targets < 24px (desktop) / 40px (mobile), horizontal page scroll, multiple primary buttons in view (duplicate CTAs), border-heavy cards (card with border + ≥ N bordered children), missing accessible names on icon buttons, inconsistent status styling (same text rendered with different background colors) |
| axe-core | WCAG A/AA violations |
| `scripts/contrast.py` | palette contrast pairs |
| `scripts/contact_sheet.py` | before/after sheet for human review |
| token lint | no hex/rgb/arbitrary px/non-semantic Tailwind colors in `apps/web` |
(The scripts are provided untested against your app; first thing in V0 the agent runs them and fixes any selector/login assumptions.)

## 3. Mandatory visual checks
Squint test (blur → one focal point?) · grayscale test (hierarchy without hue?) · 5-second test (what is this page for, what's the primary action?) · alignment sweep (left edges, baselines, icon centering) · dead-space sweep · consistent container widths · dark/light parity · zoom 200% & narrow window · hover/focus/selected/disabled states exist · compare against `reference/current` (before) and the reference products in doc 02.

## 4. Rubric (0–5)
| # | Dimension | 1 | 3 | 5 |
|---|---|---|---|---|
| 1 | Hierarchy | all equal weight | clear title/groups | single focal point; reading order obvious in 2 s |
| 2 | Layout & spacing | inconsistent widths, dead zones | mostly on grid | strict grid, consistent containers, balanced whitespace |
| 3 | Typography | template sizes, caps labels | one scale | tight web scale, weight-led hierarchy, tabular numbers |
| 4 | Color & contrast | washed, accent overused, AA fails | consistent palette | tonal depth, accent sparing, AA everywhere |
| 5 | Surfaces & borders | border-on-everything | some tonal depth | tonal layers, hairlines only where needed |
| 6 | Information design | raw/enum data, sparse rows | useful columns | right info at right density, product-specific (screenshots, devices) |
| 7 | Component consistency | one-offs, 2 pill systems | shared components | every pattern from `@doit/ui-web`; one status/priority system |
| 8 | Interaction & motion | no hover/focus, abrupt | basic states | keyboard-first, ⌘K, smooth 120–180ms, reduced-motion safe |
| 9 | States & content | no empty/loading/error, jargon | present | designed states, human copy, realistic data |
| 10 | Accessibility & responsive | fails axe, breaks < 1024 | passes AA basics | AA + keyboard complete + works 390–1920 |
Page passes at ≥ 43/50, no dimension < 4.

## 5. Human gates
After **V2 (system+shell)**, **V4 (core pages)**, **V6 (polish)**: contact sheet (3 viewports × 2 themes), 60 s screen recording, rubric table; **stop and wait for approval**.

## 6. Anti-patterns (never reintroduce)
Raw enums in UI · two pill styles for one concept · borders on every card · caps+tracked labels · duplicate create buttons · generic breadcrumb · accent buttons below 4.5:1 · unlabeled icon-only toggles · jargon subtitles · typing the brand as plain text · full-width and 960px containers on neighboring pages · stat cards without context.

## 7. Evidence rule
No "done" without before/after sheets, audit JSON, rubric table, commands run, and an UNVERIFIED list (e.g., "not tested in Safari").
