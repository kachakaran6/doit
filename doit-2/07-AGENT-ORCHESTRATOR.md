# 07 — Agent Orchestrator

This is the plan your coding agent follows. It is deliberately serial where correctness matters
and parallel where it does not. Read this file completely before writing any code.

---

## 0. Operating contract

1. **One prompt = one branch = one PR.** Branch name: `feat/<prompt-id>-<slug>`
   (e.g. `feat/p04-tasks-core`).
2. **Never start a prompt whose dependencies are not green.** The dependency list is in the
   table below and in `07b-orchestrator.json`.
3. **Never skip a gate.** A gate is a command or checklist that must pass before the next
   prompt starts. Paste the actual output.
4. **Update `PROGRESS.md` at the end of every prompt** (template in `13-PROGRESS-TEMPLATE.md`):
   what was built, what was decided, what is stubbed, what is broken.
5. **Ambiguity policy:** if a decision is expensive to reverse (schema shape, auth model,
   native module choice) → stop and ask. If cheap (naming, component split, file location) →
   decide, follow the design system, and record it in `PROGRESS.md`.
6. **No scope creep.** If you notice something missing outside the prompt's scope, append it to
   `PROGRESS.md` under "Backlog discovered" — do not build it.
7. **Definition of done for every prompt:** compiles, lints, tests pass, the acceptance checks
   inside the prompt pass, `PROGRESS.md` updated, and the diff contains no debug leftovers.

---

## 1. Phase map

```
PHASE 0  Foundations        P00 ─────────────────────────────►  gate G0
PHASE 1  Backend core       P01 ─► P02 ─► P03 ─► P04 ─► P05 ─► P06 ─► P07 ─► P08  gate G1
PHASE 2  Design system      P09 (can start in parallel with P01–P08) ──► gate G2
PHASE 3  App shell          P10 ─► P11 ─► P14 ──► gate G3
PHASE 4  Capture            P12 ─► P13 ─► P15 ──► gate G4
PHASE 5  Sync & polish      P16 ─► P17 ──► gate G5
PHASE 6  Hardening          P17b ──► gate G6 (release)
```

Two lanes can genuinely run in parallel once Phase 0 is done:

- **Lane A (backend):** P01 → P02 → P03 → P04 → P05 → P06 → P07 → P08
- **Lane B (design system):** P09 (pure UI, mock data, no API)

They meet at P10. If you only have one agent, run Lane A first — Lane B depends on nothing but
is more useful once the API shapes are frozen.

---

## 2. Prompt index

| ID | Title | Depends on | Lane | Est. |
|---|---|---|---|---|
| P00 | Bootstrap monorepo | — | A | S |
| P01 | Backend foundation (Nest, Prisma, errors, Swagger) | P00 | A | M |
| P02 | Auth: JWT + refresh rotation + sessions | P01 | A | M |
| P03 | Workspaces, projects, memberships, roles | P02 | A | M |
| P04 | Tasks core (CRUD, status, reorder, checklist) | P03 | A | L |
| P05 | Labels, filters, views, search | P04 | A | M |
| P06 | Stickies | P04 | A | S |
| P07 | Attachments & uploads | P04 | A | M |
| P08 | Voice capture + transcription pipeline | P07 | A | M |
| P09 | Design system + theme + component gallery | P00 | B | L |
| P10 | Navigation shell + floating navbar | P09 | B | M |
| P11 | Task / sticky / bug screens | P04, P06, P09, P10 | B | L |
| P12 | Quick Capture overlay (Android) | P11, P08 | A | L |
| P13 | Test Session + shake + screenshot capture | P12 | A | L |
| P14 | Keyboard accessory bar (contextual) | P11 | B | M |
| P15 | Home-screen widgets | P12 | A | M |
| P16 | Offline outbox + sync + realtime | P04, P11 | A | L |
| P17 | Notifications + settings + polish | P16 | B | M |
| P17b | QA, perf, hardening, release build | all | A | L |

