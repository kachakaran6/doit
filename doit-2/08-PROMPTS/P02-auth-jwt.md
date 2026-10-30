# P02 — Auth — JWT, Refresh Rotation, Device Sessions

**Lane** A · **Depends on** P01 · **Branch** `feat/p02-auth`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.2
- `05-DATA-MODEL.md` §5.2 (`User`, `Session`)

## Goal
Working authentication end to end on the server: register, login, refresh with rotation,
logout, logout-all, device session list, password reset. Plus the guards every later module uses.

## Deliverables
- `modules/auth/` (controller, service, repository, dto)
- `modules/users/` (profile read/update)
- `common/guards/JwtAuthGuard`, `RolesGuard`, `@Public()`, `@CurrentUser()`
- `common/decorators/@Roles()`
- argon2 password hashing service
- refresh-token family rotation logic
- unit + e2e tests for every auth endpoint
- Bruno/Postman collection `api-tests/auth.bru`

## Requirements
- Access JWT: 15 min, payload `{ sub, wsid, role, sid, iat, exp }`, HS256 with
  `JWT_ACCESS_SECRET`. Refresh token: 32-byte random, hex-encoded to the client, argon2-hashed
  at rest, 30-day expiry, rotated on every refresh.
- **Replay defence:** each refresh token row carries `familyId`; consuming a token marks it
  used; presenting a used token revokes the entire family and returns `SESSION_REVOKED`.
- Login accepts `deviceName`, `deviceId`, `platform`, `appVersion` and stores them on `Session`.
- `GET /auth/me` returns user + memberships (workspace id, name, role) so the client can pick a
  default workspace without a second call.
- Password reset: token is a signed JWT with 30-min expiry, single use (jti stored), email sent
  via `MailService` (dev = console transport).
- Rate limit login/register/forgot to 10/min/IP using `@nestjs/throttler` with a Redis store
  when available.
- Passwords: argon2id, min 8 chars, reject the top-1000 common passwords from a bundled list.

## Do not
- Do not store refresh tokens in plaintext, ever.
- Do not put secrets in the JWT payload.
- Do not return `passwordHash` or `refreshHash` in any DTO.
- Do not build login UI here.

## Acceptance checks
- [ ] Register → login → call `/auth/me` with the access token → 200.
- [ ] Wait for expiry (or mint a short-lived token in test) → call → `401 TOKEN_EXPIRED`.
- [ ] Refresh → new pair issued, old refresh token now rejected.
- [ ] Reuse the old refresh token → `401 SESSION_REVOKED` **and** the new one also fails.
- [ ] `GET /auth/sessions` lists both devices; `DELETE /auth/sessions/:id` kills one.
- [ ] 11 rapid login attempts → `429 RATE_LIMITED` with `Retry-After`.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
