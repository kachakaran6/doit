# F4 — Bugs, stickies, search, notifications
## Before you start
Read `WEB_FEATURE_PARITY_LOOP_PROMPT.md` and the docs listed. Restate your plan in 5–10 lines. Work in the loop from `docs/05`. End with: coverage report delta, before/after sheets, audit JSON, rubric table for touched pages, test results, UNVERIFIED list; append to `docs/UI_LOOP_LOG.md`; commit.
Docs: `02` (Bugs, Voice, Stickies, Search, Notifications), premium kit `03-page-specs` (Bugs, Stickies, ⌘K).
## Task
Bug Queue split view with every API field (screenshot viewer, audio + transcript, device meta, severity/state/assignee/duplicate-of, test session/build filters, bulk); voice upload/record → status/retry; Stickies board with all operations; Search page (tabs, highlights, syntax) + ⌘K; notifications bell + Inbox page + preferences; live updates with highlight.
## Verify
A bug created from the Android app (shake → screenshot → voice) appears live with all data; Playwright covers triage and notification read/unread.
