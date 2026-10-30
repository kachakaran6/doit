# 09 — POC Acceptance Checklist

## Backend
- [ ] `docker compose up` brings up api + db, migrations auto-run, `/api/v1/health` ok
- [ ] Swagger at `/docs` documents every endpoint
- [ ] Register, login, refresh rotation, logout, logout-all, session list/revoke work; refresh-token reuse revokes session
- [ ] Work items CRUD with filters, labels, assignee, due date, pagination
- [ ] Quick-add endpoint parses `!priority #label @user date type`
- [ ] Stickies CRUD + convert to work item
- [ ] Upload image + audio with size/type limits; authorized download
- [ ] Validation errors use the standard error shape; rate limit on auth
- [ ] e2e tests pass

## Auth, workspaces & access control (docs/10)
- [ ] Multi-workspace: create, switch, leave; data fully isolated (IDOR e2e tests pass)
- [ ] Roles owner/admin/member/guest enforced per the permission matrix (table-driven tests pass)
- [ ] Private projects + project members/roles work; guests see only added projects
- [ ] Invitations: create, preview, accept, revoke, expiry, single-use
- [ ] Change password, forgot/reset password, lockout, revoked session rejected immediately
- [ ] Last-owner protection and ownership transfer
- [ ] Audit log records sensitive actions
- [ ] Mobile hides disallowed actions (`useCan`) and handles 401/403 gracefully

## Mobile
- [ ] Login/register, session persists across restarts, auto refresh works
- [ ] Dark / light / system + 5 accents, persisted, instant switch, no flicker
- [ ] Home, Items, Item detail, Stickies, Search, Settings all built from `ui/` kit
- [ ] Floating navbar + FAB + quick menu behave like spec (hide on scroll, keyboard aware)
- [ ] Quick Add: parse preview chips, mic STT, contextual keyboard toolbar
- [ ] Voice note recorded and attached; playable in detail
- [ ] Due date, labels, priority, state, assignee editable
- [ ] Loading/empty/error states everywhere
- [ ] `pnpm gen:feature demo` creates a working new screen in < 2 min

## Bug capture (Android)
- [ ] Permission wizard completes and reflects status live
- [ ] Bubble shows over another app and over a game, persists after screen off
- [ ] Tap and shake produce a screenshot without bubble/UI in it
- [ ] Quick Capture opens < 500 ms, voice or text, Send creates a `bug` with screenshot + audio + device meta
- [ ] Offline submit is queued and delivered later
- [ ] 5-second / 2-tap goal measured and noted in STATUS.md

## Delivery
- [ ] Preview APK built, `TESTER_GUIDE.md` written
- [ ] Coolify deploy steps verified on a real instance
- [ ] `README.md` root with setup, scripts, env, architecture overview
- [ ] BACKLOG.md lists deferred items
