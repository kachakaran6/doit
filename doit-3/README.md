# Samyukt Pulse — AI Agent Project Kit

**Working product name:** Samyukt Pulse  
**Product type:** Lightweight team task management + instant mobile QA/bug capture  
**Status:** Planning/specification kit only — no application code included.

## Product in one sentence
Samyukt Pulse helps a team member capture a task, idea, or mobile-app/game bug in one or two taps—with text, voice, screenshot, and useful context—then routes it into a shared team workflow.

## What is in this kit
- `PRD.md` — product requirements and MVP boundaries
- `FEATURE_SPEC.md` — detailed functional requirements and user flows
- `ARCHITECTURE.md` — extensible folder/module architecture and conventions
- `TECH_STACK.md` — recommended stack and decisions
- `UI_DESIGN_SYSTEM.md` — consistent visual system and component rules
- `MOBILE_OS_CAPABILITIES.md` — overlay, shake, screenshots, microphone and permissions reality
- `SECURITY_PRIVACY.md` — auth, access control, file handling, privacy
- `DATA_MODEL.md` — proposed PostgreSQL entities and relationships
- `ROADMAP.md` — fast, staged delivery plan
- `AGENT_ORCHESTRATOR.md` — agent roles, execution order, gates and handoffs
- `prompts/MASTER_AGENT_PROMPT.md` — primary prompt to give the coding agent
- `prompts/` — focused prompts for design, backend, mobile, QA and review
- `orchestration/IMPLEMENTATION_CHECKLIST.md` — acceptance checklist

## How to use
1. Give the coding agent `prompts/MASTER_AGENT_PROMPT.md` and this entire kit.
2. Ask it to read all Markdown files before changing anything.
3. Have it execute the phases in `AGENT_ORCHESTRATOR.md` sequentially.
4. Require a plan and architecture proposal before implementation.
5. Keep the first release focused on fast capture and a reliable shared task workflow.

## Product principles
- Capture first; organize second.
- One consistent UI across all screens.
- Minimal, calm, professional UI inspired by the clarity of Plane-like task tools, without copying proprietary branding.
- Android-first QA capture; platform capabilities must be implemented only where OS rules allow.
- No permission requests without a clear user-facing reason.
- No hard-coded colors, duplicated design tokens, or feature-specific architecture.
- Never claim an overlay, background screenshot, or shake trigger works on every Android device until verified on real devices.

## Naming
Use **Samyukt Pulse** as the initial internal product name. Keep the display name, package/bundle identifiers, logo and environment-specific branding configurable so the name can be changed later without refactoring.
