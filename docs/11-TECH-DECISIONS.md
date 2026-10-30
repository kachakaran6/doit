# 11 — Technical Decisions, Feasibility, Risks

Read this before you promise anything to anyone.

---

## Part A — Feasibility matrix (what the OS actually allows)

The brief asks for "an on-screen widget so a tester can add bugs while testing another app,
with screenshot on shake, and every permission". Here is the honest map.

| Capability | Android | iOS | Notes |
|---|---|---|---|
| Floating bubble drawn over other apps | ✅ `SYSTEM_ALERT_WINDOW` | ❌ impossible | Android: user grants "Display over other apps". Play Store allows it for genuine utility apps with disclosure. |
| Foreground service behind the bubble | ✅ | n/a | Must show a persistent notification. Android 14 requires a declared `foregroundServiceType`. |
| Detect which app is in the foreground | ⚠️ partial | ❌ | `UsageStatsManager` needs `PACKAGE_USAGE_STATS` (special access, user must grant in Settings). Google restricts `QUERY_ALL_PACKAGES` — use usage-stats, not package queries. Without it, the tester picks the app at session start. |
| Screenshot of *another* app | ⚠️ conditional | ❌ | Android only via `MediaProjection`, which shows a consent dialog and a persistent capture indicator. Consent can be reused for the session. iOS has no equivalent. |
| Screen recording of another app | ⚠️ same as above | ❌ (ReplayKit records only your own app) | |
| Read another app's logcat | ❌ | ❌ | Blocked since Android 4.1 for third-party apps. Capture your own events; offer manual log attachment. |
| Shake detection | ✅ | ✅ | Accelerometer. Works in the background on Android via the foreground service; on iOS only while your app is foreground (or via CoreMotion background delivery, which is unreliable — do not promise it). |
| Home-screen widget | ✅ Glance | ✅ WidgetKit | Both fine. |
| Share-sheet intake (screenshot → your app) | ✅ `ACTION_SEND` intent filter | ✅ Share Extension | The iOS workaround for "no cross-app screenshot". |
| Back-tap gesture | ✅ via Accessibility shortcut (opens your app) | ✅ Back Tap (Settings → Accessibility → Touch) | Both open your app; neither runs silently. |
| Live status strip while testing | ✅ notification | ✅ Live Activity / Dynamic Island | |
| On-device speech recognition | ✅ | ✅ | Quality varies; Hindi/Hinglish is usable on modern devices. |
| Background audio recording | ✅ | ⚠️ needs the `audio` background mode, and App Store review is strict | Prefer record-while-foreground on iOS. |

**Conclusion for the product:** Android is the hero platform for the "zero-friction capture"
story. iOS gets a fast but explicit path (Back Tap → capture sheet, Share Extension → composer,
widget → quick add). Design the UI so the difference is invisible: the same capture sheet,
reached by a different door.

---

## Part B — ADRs

### ADR-001 — Monorepo with pnpm + Turborepo
**Decision:** one repo, `apps/api`, `apps/mobile`, `packages/{contracts,design-tokens,config}`.
**Why:** the API contract is the biggest source of drift between a mobile team and a backend.
A shared zod package makes an incompatible field a compile error instead of a runtime bug.
**Cost:** tooling setup is ~half a day. Worth it from day one.

### ADR-002 — Prisma over TypeORM
**Decision:** Prisma.
**Why:** the schema file doubles as the data-model documentation, migrations are reviewable SQL,
and the generated types are excellent. TypeORM's decorator-based entities encourage leaking
models into controllers.
**Trade-off:** raw SQL escape hatches are clunkier; we accept that (only the search migration
needs raw SQL).

### ADR-003 — Cursor pagination everywhere
**Decision:** opaque cursor over `(order, id)`; no offset.
**Why:** the task list is reordered constantly; offset pagination duplicates and skips rows.

### ADR-004 — Speech-to-text: replace "Flutter STT"
**Decision:** two-stage pipeline — on-device recogniser for instant text, server-side model for
accuracy.
**Why:** the brief mentioned a Flutter STT plugin, but the mobile app is React Native, so a
Flutter plugin cannot be linked in. The equivalent in RN is:

