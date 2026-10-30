# P04 — Mobile Foundation (Mobile Core)
## Before you start
Read `AGENTS.md`, `ORCHESTRATOR.md`, and the docs listed below. Do not start coding before you have restated the plan in 5–10 lines.
Docs: `02` (mobile), `05` (ALL), `08`. Use the `frontend-design`-style rigor: consistent, restrained, Plane-like.

## Task
1. Theme engine: tokens, light/dark palettes, 5 accents, `ThemeProvider`, `useTheme`, `useStyles`, persistence, system mode.
2. Build the **entire component kit** listed in `docs/05` under `src/ui`. Add a hidden **Design Gallery screen** (`/dev/gallery`, dev builds only) that renders every component in all states; use it to verify dark/light × 5 accents.
3. `Screen`, `Header`, **FloatingNavBar** + **Fab** with hide-on-scroll and keyboard awareness; contextual keyboard toolbar component (`KeyboardToolbar` with pluggable action sets).
4. `core/api` client (axios or fetch wrapper) with auth refresh-and-retry interceptor, React Query setup, SecureStore token storage, session store, error mapping to toasts.
5. Feature architecture: `FeatureManifest` type, navigation registry, expo-router wiring, `pnpm gen:feature <name>` generator producing the skeleton in `docs/08` (working demo feature compiles).
6. Auth screens (login/register) wired to the API (mock adapter allowed if P03 isn't done; hide behind `EXPO_PUBLIC_USE_MOCK`).

## Verify
Gallery looks right in dark/light × all accents; `gen:feature demo` produces a working screen reachable from navbar registry; lint + typecheck pass.
