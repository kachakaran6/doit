# MASTER PROMPT — DoIt Complete Mobile UI/UX Redesign

You are a senior React Native/Expo engineer, product designer, and mobile QA specialist. Your task is to redesign and polish the existing DoIt application into a professional, production-quality task and bug-management product.

## Context

- Product: DoIt
- Mobile application: React Native + Expo
- Backend: NestJS
- Database: PostgreSQL
- Authentication: existing JWT-based session/authentication
- Reference archive: `ALL_Screens.zip` containing 38 screenshots of the current application
- Additional guidance: read every Markdown file in this redesign kit before implementation.

The screenshots describe the current product's screens and feature coverage. They are not a visual style to copy. Keep the product's functionality and improve the design, usability, consistency, and reliability.

## Primary objective

Deliver a complete, coherent redesign across the entire app—not a home-screen-only refresh and not a superficial color/radius update.

The result must feel minimal, professional, calm, fast, and consistent. Think of the product quality and clarity expected from Linear, Things, Todoist, and Craft, while creating an original DoIt design language.

## Mandatory first phase: repository audit

Before editing:
1. Inspect the complete repository structure and identify the Expo SDK, React Native version, navigation library, state management, styling/theming approach, form library, API client, storage, and test setup.
2. Identify all routes/screens and map them to the 38 reference screenshots.
3. Inspect shared components, theme tokens, hooks, services, API DTOs, and backend contracts.
4. Identify existing bugs, duplicate components, hard-coded styles, inconsistent tokens, and dead routes.
5. Run the existing app and baseline tests/build if possible.
6. Create `docs/ui-redesign/IMPLEMENTATION_AUDIT.md` containing findings, risks, screen mapping, and phased plan.
7. Do not begin broad refactoring until this audit is complete.

## Non-negotiable constraints

- Preserve the current React Native + Expo stack.
- Preserve NestJS, PostgreSQL, JWT authentication, and existing backend contracts.
- Do not replace the backend or database.
- Do not remove working features, routes, fields, telemetry, permissions, or user data.
- Do not invent endpoints or payload fields. Inspect the backend and API client first.
- Do not use fake/mock data in production screens.
- Do not create parallel design systems or duplicate components.
- Do not make unrelated architecture changes.
- Avoid adding dependencies unless necessary; explain each new dependency.
- Keep secrets and tokens out of logs and UI.
- Keep existing offline/sync behavior intact.
- If a requirement cannot be implemented due to a missing backend capability, document it and provide a safe UI state rather than pretending it works.

## Design direction

Create one central design system with:
- Semantic color tokens for light and dark themes.
- Neutral surfaces and one restrained configurable accent.
- Consistent 4-point spacing scale.
- A small typography scale with readable hierarchy.
- Consistent radii, borders, elevation, icon sizing, and touch targets.
- Shared buttons, fields, rows, cards, chips, sheets, dialogs, empty states, skeletons, and feedback components.

Visual requirements:
- Plain, minimal, professional interface.
- No neon colors, glowing effects, heavy gradients, glassmorphism, or decorative clutter.
- No excessive cards, nested surfaces, or unnecessary borders.
- No emoji as UI icons; use the icon library already installed in the project.
- Use whitespace and typography for hierarchy.
- Design light and dark modes intentionally and independently.
- All accent colors must remain readable in both themes.
- Keep visual density appropriate for mobile.

## Navigation requirements

- Retain the floating bottom navigation pattern if it is already part of the app.
- Remove any unwanted full-width white/opaque background or separate rectangular bar behind it.
- The floating navigation must have transparent surrounding space, a clear selected state, balanced icon/label alignment, and correct safe-area spacing.
- Ensure it never covers scroll content, keyboard actions, or the floating quick-capture button.
- Preserve routes, deep links, and back behavior.

## Full screen coverage

Redesign and verify every screen group in `03_SCREEN_BY_SCREEN_SPEC.md`:
1. Home dashboard, workspace switcher, account menu.
2. Tasks list, Today filter, Kanban, project switcher, task detail, telemetry.
3. Bug queue, filters, bug detail, telemetry.
4. Sticky board and sticky detail.
5. Search initial/results.
6. Notifications and sync outbox.
7. Team members.
8. Quick Capture task, bug, voice, and sticky modes.
9. Settings, appearance/cache, diagnostics.
10. Component gallery and design-token gallery.
11. Invitation acceptance and project context.
12. Quick Capture preferences, AI provider, and guide sheet.

