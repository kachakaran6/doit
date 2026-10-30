# W10 — Web QA, Accessibility, Performance, Deploy

**Lane** W · **Depends on** W09 · **Branch** `feat/w10-web-qa-performance-deploy`

## Load
- `09-PHASE2-RULES.md`
- `02-WEB-ARCHITECTURE.md` §2.7
- `10-LAUNCH-CHECKLIST.md` §5, §7
- `04-WEB-AUTH-AND-AUTHZ.md` §4.8

## Goal
Ship the web app: tested, accessible, fast, deployed to `app.samyukt.com` with real security
headers.

## Deliverables
- Playwright suite covering 12 critical journeys
- Vitest unit tests for `lib/`, hooks and the permission gate
- accessibility pass: axe-core in CI + a manual keyboard-only walkthrough
- performance pass: code splitting, prefetch, image sizing, virtualisation audit
- deployment: static build to the CDN, security headers, `app.samyukt.com` + TLS
- `docs/WEB-QA-REPORT.md`

## Requirements
Critical journeys for Playwright (each as a named test):
1. register → verify → dashboard
2. login → reload → still logged in
3. create a task from the board
4. drag a card across columns
5. open a task drawer by URL
6. post a comment
7. upload an attachment
8. filter the board and reload (URL state)
9. bulk change status
10. invite a member and accept in a second context
11. revoke a session and observe the logout
12. search with an operator

Accessibility: zero `axe` violations at `critical` or `serious`; keyboard-only completion of
journeys 3, 4 and 5; screen-reader labels on every icon button.

Performance: Lighthouse ≥90 performance, ≥95 accessibility; route-level splitting verified by
bundle analysis; no route over 150 KB gzip.

Deploy: `Cache-Control: immutable` on hashed assets, `no-cache` on `index.html`; CSP, HSTS,
`nosniff`, `Referrer-Policy`; `/health` reachable; a rollback procedure documented.

## Do not
- Do not disable axe rules to make CI green.
- Do not ship without the CSP — an authenticated app with no CSP is an XSS away from a breach.
- Do not skip the keyboard walkthrough; it catches what axe cannot.

## Acceptance checks
- [ ] All 12 Playwright journeys pass in CI, headless and headed.
- [ ] `axe` reports zero critical/serious violations on every route.
- [ ] Journeys 3, 4, 5 completed with the keyboard only (recorded).
- [ ] Lighthouse ≥90 / ≥95 on the board and the drawer.
- [ ] Deployed to `app.samyukt.com`; security headers verified with `curl -I`.
- [ ] A person who has never seen the app files a bug on web unaided.
- [ ] `docs/WEB-QA-REPORT.md` committed with results and screenshots.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
