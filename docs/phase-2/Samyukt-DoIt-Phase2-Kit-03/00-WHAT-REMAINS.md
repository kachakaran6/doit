# 00 — What Actually Remains

Read this before anything else. It answers two questions: *is the audit right?* and *what is
left before this is a product rather than a repository?*

---

## Part A — Findings on the status audit

Your matrix says 19/19 phases PASSED. Most of it is believable: a NestJS API with Prisma, argon2,
rotating refresh tokens, a full-text search migration, a 5-accent token layer and a floating
pill navbar is exactly what those prompts asked for, and the file/word counts line up with a
real build. But six things in the audit do not hold up, and each one costs you a surprise later
if you don't close it now.

### A1 — Expo Go cannot run your headline features (blocking)

The Quick Start says "scan the QR code using the Expo Go app". Expo Go ships a fixed set of
native modules; it cannot load custom Kotlin/Swift code. That means, if testing happened in Expo
Go, these were never actually exercised on a device:

| Feature | Needs | Runs in Expo Go? |
|---|---|---|
| Floating bubble overlay | `SYSTEM_ALERT_WINDOW` + foreground service (Kotlin) | ❌ |
| Screen capture on shake | `MediaProjection` (Kotlin) | ❌ |
| Home-screen widget | `AppWidgetProvider` / Glance (Kotlin) | ❌ |
| iOS widget | WidgetKit **extension target** in Xcode | ❌ |
| iOS Share Extension | separate Xcode target | ❌ |
| Background shake detection | foreground service / CoreMotion | ❌ |
| Voice recording | `expo-av` / `expo-audio` | ✅ (partial) |
| Everything else (tasks, stickies, theme, navbar) | JS only | ✅ |

A JS "bridge" file (`src/native/widget/index.ts`) can exist and typecheck while the native side
is absent — the bridge just throws or no-ops at runtime. So P12, P13 and P15 are the three
phases most likely to be green in TypeScript and red on hardware.

**Action:** build a dev client (`npx expo run:android` or an EAS `development` profile build),
install it on a real phone, and re-run gate G4. This is prompt **M01**.

### A2 — 65 tests across 17 suites is thin for what is claimed

The phases that carry the most risk are precisely the ones a small suite under-tests:

- auth refresh rotation and replay defence (P02)
- the role × endpoint matrix, all 4 roles (P03)
- idempotency replay on create (P04)
- upload magic-byte rejection (P07)
- outbox exactly-once under kill/restart (P16)

Ask for the specific assertions in `08-PROMPTS/M03-qa-evidence-and-hardening.md`. A green
`pnpm test` with 65 tests does not prove a 4-role matrix or an exactly-once queue.

### A3 — "Built" is not "submitted"

Nothing in the audit touches: Play Console account, App Store Connect, signing keys, a privacy
policy URL, the Data safety form, the age rating questionnaire, or screenshots. Those are days
of work, not minutes, and the overlay permission will trigger a **manual review** with the
justifications in `12-NATIVE-CAPABILITIES.md`. See prompt **L00**.

### A4 — The database is a dev artifact

`postgresql://postgres:@localhost:5460/doit` on DBngin is fine for a laptop. A product needs:
managed Postgres with point-in-time recovery, object storage with a CDN, Redis for the queue,
TLS everywhere, secrets in a manager (not `.env` on a disk), migrations applied by CI, and a
**restore that has actually been tested**. Prompt **B00**.

### A5 — Email, push and AI are all running on fallbacks

Invites and password resets on the console transport, FCM/APNs keys absent, transcription on a
"local Whisper fallback" with no GPU host. Each is a silent failure in production: the invite
email never arrives, the push never shows, the transcript never comes back. Prompt **B01**.

### A6 — No web app, no observability, no legal

The three things a real user notices first. Web is the largest piece of remaining work and is
the whole of Phase 2 below. Observability and legal are small but non-negotiable before you let
anyone outside the team log in.

### One naming inconsistency

Packages are `@samyukt/*` while the product is DoIt. You asked for this fixed — it is prompt
**R00**, and the spec is `01-NAMING-MIGRATION.md`. Do it **first**, before the web app exists,
because a rename after `apps/web` lands touches twice as many files.

---

## Part B — The remaining roadmap

Five tracks. R00 gates everything else; after that, three tracks run in parallel.

```
R00  Naming migration                                    ← do first, 1 session
 │
 ├── TRACK M (mobile)   M01 dev client + native verify ──► M02 gluestack ──► M03 QA evidence
 ├── TRACK B (backend)  B00 production infra ──► B01 email/push/AI ──► B02 observability
 └── TRACK W (web)      W00 scaffold ──► W01 auth ──► W02 design system ──► W03 shell
                                                                             │
                                            W04 board ◄── W05 detail ◄───────┤
                                            W06 bugs/stickies ◄── W07 search ┘
                                                    │
                                        W08 settings ──► W09 realtime ──► W10 QA
 │
 └── TRACK L (launch)   L00 store submission ──► L01 legal & compliance
```

### What blocks what

| You cannot ship without | Because |
|---|---|
| M01 | You don't yet know whether the overlay, shake and widgets exist |
| B00 | No production database, storage or TLS |
| B01 | No invites, no password reset, no push |
| W00–W05 | There is no web product at all |
| L00 | No store listing |
| L01 | No legal basis to hold a tester's email and screenshots |

### Realistic sequencing for one developer with an agent

| Week | Work |
|---|---|
| 1 | R00 + M01 (rename, dev client, verify native modules) |
| 2 | M02 (gluestack), M03 (QA evidence, fix what M01 exposes) |
| 3 | B00 + B01 (infra, email, push) |
| 4–5 | W00–W03 (scaffold, auth, design system, app shell) |
| 6–7 | W04–W06 (board, detail, bugs/stickies) |
| 8 | W07–W09 (search, settings, realtime) |
| 9 | W10 + B02 + L01 (web QA, observability, legal) |
| 10 | L00 (store submission, review cycles) |

That is the honest shape. Anything faster means cutting the web app or shipping without legal.

---

## Part C — The three decisions you need to make now

1. **gluestack adoption depth.** Full (Expo Router + all components) or scoped (styling engine +
   accessibility-heavy primitives, keep React Navigation)? Recommendation and reasoning in
   `06-GLUESTACK-ADOPTION.md`. Short version: **scoped**, because the app is already built and
   your signature components (floating navbar, keyboard bar, sticky cards) have no gluestack
   equivalent — replacing them would cost you the product's identity for no gain.

2. **Web host framework.** `02-WEB-ARCHITECTURE.md` recommends **Vite SPA over Next.js**, because
   your API is already a separate NestJS service and a Next server would be a second backend to
   operate for no benefit on an authenticated tool. If you disagree, say so before W00 — it is
   expensive to change after W03.

3. **Domain.** The plan assumes `app.samyukt.com` (web), `api.samyukt.com` (API),
   `samyukt.com` (marketing). Cookie scoping depends on this, so confirm it in W01.

---

## Part D — What this kit does not do

- It does not re-specify what is already built. Phase 1 documents stay authoritative for
  anything not contradicted here.
- It does not add product features. Every prompt is either a fix, an infrastructure step, the
  web client, or a launch task.
- It does not promise iOS overlay capture. That remains impossible; the kit keeps the
  Back Tap + Share Extension path.