Create a screen coverage matrix and mark each screen as audited, implemented, and verified. Do not mark a screen complete merely because it compiles.

## Quick Capture — high-priority workflow

Quick Capture is central to this product. Make it fast and frictionless.

- Keep Task, Bug, Voice, and Sticky modes easy to switch.
- Add project selection and label selection where supported by the existing data model and permissions.
- Use preferences to preselect a default project and other supported defaults.
- Allow the user to override defaults per capture.
- Make dropdowns/searchable pickers visually consistent and keyboard-safe.
- Preserve drafts when switching modes or dismissing a sheet where practical.
- Keep the primary action reachable when the keyboard is open.
- Provide validation and clear success/error feedback.
- For voice capture, handle microphone permission, recording state, duration, playback, upload progress, failure, and retry without losing the recording.

## Reliability and edge cases

Audit and implement:
- Invitation unavailable/expired/invalid states with meaningful recovery.
- Missing workspace/project context.
- Empty lists and no search results.
- Loading, offline, API error, and retry states.
- Pending sync and failed sync states.
- Permission denied states.
- Long titles, long labels, large task lists, and long telemetry logs.
- Keyboard open/closed behavior on small devices.
- Android gesture navigation and safe-area insets.
- Light/dark mode changes while screens and sheets are open.

## Engineering standards

- Prefer feature-based organization consistent with the existing repository.
- Keep UI components presentational where possible; keep domain/API logic in appropriate hooks/services.
- Centralize theme tokens and avoid raw color literals in feature screens.
- Avoid giant screen components and duplicated form logic.
- Use stable keys in lists and optimize only where profiling or list size warrants it.
- Respect TypeScript types and strictness already used in the project.
- Handle async operations and cancellation safely.
- Add or update tests for critical flows.
- Do not suppress TypeScript/lint errors to force a green build.
- Do not add `any` as a shortcut.
- Keep accessibility labels, touch targets, and font scaling in mind.

## Implementation sequence

Work in small, reviewable phases:

### Phase 1 — Audit and plan
Deliver the repository audit and screen coverage matrix. Identify any blockers.

### Phase 2 — Design foundations
Implement semantic tokens, typography, spacing, theme provider, shared primitives, and component gallery. Validate both themes before migrating all screens.

### Phase 3 — Navigation and app shell
Polish safe-area behavior, screen scaffold, headers, floating navigation, sheets, and global feedback.

### Phase 4 — Core workflows
Redesign Home, Tasks, Task Detail, Bug Queue, Bug Detail, Sticky Board, and Search.

### Phase 5 — Capture workflows
Redesign all Quick Capture modes, project/label selection, preferences, voice upload states, and guide.

### Phase 6 — Supporting workflows
Redesign notifications, sync outbox, team, settings, diagnostics, AI provider, project context, and invitation handling.

### Phase 7 — Quality and regression
Run tests, type checks, lint, Expo export/build, and manual/device verification. Fix regressions.

## Required deliverables

1. Fully implemented redesigned application.
2. Centralized design system and reusable components.
3. All 38 reference screens mapped and addressed.
4. `docs/ui-redesign/IMPLEMENTATION_AUDIT.md`.
5. `docs/ui-redesign/SCREEN_COVERAGE.md`.
6. `docs/ui-redesign/CHANGELOG.md` with files/areas changed and reasons.
7. Updated tests for critical workflows.
8. Final QA report listing commands run, results, known issues, and screenshots/device sizes tested.

## Definition of done

The task is complete only when:
- All required screens are redesigned consistently.
- Light and dark themes both look intentional and readable.
- Floating navigation has no unwanted full-width background.
- Quick Capture project and label selection works with real app data where supported.
- No existing feature or backend integration has been broken.
- Invitation and missing-context errors have useful recovery paths.
- Loading, empty, offline, success, and error states are handled.
- TypeScript, lint, tests, and Expo build/export pass, or any pre-existing/unresolved failure is clearly documented.
- No placeholder content, fake interactions, dead buttons, or unimplemented routes remain.
- The final QA report is honest and evidence-based.

## Working instructions

Do not stop after writing a plan. After the audit, proceed with implementation in phases. If the task is too large for one pass, complete the highest-priority phase, record exact progress and remaining work, and continue without pretending the entire app is finished.

At the end, summarize:
- What changed
- Which screens were completed
- What tests/builds were run
- Any known issues or blockers
- Where screenshots and documentation are stored

Begin by inspecting the repository and the `ALL_Screens.zip` archive. Do not ask the user to repeat information already present in the repository or reference archive.
