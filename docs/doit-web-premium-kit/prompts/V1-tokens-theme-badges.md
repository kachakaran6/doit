# V1 — Tokens, theme, status system
## Before you start
Read `WEB_PREMIUM_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/04`. End with the contact sheet, `report.json` summary, rubric table, commands run, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02` §2–§4, `templates/*`.
## Task
Implement `theme.css` from `@doit/tokens` (light/dark × 5 accents; default Blue); run `scripts/contrast.py` (0 fails). Self-host Inter; set the web type scale (14/13/12, page title 24). Build `labels`/`badge-map` plus `StatusBadge`, `PriorityBadge`, `SeverityBadge`, `BugStateBadge` and replace **every** raw enum in the app; ensure one style per status across pages (fixes A3, A4). Replace the brand text with the SVG wordmark + new icon (A1, A2). Update the token linter (no hex/rgb/arbitrary px/non-semantic Tailwind colors). `/design` gallery shows palette, type, badges, elevation in 2 modes × 2 accents.
## Exit
Gallery passes rubric dims 3–7; DOM audit has no RAW_ENUM / INCONSISTENT_STATUS_STYLE / BRAND_TEXT findings.
