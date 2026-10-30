# 04 — Architecture

Two rules govern everything here:

1. **A feature is a folder.** Adding a screen means copying `src/features/_template`.
   If a new screen needs a pattern that doesn't exist, the pattern gets built in
   `components/` and then used — never inlined into a screen.
2. **Platform differences stop at `src/native/`.** No screen ever asks "am I on Android?".

---

## 4.1 Monorepo layout

```
samyukt/
├── apps/
│   ├── api/                  NestJS backend
│   └── mobile/               React Native app
├── packages/
│   ├── contracts/            zod schemas + inferred TS types (single source of truth)
│   ├── design-tokens/        colours, spacing, radius, type, shadows (plain TS, no RN deps)
│   └── config/               eslint, tsconfig, prettier presets
├── docs/                     this kit, copied in
├── turbo.json
├── pnpm-workspace.yaml
└── PROGRESS.md               agent-maintained build log
```

Tooling: pnpm workspaces + Turborepo. TypeScript strict everywhere. Node 20 LTS.

---

## 4.2 Backend (`apps/api`)

NestJS, modular. **One folder per domain**, no `shared/services` dumping ground.

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/           @CurrentUser, @Roles, @Public, @Idempotent
│   ├── filters/              AllExceptionsFilter → error envelope
│   ├── interceptors/         ResponseInterceptor, LoggingInterceptor, TimeoutInterceptor
│   ├── pipes/                ZodValidationPipe (uses packages/contracts)
│   ├── guards/               JwtAuthGuard, RolesGuard, WorkspaceMemberGuard
│   ├── pagination/           CursorPage<T> helper
│   └── errors/               AppError + error code enum
├── config/                   env schema (zod), config namespaces
├── prisma/                   schema.prisma, migrations, seed.ts
├── infra/
│   ├── prisma/               PrismaService
│   ├── storage/              StorageService (local disk dev / S3 prod, presigned URLs)
│   ├── mail/                 MailService (invites, password reset)
│   ├── queue/                BullMQ (transcription jobs, thumbnail jobs, push)
│   └── realtime/             socket.io gateway
└── modules/
    ├── auth/
    ├── users/
    ├── workspaces/
    ├── projects/
    ├── members/
    ├── tasks/
    ├── labels/
    ├── comments/
    ├── stickies/
    ├── attachments/
    ├── voice/
    ├── bugs/
    ├── sessions/             test sessions
    ├── notifications/
    ├── search/
    └── activity/
