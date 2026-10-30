# DoIt Web — Product Requirements

## Goal
A first-class desktop/mobile web client sharing identity, workspaces, tasks and permissions with the existing mobile app through the existing NestJS API.

## Stack
- React + TypeScript + Vite
- shadcn/ui and the repository's Tailwind setup
- React Router
- TanStack Query
- React Hook Form + Zod where appropriate
- Shared contracts/tokens where compatible
- No direct browser-to-PostgreSQL connection; no duplicate backend

## Routes
Public: `/login`, `/privacy`, `/support`; registration/reset only if API supports them.
Authenticated: `/app/today`, `/app/inbox`, `/app/upcoming`, `/app/tasks`, `/app/tasks/:taskId`, `/app/board`, `/app/notes`, `/app/bugs`, `/app/search`, `/app/notifications`, `/app/settings`, `/app/workspace`, `/app/members` if API supports membership management.

Implement only API-backed actions. Mark missing endpoints as blockers instead of faking success.

## Workflows
- Login, session restoration, logout, workspace selection
- Create/edit task with description, project, assignee, labels, priority and due date
- Enforce backend task state transitions
- List and Kanban views
- Sticky notes and conversion to tasks
- Bug reports with reproduction steps, expected/actual result, severity and supported attachments
- Search/filter using only supported query syntax
- Theme, accent, profile and notification settings

## UI
Professional, minimal, compact and calm. Desktop sidebar + workspace switcher + search + central content; responsive mobile navigation. Use existing tokens and five accent palettes. Avoid arbitrary hardcoded colors, excessive badges, neon/glow effects and copied branding. Include skeletons, empty states, inline validation, retry/error states, accessible dialogs, visible focus, reduced motion and semantic markup.

## Quality
Responsive on mobile through wide desktop; WCAG 2.2 AA target for core flows. Validate API origin through environment configuration. Remember Vite `VITE_*` values are public, never secrets. Add component tests for auth guards, forms, state transitions and error states.
