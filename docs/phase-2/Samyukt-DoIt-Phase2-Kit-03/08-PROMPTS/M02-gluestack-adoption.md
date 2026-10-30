# M02 — gluestack-ui v5 Adoption (scoped)

**Lane** M · **Depends on** M01 · **Branch** `feat/m02-gluestack-adoption`

## Load
- `09-PHASE2-RULES.md`
- `06-GLUESTACK-ADOPTION.md` (this is the spec — follow §6.5 step by step)
- `03-DESIGN-SYSTEM.md` (Phase 1) for the token values
- `03-WEB-DESIGN-SYSTEM.md` §3.1 for the shared CSS token file

## Goal
Move the mobile app onto gluestack-ui v5 + NativeWind v5 so it shares one CSS token file with
the web app — without changing a single screen file.

## Deliverables
- `packages/design-tokens/src/theme.css` — the shared token file with all 5 accents, both themes
- `apps/mobile/global.css` importing it
- `apps/mobile/postcss.config.js`, updated `metro.config.js`, `react-native-css-env.d.ts`
- `apps/mobile/src/components/ui/*` rewritten internally to wrap gluestack primitives, **with
  identical public props**
- `apps/mobile/src/app/dev/TokenProbe.tsx` — a swatch grid that proves every class resolves
- updated `scripts/check-tokens.mjs` implementing the Tailwind rules in
  `03-WEB-DESIGN-SYSTEM.md` §3.7
- the old hand-rolled primitives deleted

## Requirements
- **Pin `lightningcss@1.30.1`** in `overrides` and `resolutions` before installing anything.
- Install: `nativewind@^5.0.0-preview.4`, `react-native-css@^3`, `@gluestack-ui/core`,
  `@gluestack-ui/utils`, `tailwindcss@^4`, `@tailwindcss/postcss`. Commit the exact lockfile.
- Add components: `button input textarea select checkbox switch radio modal actionsheet
  alert-dialog menu popover tooltip toast spinner skeleton avatar badge accordion tabs`.
- **The wrapper rule:** `ui/Button` keeps its exact props (`variant`, `size`, `loading`,
  `disabled`, `onPress`, `children`). Only its internals change. If a screen file must be edited,
  the wrapper is wrong — fix the wrapper.
- Keep React Navigation. Do not migrate to Expo Router in this prompt.
- Keep `FloatingNavBar`, `KeyboardAccessoryBar`, `StickyCard`, `TaskRow`, `BugRow`,
  `SeverityPicker`, `Waveform`, `RecordButton` exactly as they are (restyle their internals to
  token classes if needed, but do not replace them).
- Tag the current HEAD as `pre-gluestack` before starting.

## Do not
- Do not migrate to Expo Router.
- Do not replace the signature components listed above.
- Do not run this at the same time as W02 (both edit `packages/design-tokens`).
- Do not leave two styling systems alive at the end — the old primitives are deleted in this PR.
- Do not use arbitrary colour classes (`bg-[#...]`) anywhere.

## Acceptance checks
- [ ] Every screen renders in light + dark × all 5 accents with nothing unstyled.
- [ ] `git diff --stat` shows zero changes under `src/features/` and `src/screens/`.
- [ ] `node scripts/check-tokens.mjs` exits 0; adding `bg-[#ff0000]` to a component makes it exit 1.
- [ ] `TokenProbe` renders every token class correctly in both themes.
- [ ] Cold start within 5% of the `pre-gluestack` baseline (record both numbers).
- [ ] FlashList scroll holds 60 fps on the mid-range device.
- [ ] TalkBack reads `Select` and `Actionsheet` correctly.
- [ ] Full app walkthrough: login → create task → sticky → bug → theme switch, no crash.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
