# ORCHESTRATOR (next phases)

## Tracks
```
P18 Rename & baseline ─┬─► P19 Gluestack UI v5 (mobile) ──┐
                       ├─► P20 Device QA & dev-build fix ─┼─► P21 Access-control audit ─► P22 Prod deploy & observability
                       └─► W0 Web foundation ─► W1 Web auth (+API cookie mode) ─► W2 List/Board/Detail ─► W3 Triage/Stickies/Dashboard ─► W4 Admin ─► W5 Realtime & polish ─► W6 Web QA & deploy
```
- After P18, **mobile track (P19–P20) and web track (W0–W2) run in parallel.**
- W1 contains backend changes (cookie mode). Backend owner merges those before W2.
- P21 runs after P19/P20 but BEFORE web W4 (admin screens depend on a verified permission model).
- P22 deploys API first; web deploys at W6 into the same Coolify project.

## Roles
Architect · Backend · Mobile · Web · DevOps · QA (single agent may play all, sequentially).

## Gates
| Gate | After | Pass criteria |
|---|---|---|
| G7 | P18 + P19 | Rename complete (naming check passes), baseline green, mobile fully on gluestack v5, 5 accents × light/dark verified, gallery screenshots |
| G8 | P20 + P21 | Overlay/voice/widgets verified on ≥2 real devices via dev build, permission audit report with fixes |
| G9 | P22 | Production API live on HTTPS, backups, monitoring, internal APK distributed |
| G10 | W2 | Web login + list + Kanban board + item detail work against real API |
| G11 | W4 | Triage, stickies, dashboard, admin/RBAC pages done |
| G12 | W6 | Playwright e2e green, security headers verified, web deployed |

## Handoff
Update `STATUS.md` (rewrite the old one honestly: built / verified-how / unverified) and `DECISIONS.md` after every phase.
