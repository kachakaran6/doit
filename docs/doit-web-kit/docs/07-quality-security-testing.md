# 07 — Quality, Security & Testing

## Test pyramid
| Layer | Tooling | Minimum |
|---|---|---|
| Unit | Vitest | permission helpers, quick-add parser integration, URL-state schemas, formatters |
| Component | Testing Library | composites with logic (pickers, DataTable, Board card, Can gate) |
| API mocking | MSW **tests only** | never in dev/prod runtime |
| E2E | **Playwright against the real API + Postgres** | auth, role matrix, CRUD, board DnD, triage, admin, public pages |
| Accessibility | axe-core in Playwright | no serious/critical on every route |
| Visual | Playwright screenshots | key pages × light/dark × 2 accents (baseline images) |
| Performance | Lighthouse CI on built bundle | perf ≥ 90, a11y ≥ 95, best-practices ≥ 95 |

## E2E must cover
Register → onboarding → project → create items (quick add) → edit → board drag → filters in URL → bug from API fixture with screenshot/audio appears in triage → bulk actions → invite second user (second browser context) → role limits (owner/admin/member/guest) per page/action → remove member (loses access immediately) → logout everywhere → mobile-revoked session logs web out → IDOR URL tampering → expired access token silent refresh → CSRF without header rejected → nothing sensitive in storage → theme/accent persistence → public pages reachable logged out.

## Security checklist (web)
- [ ] Access token in memory only; refresh cookie HttpOnly+Secure+SameSite=Strict (verified in the browser)
- [ ] CSP/headers present on built container (test); no inline scripts
- [ ] Markdown sanitized (XSS payload test); uploads rendered via signed URLs; no HTML injection
- [ ] Open-redirect (`next=`) rejected for external URLs
- [ ] Clickjacking blocked (`frame-ancestors 'none'`)
- [ ] No secrets in bundle (grep build output); source maps not public
- [ ] `pnpm audit` clean for high/critical; lockfile committed; Renovate/Dependabot
- [ ] Rate-limit and lockout behaviors surfaced gracefully
- [ ] Logout clears memory, caches, BroadcastChannel notified, WS closed

## Performance rules
Route-level code splitting, lazy-load heavy parts (charts, editor, lightbox), virtualize long lists, image thumbnails, debounce search 250 ms, avoid re-render storms (selectors, memoized rows), bundle budget (initial JS < ~250 KB gzip; verify and record).

## Accessibility
Keyboard-complete, visible focus, aria labels on icon buttons, live regions for toasts/updates, reduced motion respected, color never the only signal (icons + text for state/priority), contrast ≥ 4.5:1 in all 10 theme combos (automated), zoom to 200%.

## Definition of done (any page)
Skeleton/empty/error states · permission-aware · URL state · responsive · keyboard · dark/light × accents · Playwright test · no console errors · no raw colors (lint).