```

Each module folder:

```
tasks/
├── tasks.module.ts
├── tasks.controller.ts        HTTP only: parse, call service, return DTO
├── tasks.service.ts           business rules, transactions
├── tasks.repository.ts        all Prisma calls for this domain
├── dto/                       created from packages/contracts schemas
├── entities/                  response mappers (never leak Prisma models)
├── tasks.service.spec.ts
└── tasks.controller.e2e-spec.ts
```

Hard rules:
- Controllers never touch Prisma. Services never touch `Request`/`Response`.
- Response shapes come from `packages/contracts` — the same schema validates the client.
- Every mutating endpoint accepts `Idempotency-Key`; duplicates return the original result.
- All timestamps ISO-8601 UTC. All ids are UUIDv7 (sortable).

### Cross-cutting
- **Auth:** access JWT (15 m, HS256 or RS256 with rotating keys) carrying `sub`, `wsid`
  (active workspace), `role`, `sid` (session id). Refresh token = opaque random 256-bit,
  hashed at rest, rotated on use, family-revoked on replay.
- **Logging:** pino JSON, request id, user id, latency, no PII in logs.
- **Errors:** one envelope (see `06-API-CONTRACT.md`). No stack traces to clients.
- **Docs:** Swagger at `/docs`, generated from decorators; every endpoint has an example.
- **Health:** `/health` (liveness) and `/health/ready` (DB + storage + queue).

---

## 4.3 Mobile (`apps/mobile`)

React Native 0.7x, **Expo with prebuild (bare workflow)** — required because we need custom
native modules (overlay, widget, foreground service, shake). Expo Go will not work; use a dev
client.

```
apps/mobile/
├── app.config.ts             expo config + plugins
├── index.js
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/        ThemeProvider, QueryProvider, AuthProvider, KeyboardProvider,
│   │   │                     ToastProvider, HapticsProvider, OutboxProvider
│   │   └── dev/ComponentGallery.tsx
│   ├── theme/
│   │   ├── tokens.ts         re-export from packages/design-tokens
│   │   ├── ThemeProvider.tsx  resolves mode + accent, persists
│   │   └── useTheme.ts
│   ├── components/
│   │   ├── ui/               design-system primitives (03-DESIGN-SYSTEM §3.2)
│   │   └── patterns/         TaskRow, BugRow, StickyCard, CaptureSheet, LabelPicker,
│   │                         DueDatePicker, SeverityPicker, EmptyStates, VoiceRecorder
│   ├── features/
│   │   ├── _template/        ← copy this to start any new feature
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── bugs/
│   │   ├── stickies/
│   │   ├── capture/
│   │   ├── sessions/
│   │   ├── search/
│   │   └── settings/
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── TabsNavigator.tsx  (renders FloatingNavBar)
│   │   └── types.ts           typed route params
│   ├── native/
│   │   ├── index.ts           the only import surface for native capability
│   │   ├── overlay/           Android bubble + foreground service
│   │   ├── widget/            Android Glance + iOS WidgetKit bridge
│   │   ├── shake/             accelerometer listener
│   │   ├── screenshot/        MediaProjection / in-app capture
│   │   ├── speech/            on-device STT
│   │   ├── audio/             recorder + waveform metering
│   │   └── permissions/       one module, all permission flows
│   ├── lib/
│   │   ├── http.ts            fetch wrapper: auth, refresh, retry, zod parse
│   │   ├── queryClient.ts     TanStack Query defaults
│   │   ├── outbox.ts          offline mutation queue
│   │   ├── storage.ts         MMKV wrapper
│   │   ├── logger.ts
│   │   ├── analytics.ts       no-op by default
│   │   └── device.ts          device/app context collector
│   └── types/
└── android/  ios/            generated by prebuild, then committed
```

### Stack choices (justify once, then stop debating)
- **Navigation:** React Navigation v7 (native-stack + bottom-tabs, custom tab bar).
- **Server state:** TanStack Query v5. Query keys centralised per feature in `keys.ts`.
- **Client state:** Zustand, one store per feature, no cross-feature stores.
- **Storage:** `react-native-mmkv` (fast, synchronous, encrypted variant for tokens is separate
  — tokens go in Keychain/Keystore via `react-native-keychain`).
- **Forms:** React Hook Form + zod resolver, using `packages/contracts` schemas.
- **Animation:** Reanimated 3 + Gesture Handler. No `Animated` API in new code.
- **Lists:** FlashList.
- **Icons:** `lucide-react-native` (consistent stroke weight, matches the flat style).
- **Blur:** `@react-native-community/blur` (iOS) / `expo-blur` fallback (Android).
- **Audio:** `react-native-nitro-sound` or `react-native-audio-recorder-player`.
- **STT:** `@react-native-voice/voice`.
- **Files:** `react-native-fs` + `react-native-image-resizer` (downscale screenshots to
  ≤1440 px long edge, JPEG q80 before upload).

---

## 4.4 The feature-folder template (the thing that keeps it consistent)

`src/features/_template/` contains exactly these files. **Copy it, rename, fill in.**

```
_template/
├── README.md                 what this feature does, which spec ids it implements
├── types.ts                  local view-models (derived, not API shapes)
├── api/
│   ├── keys.ts               export const featureKeys = { all: [...], list: (f) => [...], detail: (id) => [...] }
│   ├── queries.ts            useXQuery() — TanStack useQuery wrappers
│   └── mutations.ts          useCreateX() — with optimistic update + outbox fallback
├── hooks/
│   └── useXFilters.ts        UI logic, no JSX
├── components/               feature-only components (reuse ui/ first!)
├── screens/
│   └── XListScreen.tsx
├── store.ts                  Zustand slice for local UI state only
└── index.ts                  public surface: export { XListScreen } and nothing else
```

`index.ts` is a hard boundary. **A feature may only import another feature's `index.ts`.**
No deep imports across features — enforced by an eslint `no-restricted-imports` rule.

### Screen contract
Every screen file starts with this shape:

```tsx
export function XListScreen({ route, navigation }: Props) {
  const t = useTheme();
  // 1. data           2. derived state        3. handlers
  // 4. render: <Screen keyboardContext="..." navBar="visible" scrollRef={ref}>
  //    with header, body, empty/loading/error states
}
```

Every screen must handle four states explicitly: `loading` (skeleton), `empty` (illustration +
action), `error` (retry), `data`. A screen missing any of the four fails review.

### Adding a new screen — the six steps (put this in every PR description)
1. `cp -r src/features/_template src/features/<name>` and rename symbols.
2. Add route params to `navigation/types.ts` and register in the right navigator.
3. Define the zod schema in `packages/contracts/src/<domain>.ts`; add the endpoint in the API.
4. Write `api/keys.ts` → `api/queries.ts` → `api/mutations.ts`.
5. Build the screen from `components/ui/` + existing `components/patterns/` only. If a new
   pattern is genuinely needed, add it to `components/patterns/` first, with a gallery entry.
6. Add `screens/__tests__/XListScreen.test.tsx` (render + empty + error) and update
   `ComponentGallery` if you added a component.

---

## 4.5 Data flow

```
Screen
  └─ useXQuery()                 (features/x/api/queries.ts)
       └─ TanStack Query
            └─ apiFetch()        (lib/http.ts)
                 ├─ attaches Authorization from Keychain
                 ├─ on 401 TOKEN_EXPIRED → refresh once → replay
                 ├─ validates response with zod (contracts)
                 └─ on network error → OutboxProvider handles mutation retries

