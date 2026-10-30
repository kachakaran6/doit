# P00 — Bootstrap (Architect)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: all of `docs/01`–`docs/03`.

## Task
1. Copy `templates/STATUS.md` and `templates/DECISIONS.md` to repo root; create empty `BACKLOG.md`.
2. Check environment: node LTS, pnpm, docker, Android SDK/emulator, JDK. Report anything missing (don't install system software silently).
3. Look up current stable versions of Expo SDK, NestJS, Prisma, and each mobile library in `docs/03`. Check compatibility (especially Reanimated, gesture-handler, keyboard-controller, bottom-sheet, expo-speech-recognition with the chosen Expo SDK). Write the final version table into `DECISIONS.md` as ADR-001.
4. Confirm the voice approach (STT + audio recording simultaneously) is feasible; record the chosen approach and fallback in ADR-002.
5. Confirm the Android overlay approach feasibility with the current Android/Expo constraints; record in ADR-003.

## Done when
- STATUS.md and DECISIONS.md filled; no code written yet except tooling checks.
- Report: environment OK/missing, version table, risks.
