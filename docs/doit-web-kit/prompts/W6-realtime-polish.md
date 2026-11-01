# W6 — Realtime, notifications, polish
## Before you start
Read `WEB_AGENT_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Verify library APIs from official docs; log ADRs in `DECISIONS.md`. End with commands run + outputs, Playwright results, screenshots (light/dark × 2 accents); update `STATUS.md`.
Docs: `05` (Realtime), `07`.

## Task
WebSocket client (ticket auth, heartbeat, backoff+jitter, workspace resubscribe) patching the Query cache; remote-change highlight; `session.revoked` and `membership.updated` handling · notifications bell/popover/inbox · shortcuts dialog (`?`) · responsive pass (desktop/tablet/phone) · a11y pass (axe, focus order, aria, reduced motion, 200% zoom) · performance pass (code splitting, lazy charts/editor/lightbox, virtualization, bundle budget) · visual consistency review vs mobile tokens · consistent empty/error/loading.

## Verify
Two browsers + phone show live changes; axe no serious/critical on all routes; Lighthouse ≥ targets (report saved).
