# SCREEN_MATRIX — DoIt (Plane-Class Verification Matrix)

> Verified per milestone against the /55 rubric defined in `docs/doit-plane-class-kit/docs/06-loop-protocol-and-rubric.md`.
> Total Target Screens: 68 | T1: 61 | T2: 7

| S-ID | Category | Screen | Tier | Status | Rubric /55 | Flow / Deep Link | Verified (Device/Host) |
|---|---|---|---|---|---|---|---|
| `S01` | Auth & onboarding | Splash | **T1** | `R` | — | `doit://splash` | Pending M0/M1 |
| `S02` | Auth & onboarding | Login | **T1** | `U` | — | `doit://login` | Pending M0/M1 |
| `S03` | Auth & onboarding | Register | **T1** | `U` | — | `doit://register` | Pending M0/M1 |
| `S04–S05` | Auth & onboarding | Forgot / Reset password | **T1** | `U` | — | `doit://forgot-reset-password` | Pending M0/M1 |
| `S06` | Auth & onboarding | Email verification (if API) | **T1** | `N` | — | `doit://email-verification-if-api-` | Pending M0/M1 |
| `S07` | Auth & onboarding | Accept invite | **T1** | `E (31) R` | — | `doit://accept-invite` | Pending M0/M1 |
| `S08–S09` | Auth & onboarding | Onboarding: create workspace → first project | **T1** | `N` | — | `doit://onboarding-create-workspace-first-project` | Pending M0/M1 |
| `S10` | Auth & onboarding | Permissions wizard (notifications, overlay, mic, screen capture) | **T1** | `N` | — | `doit://permissions-wizard-notifications-overlay-mic-screen-capture-` | Pending M0/M1 |
| `S11` | Auth & onboarding | First-run checklist on Home | **T1** | `R` | 48/55 | `doit://home` | Android 14 (SM-A346E) |
| `S12` | Home & global | Home | **T1** | `R` | 49/55 | `doit://home` | Android 14 (SM-A346E) |
| `S13` | Home & global | Workspace switcher | **T1** | `R` | 48/55 | `doit://workspace-switcher` | Android 14 (SM-A346E) |
| `S14` | Home & global | Account menu | **T1** | `R` | 48/55 | `doit://account-menu` | Android 14 (SM-A346E) |
| `S15` | Home & global | Notifications | **T1** | `R` | 47/55 | `doit://notifications` | Android 14 (SM-A346E) |
| `S16` | Home & global | Search (+results, recents) | **T1** | `R` | 48/55 | `doit://search` | Android 14 (SM-A346E) |
| `S17` | Home & global | Quick actions / long-press `+` | **T1** | `R` | 48/55 | `doit://quick-actions` | Android 14 (SM-A346E) |
| `S18` | Work items (T1 unless marked) | Work list (List / Board / Calendar T2) | **T1** | `R` | 48/55 | `doit://tasks` | Android 14 (SM-A346E) |
| `S19` | Work items (T1 unless marked) | Filters & Display sheet | **T1** | `R` | 47/55 | `doit://filters-display-sheet` | Android 14 (SM-A346E) |
| `S20` | Work items (T1 unless marked) | Saved Views list + editor | **T2** | `N T2` | — | `doit://saved-views-list-editor` | Pending M0/M1 |
| `S21` | Work items (T1 unless marked) | **Work item detail** | **T1** | `R` | 48/55 | `doit://task/:id` | Android 14 (SM-A346E) |
| `S22` | Work items (T1 unless marked) | Property pickers (state, priority, assignee, labels, start/due, estimate T2, cycle T2, module T2, parent T2) | **T1** | `R` | 48/55 | `doit://property-pickers` | Android 14 (SM-A346E) |
| `S23` | Work items (T1 unless marked) | Sub-work items | **T2** | `R` | 47/55 | `doit://sub-work-items` | Android 14 (SM-A346E) |
| `S24` | Work items (T1 unless marked) | Relations & links | **T2** | `R` | 47/55 | `doit://relations-links` | Android 14 (SM-A346E) |
| `S25` | Work items (T1 unless marked) | Comments & activity | **T2** | `R` | 48/55 | `doit://comments-activity` | Android 14 (SM-A346E) |
| `S26` | Work items (T1 unless marked) | Attachment viewer (image zoom, audio+transcript) | **T1** | `R` | 48/55 | `doit://attachment-viewer` | Android 14 (SM-A346E) |
| `S27` | Work items (T1 unless marked) | Create work item (sheet) | **T1** | `R` | 48/55 | `doit://create-work-item` | Android 14 (SM-A346E) |
| `S28` | Work items (T1 unless marked) | Multi-select & bulk actions | **T1** | `R` | 47/55 | `doit://multi-select-bulk-actions` | Android 14 (SM-A346E) |
| `S29` | Work items (T1 unless marked) | Archive & trash | **T2** | `N T2` | — | `doit://archive-trash` | Pending M0/M1 |
| `S30` | Bugs / Intake (our differentiator) | Bug queue (Intake style tabs: Open · Accepted · Declined · Duplicates) | **T1** | `R` | 48/55 | `doit://bugs` | Android 14 (SM-A346E) |
| `S31` | Bugs / Intake (our differentiator) | **Bug detail** (screenshot viewer, audio+transcript, device telemetry, steps, severity, AI prompt) | **T1** | `R` | 48/55 | `doit://bug/:id` | Android 14 (SM-A346E) |
| `S32` | Bugs / Intake (our differentiator) | Screenshot annotate/redact | **T1** | `R` | 47/55 | `doit://screenshot-annotate` | Android 14 (SM-A346E) |
| `S33` | Bugs / Intake (our differentiator) | Triage actions (accept, decline, snooze, duplicate-of) | **T1** | `R` | 47/55 | `doit://triage-actions` | Android 14 (SM-A346E) |
| `S34` | Bugs / Intake (our differentiator) | Test sessions / builds | **T1** | `N` | — | `doit://test-sessions-builds` | Pending M5 |
| `S35` | Bugs / Intake (our differentiator) | Quick Capture — Task / Bug / Voice / Sticky modes | **T1** | `R` | 48/55 | `doit://capture/:initialMode` | Android 14 (SM-A346E) |
| `S36` | Bugs / Intake (our differentiator) | Capture overlay activity (bubble → sheet) | **T1** | `R` | 47/55 | `doit://capture-overlay` | Android 14 (SM-A346E) |
| `S47` | Stickies | Sticky board (masonry, colors, pin) | **T1** | `R` | 48/55 | `doit://stickies` | Android 14 (SM-A346E) |
| `S48` | Stickies | Sticky editor sheet | **T1** | `R` | 47/55 | `doit://sticky-editor` | Android 14 (SM-A346E) |
| `S49` | Projects | Projects list | **T1** | `R` | 48/55 | `doit://projects-list` | Android 14 (SM-A346E) |
| `S50` | Projects | Create project | **T1** | `R` | 48/55 | `doit://create-project` | Android 14 (SM-A346E) |
| `S51` | Projects | Project settings (general) | **T1** | `R` | 47/55 | `doit://project-settings` | Android 14 (SM-A346E) |
| `S52` | Projects | Project members & roles | **T1** | `N` | — | `doit://project-members-roles` | Pending M6 |
| `S53` | Projects | States | **T2** | `N T2` | — | `doit://states` | Pending M7 |
| `S54` | Projects | Labels | **T1** | `R` | 48/55 | `doit://labels` | Android 14 (SM-A346E) |
| `S55` | Projects | Estimates | **T2** | `N T2` | — | `doit://estimates` | Pending M7 |
| `S56` | Projects | Project context (AI markdown editor) | **T1** | `R` | 49/55 | `doit://project-context` | Android 14 (SM-A346E) |
| `S57` | Projects | Archive/delete project | **T1** | `N` | — | `doit://archive-delete-project` | Pending M6 |
| `S58` | Workspace & team | Team members | **T1** | `R` | 48/55 | `doit://team` | Android 14 (SM-A346E) |
| `S59` | Workspace & team | Invite sheet + Invitations list | **T1** | `R` | 48/55 | `doit://team` | Android 14 (SM-A346E) |
| `S60` | Workspace & team | Roles view | **T1** | `N` | — | `doit://roles-view` | Pending M6 |
| `S61` | Workspace & team | Workspace settings (general, danger zone) | **T1** | `R` | 47/55 | `doit://workspace-settings` | Android 14 (SM-A346E) |
| `S62` | Workspace & team | Create / Join workspace | **T1** | `R` | 48/55 | `doit://workspace-switcher` | Android 14 (SM-A346E) |
| `S63` | Workspace & team | Audit log (admin) | **T1** | `N` | — | `doit://audit-log-admin-` | Pending M6 |
| `S64` | Workspace & team | Integrations (SMTP/webhooks, admin) | **T1** | `N` | — | `doit://integrations-smtp-webhooks-admin-` | Pending M6 |
| `S65` | Account & settings | Settings hub | **T1** | `R` | 49/55 | `doit://settings` | Android 14 (SM-A346E) |
| `S66` | Account & settings | Profile edit | **T1** | `N` | — | `doit://profile-edit` | Pending M6 |
| `S67` | Account & settings | Appearance & behavior | **T1** | `R` | 49/55 | `doit://settings` | Android 14 (SM-A346E) |
| `S68` | Account & settings | Notification preferences | **T1** | `R` | 48/55 | `doit://settings` | Android 14 (SM-A346E) |
| `S69` | Account & settings | Security (password, sessions, devices) | **T1** | `N` | — | `doit://security-password-sessions-devices-` | Pending M6 |
| `S70` | Account & settings | Data & privacy (export, delete, consent) | **T1** | `R` | 48/55 | `doit://settings` | Android 14 (SM-A346E) |
| `S71` | Account & settings | Bug capture settings (bubble, shake, sensitivity, permissions status) | **T1** | `R` | 48/55 | `doit://settings` | Android 14 (SM-A346E) |
| `S72` | Account & settings | Quick capture prefs | **T1** | `R` | 48/55 | `doit://quick-capture-prefs` | Android 14 (SM-A346E) |
| `S73` | Account & settings | AI provider | **T1** | `R` | 48/55 | `doit://ai-provider` | Android 14 (SM-A346E) |
| `S74` | Account & settings | Sync queue | **T1** | `R` | 48/55 | `doit://sync` | Android 14 (SM-A346E) |
| `S75` | Account & settings | Help & feedback | **T1** | `R` | 47/55 | `doit://help-feedback` | Android 14 (SM-A346E) |
| `S76` | Account & settings | About & diagnostics | **T1** | `E (26) U R` | — | `doit://about-diagnostics` | Pending M0/M1 |
| `S77` | Account & settings | Legal | **T1** | `N` | — | `doit://legal` | Pending M0/M1 |
| `S78` | System | Offline / error / 403 / 404 / maintenance / force-update | **T1** | `N` | — | `doit://offline-error-403-404-maintenance-force-update` | Pending M0/M1 |
| `S79` | System | Android widgets | **T1** | `R` | — | `doit://android-widgets` | Pending M0/M1 |
| `S80` | System | Dev gallery & tokens (dev builds only) | **T1** | `E (27–30)` | — | `doit://dev-gallery-tokens-dev-builds-only-` | Pending M0/M1 |
