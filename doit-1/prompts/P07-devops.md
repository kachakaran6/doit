# P07 — DevOps & Delivery (DevOps)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `07`.

## Task
1. Harden Dockerfile/compose; confirm image size sane; non-root; healthchecks.
2. Write `DEPLOY_COOLIFY.md` step-by-step with exact env var list, volumes, domain, health path, backup notes.
3. EAS config: `development`, `preview` (APK), `production` profiles; env per profile; document build commands.
4. GitHub Actions: lint, typecheck, test, docker build.
5. Root `README.md` final: setup, scripts, architecture summary, how to add a feature, how to deploy, how testers install.

## Verify
Fresh clone → follow README only → API and app run. If a Coolify instance is available, deploy and smoke test; otherwise mark as "unverified" in STATUS.md.
