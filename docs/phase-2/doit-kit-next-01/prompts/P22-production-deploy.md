# P22 — Production Deploy & Observability (DevOps)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: original `07-deployment-coolify`, `15` §3, §5.

## Task
1. Production compose/Dockerfile hardening: non-root, healthchecks, env validation, **real Postgres credentials**, volumes for uploads, resource limits (Whisper can be heavy: make provider configurable; default to hosted ASR or disabled on small servers; document RAM needs).
2. Deploy API to Coolify with HTTPS domain; run migrations; seed an admin only (no demo users in prod).
3. Backups: scheduled Postgres backups + uploads backup, and a **restore drill** documented.
4. Observability: Sentry (API + mobile + later web), structured logs, uptime check on `/health`.
5. Mobile: EAS profiles (dev / preview APK / production), per-env API URL, Firebase config via secrets, signing keys stored safely. Distribute preview APK to testers with `TESTER_GUIDE.md` (use the name DoIt).
6. Store prep (not submission): privacy policy, data-safety answers, permission justifications (overlay, screen capture, foreground service, mic), listing copy ("by Samyukt").

## GATE G9
Show production health URL, backup proof, a tester logging a bug end-to-end against production. Wait for human OK.