Mutation
  └─ useCreateX()  → optimistic cache write → apiFetch
        ├─ success → reconcile with server entity
        └─ offline → outbox.enqueue({ id, idempotencyKey, method, path, body, localFiles })
                     → flushes on reconnect / app foreground / NetInfo change
```

**Outbox invariants:** FIFO per entity, idempotency key generated client-side (uuid v7), local
files referenced by absolute URI and uploaded before the mutation that needs them, max 3 retry
attempts with exponential backoff, then surfaced in a "Pending sync" screen where the user can
retry or discard.

---

## 4.6 Native capability layer

`src/native/index.ts` exports a typed interface per capability. Each has `isAvailable(): boolean`
and a JS fallback.

```ts
export interface OverlayService {
  isAvailable(): boolean;            // false on iOS
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): Promise<boolean>;
}
```

Screens call `native.overlay.isAvailable()` and render the alternative path — they never import
`Platform` to decide. `Platform.OS` is allowed in exactly two places: `src/native/**` and
`src/theme/**`.

---

## 4.7 Realtime

Socket.IO gateway on the API (`/rt`), authenticated by the access token in the handshake.
Rooms: `ws:{workspaceId}`, `project:{projectId}`, `user:{userId}`.
Events: `task.created|updated|deleted`, `comment.created`, `bug.created`, `session.updated`,
`notification.new`. Payloads are the same DTOs as REST. Client invalidates the matching query
keys on receipt — never merges payloads by hand. Fallback: refetch on focus if the socket is
down for > 30 s.

---

## 4.8 Environments & config

`.env` per app, validated with zod at boot, fail fast.

```
API:    DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_PEPPER, S3_*, REDIS_URL,
        WHISPER_PROVIDER (local|openai|sarvam), WHISPER_API_KEY, FCM_*
MOBILE: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WS_URL, EXPO_PUBLIC_ENV
```

No secret is ever committed. `.env.example` lists keys with fake values.

---

## 4.9 CI gates (GitHub Actions)

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm --filter api test:e2e` ·
`prisma migrate diff --exit-code` · custom `no-hardcoded-colors` script · `no-console` ·
bundle size check on mobile.

A PR that fails any gate is not merged, even if the feature works.
