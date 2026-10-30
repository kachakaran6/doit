# B02 — Observability, Security Headers, Backups

**Lane** B · **Depends on** B01 · **Branch** `feat/b02-observability-security-backups`

## Load
- `09-PHASE2-RULES.md`
- `10-LAUNCH-CHECKLIST.md` §5, §7
- `04-WEB-AUTH-AND-AUTHZ.md` §4.8

## Goal
Make the system observable and defensible: you should learn about a problem before a user
tells you.

## Deliverables
- Sentry in all three apps (api, mobile, web) with source maps uploaded in CI
- structured log shipping (pino → the platform's log drain), PII scrubbed
- security headers middleware (helmet) on the API and CSP for the web app
- uptime + synthetic checks: health, login, create-task (a canary account)
- alert routing to a channel a human reads
- analytics events from `10-LAUNCH-CHECKLIST.md` §7 wired on both clients
- a written incident runbook `docs/INCIDENT.md`
- scheduled backup verification job

## Requirements
- Sentry: separate projects, `release` = version + build number, `environment` set, user
  context attached but never the email in breadcrumbs. Filter out expected 401s.
- Logs: request id, user id (hashed), route, status, latency. Never log bodies, tokens,
  transcripts, or file contents.
- CSP for web: `default-src 'self'`; `connect-src` = API + WS origins; `img-src` = self + the
  CDN; no `unsafe-inline` for scripts (use nonces if a library forces it).
- Canary: a dedicated account that logs in and creates+deletes a task every 5 minutes from two
  regions. Alert on two consecutive failures.
- Backup verification: a weekly job restores the latest snapshot into a scratch DB, runs
  `prisma migrate status` and a row-count sanity query, then drops it. Alert on failure.
- Alerts: page on API down, error rate >2% for 5 min, p95 latency >1 s, queue depth >500,
  failed backup, cert expiry <14 days.

## Do not
- Do not send PII to Sentry or the log drain.
- Do not alert on every error — alert on symptoms users feel, or the channel gets muted.
- Do not use `console.log` anywhere; the logger only.

## Acceptance checks
- [ ] A deliberate exception in each app appears in Sentry with readable source-mapped stack.
- [ ] The API response includes `Strict-Transport-Security`, `X-Content-Type-Options`,
      `Referrer-Policy`; the web app serves a CSP without `unsafe-inline` scripts.
- [ ] `grep -ri "console.log" apps/` returns nothing.
- [ ] Stopping the API triggers an alert within 5 minutes.
- [ ] The canary fails visibly when the API is down and recovers automatically.
- [ ] The weekly restore job has run once successfully and logged its row counts.
- [ ] `docs/INCIDENT.md` lists the first five actions for: API down, DB down, queue backed up,
      bad deploy, leaked credential.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
