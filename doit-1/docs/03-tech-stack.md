# 03 — Tech Stack

> Versions: always check latest stable and Expo SDK compatibility at install time (`npx expo install` for Expo-managed libs). Record chosen versions in `DECISIONS.md`.

## Backend
| Concern | Choice |
|---|---|
| Framework | NestJS (TypeScript) |
| DB | PostgreSQL 16 |
| ORM | Prisma (migrations committed) |
| Auth | `@nestjs/jwt`, `passport-jwt`, argon2 for passwords |
| Sessions | `sessions` table, hashed rotating refresh tokens |
| Validation | class-validator + class-transformer, env via zod |
| Docs | `@nestjs/swagger` at `/docs` |
| Uploads | Multer (memory→StorageService), size/type limits |
| Security | helmet, CORS allowlist, `@nestjs/throttler` (stricter on auth) |
| Logging | nestjs-pino |
| Tests | Jest + supertest (auth + work-items e2e minimum) |
| Packaging | Docker multi-stage, `docker-compose` (api + postgres), healthcheck `/health` |

## Mobile
| Concern | Choice |
|---|---|
| Framework | React Native via **Expo (development build / prebuild, NOT Expo Go)** — native module required |
| Language | TypeScript strict |
| Routing | expo-router |
| Server state | @tanstack/react-query |
| Local state | zustand (+ persist with MMKV or AsyncStorage) |
| Forms | react-hook-form + zod (schemas from `packages/shared`) |
| Lists | @shopify/flash-list |
| Animation/gesture | react-native-reanimated, react-native-gesture-handler |
| Sheets | @gorhom/bottom-sheet |
| Keyboard | react-native-keyboard-controller (sticky toolbar, contextual accessory) |
| Icons | lucide-react-native (single icon set, consistent stroke) |
| Font | Inter via expo-font |
| Secure storage | expo-secure-store |
| Images/files | expo-image, expo-image-picker, expo-file-system |
| Voice → text | expo-speech-recognition (on-device where available), fallback `@react-native-voice/voice` |
| Voice record/upload | expo-audio (record m4a) |
| Haptics | expo-haptics |
| Date | date-fns; date picker via @react-native-community/datetimepicker |
| Toasts | custom `ui/feedback/Toast` (no extra lib) |
| Lint/format | eslint, prettier, typescript-eslint |

### "Flutter STT" note
You mentioned Flutter's STT. We stay in React Native, which wraps the same platform engines (Android `SpeechRecognizer`, iOS `SFSpeechRecognizer`). No Flutter needed.

### Voice design caveat (agent must verify)
Speech recognition and raw audio recording both want the microphone. Preferred approach: use `expo-speech-recognition`'s option to **persist the audio file** while recognizing (Android 13+ support). If the device/OS can't do both, use fallback: record audio with `expo-audio`, upload it, and show the on-device transcript when available; otherwise mark `transcript: null` (server-side transcription is BACKLOG).

## Android native (custom Expo module, Kotlin)
- `WindowManager` overlay (`TYPE_APPLICATION_OVERLAY`) for the bubble
- Foreground service (types: `specialUse`/`mediaProjection`)
- `MediaProjection` + `ImageReader` for screenshots of any app
- `SensorManager` accelerometer for shake
- Translucent `QuickCaptureActivity` hosting the React Native quick-capture UI
