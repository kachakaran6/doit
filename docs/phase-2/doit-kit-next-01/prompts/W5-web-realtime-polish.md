# W5 — Realtime & Polish (Web)
## Before you start
Read `AGENTS.md` (+ addendum), `ORCHESTRATOR.md` and the docs listed. Restate your plan in 5–10 lines before coding. Log decisions in `DECISIONS.md`; update `STATUS.md` with evidence at the end.
Docs: `13` quality bars, `14` WebSocket.

## Task
WebSocket with ticket auth, reconnect/backoff, live updates for boards/lists/triage (merge into Query cache) with presence-free simplicity · keyboard shortcuts + `?` help · a11y pass (axe, focus order, labels, reduced motion) · responsive pass (tablet/phone) · perf (code splitting, virtualization, Lighthouse ≥ 90) · consistent empty/error/loading everywhere · visual consistency vs mobile tokens.

## Verify
Two browsers + a phone show live changes; axe has no serious violations; Lighthouse report saved.
