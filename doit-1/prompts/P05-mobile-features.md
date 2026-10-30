# P05 — Mobile Features (Mobile Features)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `04`, `05`, `08`, `10` (section 9), voice notes in `03`.

## Task (each as a feature folder per `docs/08`)
1. `home`: Plane-style home (workspace header, Work card, Your work counts, Recent activity, Stickies preview, empty states).
2. `work-items`: list with segmented filters (All/Mine/Bugs), filter sheet (state, priority, label, assignee, due), item detail with editable property rows, description editor with markdown helpers, labels management, due date picker, attachments (image viewer, audio player), delete with confirm.
3. `quick-add`: FAB-launched bottom sheet; `QuickAddInput` parses text live with the shared parser and shows chips; contextual keyboard toolbar per `docs/05`; mic button → STT into field; optionally record + attach audio (follow ADR-002).
4. `stickies`: 2-col masonry, colors, pin, create/edit sheet, convert to task.
5. `search`: global search over items + stickies.
5b. `workspaces`, `members`, `projects` features per `docs/10` §9: workspace switcher (create/join/switch, cache clear), members list + role/suspend/remove actions, invite sheet (role, expiry, share link), project create/edit/visibility/members/archive. Implement `useCan` and 403/401 handling.
6. `settings`: appearance (mode + 5 accent swatches), account, change password, sessions list/revoke, logout/logout-all, leave workspace, **Bug Capture** section placeholder (wired in P06).
7. Replace mocks with the real API (P03). Optimistic updates for state/priority/checkbox toggles.

## Verify
Walk the full flow on a device: register → create task via quick add (with voice) → edit → label → due → attach image → sticky → convert. Check dark/light × accents. Lint/typecheck pass.

## GATE G3
Update STATUS.md; list demo; wait for human OK.
