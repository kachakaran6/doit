# W01 — Web Authentication — cookies, CSRF, guards, invites

**Lane** W · **Depends on** W00, B00 · **Branch** `feat/w01-web-auth`

## Load
- `09-PHASE2-RULES.md`
- `04-WEB-AUTH-AND-AUTHZ.md` (the whole spec — this prompt implements it)
- `05-BACKEND-CHANGES-FOR-WEB.md` §5.1–5.5 (assume B00 delivered these)

## Goal
Make the web app log in like a professional web app: httpOnly refresh cookie, in-memory access
token, silent refresh on reload, CSRF, multi-tab consistency, route guards, invites.

## Deliverables
- `features/auth/` — `LoginScreen`, `RegisterScreen`, `ForgotScreen`, `ResetScreen`,
  `VerifyScreen`, `InviteScreen`, `AuthLayout`
- `app/providers/AuthProvider.tsx` — session bootstrap, silent refresh, `BroadcastChannel`
- `lib/csrf.ts` — reads the cookie, exposes the header value
- `routes/RequireAuth.tsx`, `routes/RequireWorkspace.tsx`
- `lib/permissions.ts` re-exporting `can()` from `@doit/contracts`
- `lib/api.ts` extended: attach access token, refresh-once-and-replay, CSRF header on mutations,
  `SESSION_REVOKED` handling
- tests: refresh flow, CSRF rejection, guard redirects, invite token preservation

## Requirements
- Boot sequence: render a skeleton → `POST /auth/web/refresh` (cookie only) → on success store
  the access token **in a module variable** and hydrate the user → render. On failure, render
  `/login` with `?next=` preserved.
- Never write the access token or the refresh token to `localStorage`/`sessionStorage`.
- `BroadcastChannel('doit-auth')` for login/logout and to elect a single refreshing tab.
- Mutations send `X-CSRF-Token`; on `403 CSRF_FAILED`, refresh the CSRF cookie once and replay.
- Route guard order: auth → workspace membership → permission.
- Invite flow preserves `?next=/invite/<token>` across login and registration.
- Forms: react-hook-form + zod from `@doit/contracts`; inline field errors; disabled submit
  while pending; a generic error for `INVALID_CREDENTIALS` (never "no such user").
- Show a "signed in on another device / session revoked" message on `?reason=revoked`.

## Do not
- Do not store tokens anywhere a script can read them persistently.
- Do not build your own crypto — use the API.
- Do not show different errors for "unknown email" vs "wrong password".
- Do not gate anything on the client alone.

## Acceptance checks
- [ ] Register → verify → land in a workspace, all on web.
- [ ] Reload the page while logged in: no login flash, no lost navigation state.
- [ ] Two tabs open: log out in one, the other redirects to `/login` immediately.
- [ ] Two tabs refreshing at once do not fight — neither tab gets logged out.
- [ ] Revoking the web session from the mobile app logs the browser out on the next request.
- [ ] A mutating request without `X-CSRF-Token` is rejected (prove with curl and with the UI).
- [ ] Invite link opened logged-out → login → lands on the invite acceptance, token intact.
- [ ] `document.cookie` contains no refresh token.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