S = ≤1 session, M = 1–2 sessions, L = 2–3 sessions of agent work.

---

## 3. Gates

Each gate is a hard stop. Do not proceed until every line is true.

### G0 — after P00
- [ ] `pnpm install` clean; `pnpm typecheck` clean; `pnpm lint` clean.
- [ ] `apps/api` boots and returns `{"status":"ok"}` from `/health`.
- [ ] `apps/mobile` runs on a device/emulator and shows a placeholder screen.
- [ ] `packages/contracts` exports a trivial schema consumed by both apps (proves wiring).
- [ ] CI workflow file exists and passes on the first push.

### G1 — after P08 (backend core)
- [ ] All endpoints in `06-API-CONTRACT.md` §6.2–6.8 implemented and in Swagger.
- [ ] `pnpm --filter api test` green; service coverage ≥70%.
- [ ] A seeded database can be created with `pnpm --filter api db:seed` in <10 s.
- [ ] Postman/Bruno collection committed covering the happy path of every endpoint.
- [ ] No endpoint returns a Prisma model directly.

### G2 — after P09
- [ ] `ComponentGallery` renders every component in §3.2, in both themes, in all 5 accents.
- [ ] A CI script fails the build if any file outside `theme/` contains `#RRGGBB` or `rgba(`.
- [ ] Contrast ratios for all accent pairs documented in `tokens.ts` as comments.

### G3 — after P14
- [ ] A tester can log in, see My Day, create a task, add a label, set a due date, and complete
      it — all without touching a raw `<Text>` or hardcoded colour.
- [ ] Floating navbar behaves per §3.3 (hide on scroll, lift on keyboard).
- [ ] Keyboard accessory bar changes chips per focused field per §3.4.

### G4 — after P15
- [ ] Bubble appears over a third-party app and a bug is submitted in <5 s (stopwatch it).
- [ ] Shake during a session captures a screenshot and opens the composer.
- [ ] Widget quick-add works with the app closed.
- [ ] Denying overlay permission leaves the app fully usable (degraded path shown).

### G5 — after P17
- [ ] Airplane-mode capture → reconnect → exactly-once sync verified.
- [ ] Theme/accent changes apply instantly and persist across a cold start.
- [ ] Push notification deep-links to the right item.

### G6 — release
- [ ] `10-QA-ACCEPTANCE.md` fully executed on the device matrix.
- [ ] Release build installs and runs with no dev menu, no `console.log`, no mock data.
- [ ] Crash-free rate verified over a 30-minute manual session.
- [ ] Store listing assets + permission justifications written (`12-NATIVE-CAPABILITIES.md`).

---

## 4. How to pass context between prompts

The agent's context is finite. Do not paste the whole kit every time. Per prompt:

**Always include:** `09-AGENT-RULES.md` + the prompt file itself.
**Include when the prompt lists it** in its `## Load` section.
**Never include:** the other prompts.

Carry state through `PROGRESS.md`, not through chat. If the agent loses context, it re-reads
`PROGRESS.md` + `04-ARCHITECTURE.md` and continues.

---

## 5. Commit convention

```
<type>(<scope>): <subject>

types: feat | fix | refactor | test | chore | docs | perf
scopes: api | mobile | contracts | tokens | native | ci
```
One logical change per commit. No commit that only renames a file for taste.

---

## 6. Escalation triggers (stop and ask the human)

- A required permission was denied by the platform and there is no fallback.
- A schema change would break an already-shipped mobile build.
- An acceptance check cannot be met without a new third-party service.
- Two documents in this kit contradict each other.
- A native module has no maintained package for the current RN version.

---

## 7. Recovery protocol

If the session dies mid-prompt:
1. Read `PROGRESS.md` → the "In flight" section names the prompt and the last completed step.
2. `git status` → if there are uncommitted changes, commit them as
   `wip(<scope>): partial <prompt-id>` on the same branch.
3. Re-run the prompt's acceptance checks to find where it actually stopped.
4. Continue from there. Never restart the prompt from scratch.
