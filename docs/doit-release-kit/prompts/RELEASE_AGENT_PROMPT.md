# RELEASE AGENT PROMPT — make DoIt installable and hostable

Company **Samyukt**, product **DoIt**, app id `com.samyukt.doit` (unchanged). Read `README.md` and `guides/` first, plus `templates/`.

## Rules
Evidence or it didn't happen: show command output for each acceptance item. Don't hand-edit generated `android/`. No secrets in git. Verify tool commands/versions against official docs (Expo/EAS, Coolify, Prisma, Docker) before using them.

## Tasks
### 1. Backend packaging (Coolify-ready)
1. Create/repair `docker/api.Dockerfile` (use `templates/api.Dockerfile` as a reference): non-root, tini, small image, runs `prisma migrate deploy` then starts. Add `.dockerignore`.
2. **Implement the S3 storage adapter** (`STORAGE_DRIVER=s3|local`) behind the existing StorageService: works with MinIO and Cloudflare R2/B2; private bucket; authorized streaming or short-lived signed URLs; orphan cleanup; migration script from local disk → S3 for existing files.
3. `GET /api/v1/health` checks DB (and storage reachability in a `/health/ready` variant).
4. Env validation (zod) refuses missing/weak secrets in production; `.env.production.example` kept in sync (use `templates/.env.production.example`).
5. Production seed: admin only, no demo data. Add `pnpm db:seed:prod`.
6. Body-size limits ≥ 25 MB; `trust proxy`; graceful shutdown.
7. Make `templates/docker-compose.coolify.yml` work from a clean machine (`docker compose up --build`), then run `pnpm smoke` against it.
8. If a web app exists, finalize `docker/web.Dockerfile` + `docker/nginx.conf` (same-origin proxy to API).
9. Write `docs/DEPLOY_COOLIFY.md` from `guides/01`, filled with the **real** commands/paths of this repo.

### 2. Mobile release configuration
1. `apps/mobile/eas.json` from `templates/eas.json`: development / preview (APK) / production (AAB); per-profile `EXPO_PUBLIC_API_URL` read from placeholders the human fills.
2. Release build must: use HTTPS only (cleartext allowed only in `development`), have R8/ProGuard on, hide Developer settings except in dev/preview, set `allowBackup` safely, include all overlay/capture permissions and foreground-service types via the config plugin.
3. Scripts: `pnpm mobile:apk` (EAS preview), `pnpm mobile:apk:local` (prebuild + gradle assembleRelease), `pnpm mobile:aab` (EAS production), `pnpm mobile:dev`.
4. App config: name "DoIt", icon + adaptive icon + splash, `android.package = com.samyukt.doit`, version fields, scheme `doit`. Firebase `google-services.json` via EAS file secret (documented).
5. Add a **min-app-version** check against `/config` and a force-update screen.
6. Add `docs/TESTER_GUIDE.md` (install APK, permission wizard, OEM battery table from `guides/02`, how to report a bug, known limitations).

### 3. Verification
1. Build the preview APK (EAS or local). Install on a real Android phone. Show: app boots, logs in against the **hosted HTTPS staging API**, Settings → Developer health = ok.
2. Execute `guides/03-real-world-test-plan.md` B1–B5 and B12–B13 on that phone; record results in `docs/QA_RESULTS.md` (device, Android version, pass/fail, evidence).
3. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm smoke` and show output.
4. Produce the release AAB with `pnpm mobile:aab` and list its permissions (Play "App bundle explorer" or `aapt`). Flag any permission not required.
5. Write `docs/PLAY_CHECKLIST.md` listing each Play Console item from `guides/04` with status (done / needs human / unverified) and the exact text/URLs the human should paste (privacy policy URL placeholder, data-safety answers, permission justifications, screen-recording script for the overlay demo video).

## Output
A short report: what was changed, what was verified (with evidence), what the human must do manually (accounts, DNS, Coolify clicks, Play Console, keystore backup), and anything unverified.
