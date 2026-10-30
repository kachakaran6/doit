# P08 — QA & Hardening (QA)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `09` (ALL).

## Task
1. Go through `docs/09-acceptance-checklist.md` item by item; tick only what you verified; fix failures.
2. Security pass (include a full `docs/10` §10 test review, try to break tenant isolation manually with two accounts): token storage, upload validation, authorization on every route, rate limits, CORS, secrets in repo (none), dependency audit.
3. UX pass: dark/light × 5 accents on every screen; font scaling 130%; small phone; keyboard overlap; empty/error/loading states; haptics; reduced motion.
4. Performance: list scrolling with 500 items, Quick Capture open time, API p95 on list endpoints.
5. Produce `BACKLOG.md` with prioritized next steps (iOS capture, annotation, push, comments, SDK for tested apps, server-side transcription, AI summary, integrations like Jira/Slack).

## GATE G5
Final report: checklist results, known issues, demo script (5-minute) for the team. Wait for human OK.
