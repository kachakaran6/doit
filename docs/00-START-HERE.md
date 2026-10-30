# Samyukt — Agent Build Kit

**Samyukt** (संयुक्त, "joined together") is a mobile task-management + bug-capture system.
This kit is not code. It is the complete instruction set you hand to a coding agent so it
builds the app consistently, in order, without drifting.

---

## What is in this kit

| File | Purpose | Who reads it |
|---|---|---|
| `00-START-HERE.md` | This file. Reading order + rules of engagement. | You |
| `01-PRODUCT-VISION.md` | The POV. Why the product exists, what it refuses to be. | Agent (every prompt) |
| `02-FEATURE-SPEC.md` | Every feature, prioritised, with acceptance criteria. | Agent |
| `03-DESIGN-SYSTEM.md` | Tokens, components, floating navbar, keyboard bar. | Agent (UI prompts) |
| `04-ARCHITECTURE.md` | Monorepo layout, feature-folder template, data flow. | Agent (every prompt) |
| `05-DATA-MODEL.md` | Prisma schema spec + entity rules. | Agent (backend prompts) |
| `06-API-CONTRACT.md` | REST endpoints, envelopes, error codes. | Agent (backend + mobile) |
| `07-AGENT-ORCHESTRATOR.md` | **The orchestrator.** Phase order, gates, parallelism. | Agent (first) + you |
| `07b-orchestrator.json` | Same plan, machine-readable. | Agent tooling |
| `08-PROMPTS/P00…P17` | 18 build prompts, one per PR-sized unit. | Agent (one at a time) |
| `09-AGENT-RULES.md` | Non-negotiable invariants. Overrides everything else. | Agent (every prompt) |
| `10-QA-ACCEPTANCE.md` | Test matrix, device matrix, manual QA script. | Agent (last prompt) + you |
| `11-TECH-DECISIONS.md` | ADRs, honest feasibility matrix, risk register. | You + agent |
| `12-NATIVE-CAPABILITIES.md` | Every permission, manifest/plist entry, store justification. | Agent (native prompts) |
| `13-PROGRESS-TEMPLATE.md` | The file the agent must maintain so work survives resets. | Agent |

---

## How to use it (you, the human)

1. Read `01-PRODUCT-VISION.md` and `11-TECH-DECISIONS.md`. The second one tells you which
   of your ideas are physically possible on which platform. Do this before the agent starts.
2. Create the repo, empty. Open your coding agent.
3. Paste, in order:
   - `07-AGENT-ORCHESTRATOR.md`
   - `09-AGENT-RULES.md`
   - `01-PRODUCT-VISION.md`
   - `04-ARCHITECTURE.md`
   - then say: **"Begin Phase 0. Prompt P00 is attached."** and attach `08-PROMPTS/P00-bootstrap-monorepo.md`.
4. After each prompt: the agent writes a summary + updates `PROGRESS.md`. You check the
   gate checklist in the orchestrator. Only then do you paste the next prompt.
5. Never paste two prompts at once unless the orchestrator says they are in the same
   parallel lane.

---

## How to use it (the agent)

- Treat `09-AGENT-RULES.md` as law. If a prompt contradicts it, the rules win — and you say so.
- Treat `01-PRODUCT-VISION.md` + `03-DESIGN-SYSTEM.md` as the taste layer. No screen ships
  that invents its own colour, spacing, radius or shadow.
- One prompt = one branch = one PR. Never mix scopes.
- If something is ambiguous and the choice is expensive to reverse, **stop and ask**. If it is
  cheap to reverse, pick the option closest to the design system and note it in `PROGRESS.md`.
- At the end of every prompt: run the acceptance checks listed inside that prompt, paste the
  output, update `PROGRESS.md`, and stop.

---

## Definition of done for the whole kit

The build is done when all of these are true:

- [ ] A tester can install the Android build, grant the listed permissions once, and add a
      bug report from inside a third-party app under test in **under 5 seconds** (bubble tap →
      voice → submit).
- [ ] The same tester can add a plain task in under 3 seconds from the home-screen widget.
- [ ] Dark and light themes both look finished, with all 5 accent colours, and no screen
      contains a hardcoded hex value.
- [ ] Every screen sits under the same floating navbar and the same keyboard accessory bar.
- [ ] Adding a new screen is a copy of `src/features/_template` — no new patterns invented.
- [ ] Offline capture works: record a bug in airplane mode, it syncs on reconnect.
- [ ] `apps/api` has ≥70% line coverage on services, and every endpoint is documented in Swagger.
- [ ] Nothing in the repo contains a secret, a `console.log`, or an inline colour.

---

## One correction before you start

Two things in the original brief are not possible as written. Both are solved inside this kit,
but you should know why the plan looks the way it does:

1. **"Flutter STT"** — the mobile app is React Native, so a Flutter plugin cannot run in it.
   `11-TECH-DECISIONS.md` ADR-004 replaces it with a two-stage pipeline: on-device speech
   recognition for instant text, plus a server-side Whisper/Saarika pass for accuracy.
2. **"Widget that floats over other apps, with screenshot on shake"** — this exists on Android
   (overlay permission + MediaProjection) but **cannot exist on iOS**, because iOS does not
   allow one app to draw over or screenshot another. iOS gets an equally fast path: Back Tap
   shortcut + Share Extension. See the feasibility matrix in `11-TECH-DECISIONS.md`.
