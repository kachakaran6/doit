# W7 — Public pages, QA, deployment
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `06` (Public pages), `07`, `08`.

## Task
1. Public pages: `/privacy`, `/terms`, `/delete-account`, `/download` (APK/Play link, install guide, OEM battery tips) — marked "draft, needs legal review". These URLs are used in the Play Console.
2. Full Playwright suite + visual baselines + axe + Lighthouse CI in CI; `pnpm audit`; bundle secret scan; security-header tests against the built container.
3. `docker/web.Dockerfile` + `docker/nginx.conf` (same-origin proxy of `/api` and `/ws`, caching rules, CSP/headers, `/healthz`); add to compose.
4. Deploy `doit-web` on Coolify (staging first, then production) per `docs/08`; verify login, cookie attributes, WS, big upload, headers, Lighthouse on the live URL.
5. Sentry release + source maps (uploaded, not public); Uptime Kuma monitors.
6. Docs: `apps/web/README.md`, user guide, update `STATUS.md`, `BACKLOG.md` (calendar/timeline views, saved views, comments rich editor, web voice, integrations, SSO/2FA/passkeys, i18n).

## GATE G-W3 (final)
Final report with evidence, live URLs, open issues; wait for human approval.
