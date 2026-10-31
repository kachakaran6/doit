# DoIt Release & Hosting Kit
Company **Samyukt** · Product **DoIt** · App id `com.samyukt.doit`

Goal: stop testing in Expo Go. Get (1) the backend hosted on your own server with Coolify, (2) a real Android APK on testers' phones, (3) a path to Google Play.

## Why Expo Go can't test your real scenarios
The floating bubble, shake-to-screenshot, MediaProjection, foreground service, widgets and push notifications are **native code**. Expo Go can't run them. You need a **development build or a release APK**.

## Do it in this order
| Step | Guide | Time |
|---|---|---|
| 1 | `guides/01-host-backend-on-coolify.md` — server, Postgres, API, file storage, optional web/ASR, backups | 2–3 h |
| 2 | `guides/02-build-and-install-apk.md` — EAS or local APK pointing at your HTTPS API | 1 h |
| 3 | `guides/03-real-world-test-plan.md` — shake, bubble, screenshots, voice, offline on real phones | 1 day |
| 4 | `guides/04-publish-to-play-store.md` — Play Console, AAB, internal → closed → production | days (Google review/testing rules) |

Let your AI agent prepare the repo first: give it `prompts/RELEASE_AGENT_PROMPT.md`.

## Files
- `templates/eas.json` — build profiles (dev client, preview APK, production AAB)
- `templates/docker-compose.coolify.yml` — whole stack for local test or single-stack deploy
- `templates/.env.production.example` — all backend env vars
- `templates/api.Dockerfile`, `templates/web.Dockerfile`, `templates/nginx.conf` — reference images (agent adapts + tests them against the real repo)
