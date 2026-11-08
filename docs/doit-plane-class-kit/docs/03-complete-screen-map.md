# 03 — Complete Screen Map (mobile; web mirrors it)

Status: **E** exists (screenshot #) · **R** redesign · **N** new · **U** unverified (not captured). Tier: T1/T2. Every screen needs: loading skeleton, empty, error, offline, dark+light, 5 accents, font scale 200%, TalkBack labels, permission gating, Maestro flow with `assertVisible`.

## Auth & onboarding
| ID | Screen | Status | Notes |
|---|---|---|---|
| S01 | Splash | R | wordmark/mark, 200 ms fade into app |
| S02 | Login | U | email/password, show/hide, forgot link, error mapping, lockout message |
| S03 | Register | U | name, email, password strength, invite-aware |
| S04–S05 | Forgot / Reset password | U | generic success copy |
| S06 | Email verification (if API) | N | |
| S07 | Accept invite | E (31) R | "Invitation unavailable" polished; valid-invite flow with workspace preview |
| S08–S09 | Onboarding: create workspace → first project | N | 2 steps, defaults, skip |
| S10 | Permissions wizard (notifications, overlay, mic, screen capture) | N | live status, OEM tips |
| S11 | First-run checklist on Home | N | invite team, report first bug, install widget |

## Home & global
| S12 | Home | E (01,36) R | Plane-style launchpad (see doc 05) |
| S13 | Workspace switcher | E (02) R | bottom sheet, no slug, Create + Join with code |
| S14 | Account menu | U | real name/email/role; Profile, Settings, Switch workspace, Help, Sign out |
| S15 | Notifications | E (17) R | tabs All/Unread/Mentions/Assigned, actor avatars, deep links, archive |
| S16 | Search (+results, recents) | E (15) U(16) R | grouped results, highlights, recent searches |
| S17 | Quick actions / long-press `+` | N | Task, Bug, Sticky, Voice |

## Work items (T1 unless marked)
| S18 | Work list (List / Board / Calendar T2) | E (04,06) R | new row anatomy, groups, swipe actions |
| S19 | Filters & Display sheet | N | status, priority, assignee, labels, dates, type; group/sort/properties |
| S20 | Saved Views list + editor | N T2 | |
| S21 | **Work item detail** | U R | Plane-style (doc 05) |
| S22 | Property pickers (state, priority, assignee, labels, start/due, estimate T2, cycle T2, module T2, parent T2) | N | bottom sheets |
| S23 | Sub-work items | N T2 | |
| S24 | Relations & links | N T2 | |
| S25 | Comments & activity | N T2 | |
| S26 | Attachment viewer (image zoom, audio+transcript) | N | |
| S27 | Create work item (sheet) | E (20) R | hero title, collapsed details |
| S28 | Multi-select & bulk actions | N | |
| S29 | Archive & trash | N T2 | |

## Bugs / Intake (our differentiator)
| S30 | Bug queue (Intake style tabs: Open · Accepted · Declined · Duplicates) | E (10) R | real thumbnails, severity, reporter, device |
| S31 | **Bug detail** (screenshot viewer, audio+transcript, device telemetry, steps, severity, AI prompt) | U R | |
| S32 | Screenshot annotate/redact | N | blur/draw before send |
| S33 | Triage actions (accept, decline, snooze, duplicate-of) | N | |
| S34 | Test sessions / builds | N | group bugs by build/session |
| S35 | Quick Capture — Task / Bug / Voice / Sticky modes | E (20) U(21–23) R | each mode distinct |
| S36 | Capture overlay activity (bubble → sheet) | R | same sheet language |

## Planning (T2)
| S37–S39 | Cycles: list, detail (progress, burndown, items), create/edit | N |
| S40–S42 | Modules: list, detail, create/edit | N |
| S43–S44 | Pages: list, editor/viewer | N |
| S45 | Analytics (project/workspace) | N |
| S46 | Project overview | N |

## Stickies
| S47 | Sticky board (masonry, colors, pin) | E (14,38) R | |
| S48 | Sticky editor sheet | U R | convert to task |

## Projects
| S49 | Projects list | E (07 as dialog) R | cards with progress, lead, members |
| S50 | Create project | N | name, key, emoji/color, visibility, lead |
| S51 | Project settings (general) | N | |
| S52 | Project members & roles | N | |
| S53 | States | N T2 | |
| S54 | Labels | N | |
| S55 | Estimates | N T2 | |
| S56 | Project context (AI markdown editor) | E (32) R | fix missing editor |
| S57 | Archive/delete project | N | |

## Workspace & team
| S58 | Team members | E (19) R | role change, suspend, remove |
| S59 | Invite sheet + Invitations list | E (19 tab) R | link/code/QR |
| S60 | Roles view | N | |
| S61 | Workspace settings (general, danger zone) | N | |
| S62 | Create / Join workspace | N | |
| S63 | Audit log (admin) | N | |
| S64 | Integrations (SMTP/webhooks, admin) | N | |

## Account & settings
| S65 | Settings hub | E (24) R | grouped list; Log out in Account group |
| S66 | Profile edit | N | name, avatar color/photo |
| S67 | Appearance & behavior | R | theme cards, accent swatches (with check), density, haptics, reduce effects |
| S68 | Notification preferences | N | per event × channel |
| S69 | Security (password, sessions, devices) | N | |
| S70 | Data & privacy (export, delete, consent) | N | store requirement |
| S71 | Bug capture settings (bubble, shake, sensitivity, permissions status) | E (25) R | |
| S72 | Quick capture prefs | E (33) R | |
| S73 | AI provider | E (34) R | fix missing input |
| S74 | Sync queue | E (18) R | per-item retry/discard |
| S75 | Help & feedback | N | |
| S76 | About & diagnostics | E (26) U R | brand fix "DoIt", version, licenses, copy diagnostics |
| S77 | Legal | N | |

## System
| S78 | Offline / error / 403 / 404 / maintenance / force-update | N | |
| S79 | Android widgets | R | |
| S80 | Dev gallery & tokens (dev builds only) | E (27–30) | hidden in release |

**Counts:** ~80 screens. T1 ≈ 55, T2 ≈ 25. The coverage matrix `docs/SCREEN_MATRIX.md` (generated by the agent) lists each ID with: status, screenshot path, rubric score, Maestro flow, test, verified-on-device date.