| Option | Use for | Notes |
|---|---|---|
| `@react-native-voice/voice` | live, on-device, instant | wraps Android `SpeechRecognizer` / iOS `SFSpeechRecognizer`. Free, offline on iOS 13+, may need network on some Android devices. Good enough to show text while speaking. |
| Server Whisper (`faster-whisper` self-hosted) | accuracy pass | best accuracy/cost for English + Hinglish. Runs on a small GPU; batch a queue. |
| OpenAI Whisper API | fallback / no infra | pay per minute, simplest to ship. |
| Indic-focused ASR (e.g. Sarvam's Saarika) | Hindi/Marathi/Tamil/Telugu | verify the current model name, endpoint and language list against their docs before wiring it — do not hardcode a model id you haven't confirmed. |

**Rule:** always persist the raw audio first, transcribe second. The audio is the source of
truth; the transcript is a convenience that can be regenerated with a better model later.

### ADR-005 — Android overlay via a foreground service, not an accessibility service
**Decision:** `SYSTEM_ALERT_WINDOW` window managed by a foreground service.
**Why:** accessibility services are for disability support and get apps rejected when used for
overlay automation. Overlay permission is legitimate for a capture utility and is what
comparable testing tools use.
**Cost:** a persistent notification the user can't fully remove while the bubble is on. Accept
it — it is also the honest thing to show.

### ADR-006 — MediaProjection, not screenshots via root/adb
**Decision:** `MediaProjection` with one consent per Test Session.
**Why:** it is the only sanctioned path, it survives across apps, and reusing the consent for
the session keeps capture at one tap.
**Cost:** Android 14 shows a chip while capturing, and the projection dies if the user stops
sharing. Handle both gracefully.

### ADR-007 — TanStack Query for server state, Zustand for UI state
**Decision:** never store server data in Zustand.
**Why:** two caches for one resource is the classic source of "why is my list stale".
Zustand holds only ephemeral UI (filters, sheet visibility, selection).

### ADR-008 — MMKV for local storage, Keychain/Keystore for tokens
**Decision:** split storage by sensitivity.
**Why:** MMKV is fast and synchronous (good for theme hydration before first paint); Keychain is
slow but secure. Never put a refresh token in MMKV.

### ADR-009 — Fractional indexing for ordering
**Decision:** `Decimal(20,10)` midpoint insertion with periodic renumber.
**Why:** reordering must not rewrite N rows. Cheap, works offline, and mergeable across devices.

### ADR-010 — Outbox over "retry the request"
**Decision:** a persistent, inspectable queue in the client.
**Why:** testers capture in bad-network conditions constantly. A queue that survives an app kill
is the difference between "we lost the bug" and "it synced when we got back to the office".

### ADR-011 — Expo with prebuild (bare), not Expo Go
**Decision:** prebuild + custom native modules.
**Why:** the overlay, widget, foreground service and MediaProjection cannot exist in Expo Go.
Prebuild keeps the DX of Expo while allowing native code. `android/` and `ios/` are committed.

### ADR-012 — AI is a suggestion engine, never an actor
**Decision:** the model proposes title/severity/steps; the human confirms.
**Why:** a wrong auto-filed bug is worse than no bug. Also keeps the tester in control, which is
the whole point of the product.

---

## Part C — Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Play Store rejects the overlay/foreground-service combo | Medium | High | Declare `foregroundServiceType` correctly, in-app disclosure screen before requesting the permission, honest store listing, and a build variant without the overlay if needed. |
| Android OEMs kill the foreground service | High (Xiaomi/Oppo/Vivo) | High | Detect and guide the user to battery-optimisation settings; verify on the matrix; never depend on the service for data integrity (outbox covers it). |
| On-device STT is poor for Hinglish | High | Medium | Server pass always runs; show the transcript as editable; keep the audio. |
| MediaProjection consent UX is heavy | Medium | Medium | Ask once per session, never per capture; explain in one line why. |
| iOS users feel second-class | Medium | Medium | Ship Back Tap + Share Extension + widget in v1; document it as the iOS path in onboarding. |
| 5-second target slips | Medium | High | Measure from P12 onward, not at the end. Every feature added to the sheet must justify its tap. |
| Scope creep into "a full project manager" | High | High | The non-goals list in `01-PRODUCT-VISION.md` is contractual. |
| Whisper cost per bug | Low | Medium | Cache by audio hash, cap at 5 min, batch in a queue, prefer self-hosted. |
| Two agents editing the same files | Medium | Medium | One prompt = one branch; lanes A and B touch disjoint paths. |

---

## Part D — What I would cut if the deadline is real

Ship in this order, stop wherever the clock stops:

1. Auth + tasks + stickies + theme + navbar  → a usable task app (this alone is useful)
2. Voice capture + transcription             → the differentiator
3. Android overlay bubble                    → the headline feature
4. Shake + session + screenshot              → the "magic"
5. Offline outbox                            → trust
6. Widgets, notifications, search            → polish
7. iOS Share Extension + Back Tap            → parity-ish

Do not cut the outbox if testers will use this in the field — silent data loss kills adoption
faster than a missing feature.
