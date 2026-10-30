# 01 — Product Brief

## One-liner
Samyukt is a simple, fast team task manager (Plane-inspired) where logging a bug while testing another app takes **one tap and one sentence**.

## Problem
Testers (apps, games) hate documenting bugs: they stop testing, open a tracker or WhatsApp, type, attach screenshots. Bugs get lost or under-described.

## Solution
A floating bubble that stays over any app. Tap → voice or text box opens with a screenshot already attached. Shake → smart screenshot. Submit → bug exists in the team's project with device info, screenshot and voice note.

## Users
- **Tester**: wants zero friction.
- **Team member / Dev**: wants clear, triage-ready bugs.
- **Admin**: manages workspace, members.

## POC scope (IN)
1. Auth: register/login, JWT access + refresh, server-side sessions (revocable), logout everywhere.
2. **Multi-workspace** teams with roles (owner/admin/member/guest), invitations, member management, workspace switcher.
3. Projects with visibility (workspace/private), project members and project roles, archive.
3b. **Authorization**: central policy/permission matrix enforced on the server, mirrored in the app to hide disallowed actions; audit log; change/reset password; account lockout. Full spec: `docs/10`.
4. Work items: type `task | bug | todo`, title, rich-ish description (plain/markdown), state, priority, labels, due date, assignee, attachments (image, audio).
5. Stickies: quick notes with color, pin, convert-to-task.
6. **Super quick add**: one input, smart parsing (`!high`, `#label`, `@user`, `tomorrow`) + mic button + contextual keyboard toolbar.
7. Voice: speech-to-text into the title/description; optional audio file upload attached to item.
8. Theme: dark/light/system + 5 accent colors, persisted.
9. **Bug capture overlay (Android)**: floating bubble, shake-to-screenshot, quick capture sheet, upload.
10. Dockerized, Coolify-ready.

## Non-goals (POC)
Cycles/sprints, analytics, real-time collaboration, comments threads, notifications/push, offline sync, iOS overlay, web client, SSO, billing, AI summarization (note: put in BACKLOG).

## Success metric
A tester can go from "I see a bug" to "bug saved with screenshot + voice" in **under 5 seconds and 2 taps**.

## UX principles
- Fewer screens, bigger touch targets, bottom-reachable actions.
- Capture first, organize later (defaults fill everything else).
- Consistency: one component per concept, used everywhere.
