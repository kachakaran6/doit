# 09 — Agent Rules (non-negotiable)

These override everything else in the kit. If a prompt asks for something that breaks a rule,
follow the rule and say so in your summary.

---

## R1 — One design system, zero exceptions

1. Colours, spacing, radius, typography, shadows come **only** from `useTheme()`.
2. No `#RRGGBB`, `rgba(`, or magic pixel values in `features/`, `screens/`, or
   `components/patterns/`. CI fails on it.
3. No raw `<Text>`, `<TouchableOpacity>`, or `<Pressable>` in feature code — use the `ui/`
   primitives.
4. A new visual pattern goes into `components/patterns/` (with a gallery entry) **before** it is
   used in a screen. Never inline it twice.
5. Every screen handles four states: loading, empty, error, data. No exceptions.

## R2 — Feature folders and import boundaries

6. New feature → `cp -r src/features/_template src/features/<name>`. No other way.
7. A feature's public surface is its `index.ts`. Cross-feature deep imports are a lint error.
8. Backend: one domain per folder under `modules/`; controllers never touch Prisma; services
   never touch `Request`/`Response`.
9. Shared shapes live in `packages/contracts` as zod schemas. If the client and server both know
   a field name, it is declared once, there.

## R3 — Platform isolation

10. `Platform.OS` may appear only in `src/native/**` and `src/theme/**`.
11. Every native capability is behind an interface with `isAvailable()` and a JS fallback.
12. A screen must render correctly when a capability is unavailable — never crash, never show a
    dead button. Hide the entry point or show the degraded path.

## R4 — Data integrity

13. Every mutation is idempotent (`Idempotency-Key`) and survives an app kill (outbox).
14. Never lose user input. Optimistic UI that fails must surface a retry, never a silent drop.
15. Never trust the client for authorisation. Every mutating endpoint re-checks membership + role.
16. Never return a Prisma model directly from a controller.

## R5 — Security

17. No secret, token, key, or password in the repo, in a log, in an error message, or in a
    screenshot. `.env.example` only.
18. Tokens live in Keychain/Keystore. Never in MMKV, AsyncStorage, or Redux.
19. No `console.log` in committed code. Use `logger.*`, which is stripped in release.
20. Validate every input with zod on the server, and re-validate responses on the client.

## R6 — Quality gates

21. `pnpm lint && pnpm typecheck && pnpm test` must pass before you report a prompt complete.
    Paste the output.
22. New service code ships with unit tests. New endpoints ship with an e2e test.
23. No `any`. No `@ts-ignore` without a comment explaining why and a linked issue.
24. No TODO without a reference in `PROGRESS.md` backlog.

## R7 — Scope discipline

25. Build exactly what the prompt's `## Deliverables` lists. Extra ideas go to `PROGRESS.md`
    → "Backlog discovered".
26. One prompt, one branch, one PR. Do not bundle.
27. If you cannot meet an acceptance check, say so plainly with the reason — do not fake it, do
    not weaken the check.

## R8 — Accessibility is not optional

28. Every interactive element: ≥44×44 hit area, `accessibilityRole`, `accessibilityLabel`,
    `accessibilityState` where relevant.
29. Contrast ≥4.5:1 for text, ≥3:1 for icons/borders, in both themes, for all five accents.
30. The capture flow must be completable with a screen reader in ≤4 actions.

## R9 — Performance budgets

31. Cold start <2.5 s mid-range Android. List scroll at 60 fps. Screen push <300 ms.
32. Lists use FlashList. Images are downscaled before upload (≤1440 px, JPEG q80).
33. No synchronous heavy work on the JS thread. No unbounded arrays in state.

## R10 — Honesty

34. Never claim a native capability works on a platform where the OS forbids it. iOS cannot
    screenshot or overlay other apps — say so instead of faking it.
35. Never claim a test passed that you did not run.
36. If a library is unmaintained or incompatible with the RN version in use, stop and report it
    with alternatives rather than forcing it.
