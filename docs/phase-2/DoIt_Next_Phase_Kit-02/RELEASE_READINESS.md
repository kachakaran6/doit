# Release Readiness Checklist

## API
- [ ] Clean install, lint, typecheck, unit/integration tests
- [ ] Fresh-database migrations and backup/restore test
- [ ] Health checks, structured logs, production secrets outside Git
- [ ] HTTPS/CORS/rate limits and tenant/RBAC negative tests
- [ ] Upload/transcription limits and private storage verified

## Mobile
- [ ] Android ID remains `com.samyukt.doit`
- [ ] Display name/launcher branding says DoIt
- [ ] Release build installs and upgrades on a physical device
- [ ] Login, tasks, upload and refresh work
- [ ] Overlay permission is contextual; denial preserves core functionality
- [ ] Shake can be disabled; manual fallback exists
- [ ] Screenshot behavior respects OS/target-app restrictions
- [ ] Microphone/speech permissions are optional and contextual
- [ ] Offline queue recovery and duplicate prevention verified
- [ ] Privacy/store disclosures match actual behavior

## Web
- [ ] Lint/typecheck/tests/production build pass
- [ ] Login/logout/refresh/expiry and workspace switching tested
- [ ] RBAC and cross-workspace access rejected
- [ ] Task, board, note, bug and attachment flows verified
- [ ] All five palettes and theme modes verified
- [ ] Loading/empty/error/denied states exist
- [ ] Keyboard accessibility and responsive layouts checked
- [ ] No secrets in client build; production API/CORS/cookies configured

## Operations
- [ ] Production env inventory, domain and TLS
- [ ] Monitoring, error reporting and rollback plan
- [ ] Logs redact sensitive data
- [ ] Retention/deletion policy documented
- [ ] Known limitations documented

Only mark a gate complete with evidence: command output, test report, screenshot, smoke test or documented reason not applicable.
