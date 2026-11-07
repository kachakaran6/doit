# DoIt — Complete UI/UX Redesign Kit

This kit is the implementation brief for redesigning the existing DoIt mobile application using the 38-screen reference archive (`ALL_Screens.zip`).

## Product and stack
- Mobile: React Native + Expo
- Backend: NestJS
- Database: PostgreSQL
- Authentication/session: existing JWT-based implementation
- Product goal: a clean, dependable task and bug-management app for teams, with quick capture optimized for app testing and feedback.

## Files in this kit
1. `01_PRODUCT_AND_UX_AUDIT.md` — product principles, observed issues, and redesign goals.
2. `02_DESIGN_SYSTEM.md` — visual language, tokens, components, states, and accessibility.
3. `03_SCREEN_BY_SCREEN_SPEC.md` — requirements for all major screens in the reference archive.
4. `04_MASTER_IMPLEMENTATION_PROMPT.md` — copy-paste prompt for Antigravity or another coding agent.
5. `05_QA_AND_ACCEPTANCE_CHECKLIST.md` — functional, visual, and regression checks.

## How to use
1. Extract `ALL_Screens.zip` into the repository or provide it to the coding agent as reference material.
2. Open the repository root in the coding agent.
3. Paste `04_MASTER_IMPLEMENTATION_PROMPT.md`.
4. Ask the agent to read the other kit documents before changing code.
5. Require it to inspect the actual source, identify the existing navigation/state/API architecture, and implement incrementally.
6. Review the implementation against the acceptance checklist.

## Important
The screenshots are references for the current product's information architecture and feature coverage, not a visual design to copy. Preserve working behavior and data contracts. Do not invent APIs, remove features, or replace the backend merely to make the UI easier to build.
