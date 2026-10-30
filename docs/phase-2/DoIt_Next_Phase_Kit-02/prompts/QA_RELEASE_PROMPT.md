# Prompt — DoIt QA and Release Readiness

Use `RELEASE_READINESS.md` and the implementation checklist.

1. Run documented lint, typecheck, unit/integration/component tests and production builds for API, mobile and web.
2. Test login/logout/refresh/session expiry, workspace switching and role restrictions.
3. Test task CRUD, valid/invalid transitions, board, notes, conversion, search and uploads.
4. Attempt cross-workspace access and unauthorized actions.
5. Verify five accents, theme modes, responsive and keyboard accessibility.
6. Test physical-device overlay, shake, keyboard, permissions, voice, upload and offline recovery; document platform differences.
7. Verify `com.samyukt.doit` unchanged and `pnpm --filter @samyukt/mobile android` still resolves if package name is unchanged.
8. Check built assets for secrets, production env, CORS and HTTPS.
9. Report exact commands/exit codes, test counts, failures, manual steps, blockers and rollback plan.

Do not mark gates PASS without evidence. Do not publish or deploy unless authorized.
