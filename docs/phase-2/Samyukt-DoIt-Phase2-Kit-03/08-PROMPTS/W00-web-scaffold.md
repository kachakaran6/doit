# W00 — Web Scaffold + Shared Tokens + CI

**Lane** W · **Depends on** R00 · **Branch** `feat/w00-web-scaffold`

## Load
- `09-PHASE2-RULES.md`
- `02-WEB-ARCHITECTURE.md` §2.2, §2.5, §2.8
- `03-WEB-DESIGN-SYSTEM.md` §3.1

## Goal
Create `apps/web` as an empty but correctly-shaped Vite SPA that already consumes the shared
token file, so every later web prompt has a home.

## Deliverables
- `apps/web/` — Vite 6 + React 19 + TypeScript strict
- React Router v7 with a placeholder route and a `NotFound`
- Tailwind CSS v4 wired with `@doit/tokens/theme.css` imported
- `src/styles/index.css` + `src/styles/accents.css` (all 5 accents)
- `src/lib/api.ts` (fetch wrapper with the envelope unwrap + `ApiError`) — no auth yet
- `src/lib/queryClient.ts`
- `src/app/providers/` with `QueryProvider` and `ThemeProvider` (dark/light/system + accent,
  persisted to localStorage, applied as `class="dark"` + `data-accent` on `<html>`)
- a `/dev/tokens` page rendering every token as a swatch, in both themes × 5 accents
- `apps/web/.env.example`
- CI job: lint, typecheck, test, build, bundle-size check

## Requirements
- `apps/web/package.json` name is `@doit/web`; add it to the Turbo pipeline and the workspace.
- Tailwind v4 CSS-first only: no `tailwind.config.js`. Theme lives in CSS.
- The theme provider must apply the theme **before first paint** (an inline script in
  `index.html` reading localStorage) — no flash of the wrong theme.
- `api.ts` must: unwrap `{data}` / `{error}`, throw a typed `ApiError` carrying `code` and
  `requestId`, and send `x-request-id` generated client-side.
- Bundle budget: initial JS < 220 KB gzip. Fail CI above it.
- No `any`, no `console.log`.

## Do not
- Do not build any product screen.
- Do not add auth, routing guards, or API calls yet.
- Do not create a second token file — import the shared one.
- Do not use Next.js.

## Acceptance checks
- [ ] `pnpm --filter @doit/web dev` serves a page that renders in light and dark.
- [ ] Switching accent to all 5 changes the swatches live.
- [ ] Cold reload in dark mode shows no white flash.
- [ ] `pnpm --filter @doit/web build` produces a bundle under the budget.
- [ ] `/dev/tokens` shows every colour, radius, space and type token.
- [ ] Changing a value in `packages/design-tokens/src/theme.css` changes both the web swatches
      and the mobile app (prove with one edit and two screenshots).

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
