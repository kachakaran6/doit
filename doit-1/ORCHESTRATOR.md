# ORCHESTRATOR.md

Single agent or multiple agents can run this. The orchestrator (you, or the lead agent) executes phases in order, enforces gates, and keeps `STATUS.md` current.

## Roles
| Role | Owns |
|---|---|
| **Architect** | repo scaffold, contract, shared types, decisions |
| **Backend** | `apps/api`, DB, auth, sessions, uploads, Docker |
| **Mobile Core** | theme, UI kit, navigation, feature architecture |
| **Mobile Features** | todos, stickies, quick add, voice, keyboard toolbar |
| **Native (Android)** | floating bubble, shake, screenshot, quick-capture activity |
| **DevOps** | Docker, Coolify, CI |
| **QA** | acceptance checklist, bug sweep |

A single agent plays all roles sequentially. With multiple agents, each takes the role and works only inside its owned folders.

## Phase plan
```
P00 Bootstrap ─► P01 Contract & scaffold ─┬─► P02 Backend foundation ─► P03 Backend domain ─┐
                                          └─► P04 Mobile foundation ─► P05 Mobile features ─┼─► P06 Android overlay ─► P07 DevOps ─► P08 QA
                                                                                            ┘
```
- P02/P03 and P04/P05 can run **in parallel** after P01 (contract is frozen).
- P05 can use a mock API layer until P03 finishes; swap in the real client at the join.
- P06 needs P03 (upload + bug endpoints) and P04 (UI kit).

## Gates (stop and report)
| Gate | After | Pass criteria |
|---|---|---|
| G1 | P01 | Monorepo installs, lint/typecheck run, contract doc + shared types agreed |
| G2 | P03 | Swagger up, register/login/refresh/logout work, CRUD on work items/stickies/labels, upload works, `docker compose up` works |
| G3 | P05 | App logs in, creates/edits tasks, stickies, voice-to-text works, theme + 5 accents work |
| G4 | P06 | Bubble over another app → shake → screenshot → voice/text → bug appears in app with image |
| G5 | P08 | `docs/09-acceptance-checklist.md` fully ticked |

## Handoff protocol
At the end of every phase, update `STATUS.md`:
- Phase, date, what was done
- How to run/demo (exact commands)
- Known issues
- Next phase prerequisites

Log any deviation or non-obvious choice in `DECISIONS.md` (ADR style, 3 lines each).

## Orchestrator loop
```
for phase in P00..P08:
    read prompts/<phase>.md
    execute with the owning role
    run verification commands listed in the prompt
    update STATUS.md / DECISIONS.md
    if phase has a gate: present demo steps and WAIT for human OK
```

## Parallel-agent rules
- One owner per folder. Cross-folder changes go through the Architect (contract change → update docs + shared types).
- Merge order: contract → backend → mobile → native.
- Conflicts in `packages/shared` are resolved by the Architect.
