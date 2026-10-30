# 06 — gluestack-ui v5: what to adopt, what to keep

You asked for `npx skills add gluestack/agent-skills --skill gluestack-ui-v5` and "best UI".
Here is the honest read before you spend a week on it.

---

## 6.1 What gluestack-ui v5 actually is (verified, not assumed)

- Stable since **June 2026**. Built on **Tailwind CSS v4 + NativeWind v5** (or UniWind, an
  Expo-only alternative engine). Styling is CSS-first: tokens live in `global.css` under
  `@layer theme`, and `tailwind.config.js` is gone.
- **Next.js support was dropped** in v5, along with the universal monorepo templates. It is a
  native-only library now. (Which is fine — your web app is shadcn.)
- **Expo Router first.** Deep integration, but React Navigation is not forbidden.
- Components are **copy-paste, not a dependency**: `npx gluestack-ui@latest add button` writes
  the source into your repo. You own and edit it.
- Two prerequisites to note: `lightningcss` must be pinned to `1.30.1`, and `nativewind@5` is
  still on a **preview** release line (`^5.0.0-preview.4`).

That last point is the real risk: you would be putting a preview styling engine under a shipped
app. Not a reason to refuse — but a reason to migrate in a branch, keep the old build shippable,
and not do it the week before a store submission.

## 6.2 The decision

**Adopt gluestack v5 in a scoped way. Do not do a full rewrite.**

| Adopt | Keep as-is | Why |
|---|---|---|
| NativeWind v5 as the styling engine | — | gives you Tailwind utility classes on RN, and the **same CSS token file as the web app** |
| `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Radio` | — | forms are where accessibility and platform quirks bite hardest; gluestack's are battle-tested |
| `Modal`, `Actionsheet`, `AlertDialog` | — | focus management, back-button handling, scroll locking |
| `Menu`, `Popover`, `Tooltip` | — | positioning on RN is genuinely hard |
| `Toast`, `Spinner`, `Skeleton`, `Avatar`, `Badge` | — | |
| `Accordion`, `Tabs` | — | |
| — | `FloatingNavBar` | your signature element. No gluestack equivalent, and generic tabs would destroy the design |
| — | `KeyboardAccessoryBar` | no equivalent anywhere; this is product IP |
| — | `StickyCard`, `TaskRow`, `BugRow`, `SeverityPicker`, `Waveform`, `RecordButton` | product-specific, already built, already tokenised |
| — | all `native/` modules | untouched |
| — | React Navigation (unless you choose the Expo Router path) | migration cost with no user-visible benefit |

Roughly: **replace the generic primitives, keep the signature components.** You get better
accessibility and less hand-rolled code where it matters, and you keep the thing that makes the
app look like Samyukt DoIt rather than every other gluestack app.

## 6.3 The Expo Router question

gluestack v5 is "Expo Router first". You are on React Navigation v7, and everything works.

| | Stay on React Navigation | Move to Expo Router |
|---|---|---|
| Effort | 0 | 3–5 days (file-based routes, deep links, typed params, every `navigation.navigate` rewritten) |
| Benefit | none | slightly better gluestack docs alignment, file-based routes |
| Risk | none | touches every screen in a shipped app |

**Recommendation: stay on React Navigation.** "Expo Router first" means it is the best-supported
path, not the only one. Revisit only if you rebuild the navigation layer for another reason.

## 6.4 The token bridge (the actual win)

This is why the migration is worth doing: one CSS file themes both apps.

```
packages/design-tokens/src/theme.css      ← the single source of truth
        │
        ├─► apps/mobile/global.css        @import "@doit/tokens/theme.css";
        │                                 (NativeWind v5 reads it, class names resolve)
        │
        └─► apps/web/src/styles/index.css @import "@doit/tokens/theme.css";
                                          (Tailwind v4 reads it)
```

Then `bg-surface`, `text-text-secondary`, `border-border`, `bg-accent`, `rounded-lg` mean the
same thing on both platforms, and switching accent is one attribute on the root element.

## 6.5 Migration sequence (prompt M02)

1. **Branch and freeze.** `feat/m02-gluestack`. Tag the current build as
   `pre-gluestack` so you can ship it if this goes sideways.
2. **Pin `lightningcss@1.30.1`** in `package.json` overrides/resolutions *before* installing
   anything else — the docs are explicit that skipping this breaks Metro.
3. **Install:** `nativewind@^5.0.0-preview.4`, `react-native-css@^3`, `@gluestack-ui/core`,
   `@gluestack-ui/utils`, `tailwindcss@^4`, `@tailwindcss/postcss`.
4. **`npx gluestack-ui@latest init`**, choose NativeWind v5, let it write `global.css`,
   `postcss.config.js`, `metro.config.js`, `react-native-css-env.d.ts`, and the provider.
5. **Write `theme.css`** with your five accents and both themes (§6.4). Map every token you
   already have — do not invent new names.
6. **`npx gluestack-ui@latest add button input textarea select checkbox switch modal actionsheet alert-dialog menu popover tooltip toast spinner skeleton avatar badge accordion tabs`**
7. **Rewire your `components/ui/*` wrappers** to render gluestack primitives with your props, so
   **no screen file changes**. This is the key move: keep the `ui/Button` API identical, swap its
   internals. Screens stay untouched, which is what makes the migration safe.
8. **Update the lint rule** for Tailwind classes (`03-WEB-DESIGN-SYSTEM.md` §3.7).
9. **Delete the old hand-rolled primitives** only after every screen renders correctly in both
   themes and all five accents.
10. **Run the full QA matrix** — this touches every screen, so treat it as a regression release.

## 6.6 Risks and mitigations

| Risk | Mitigation |
|---|---|
| NativeWind v5 is preview; a patch could break the build | Pin exact versions, commit the lockfile, keep the `pre-gluestack` tag shippable |
| Metro/lightningcss version mismatch | Pin `lightningcss@1.30.1` in overrides *and* resolutions |
| Class names silently not applying | Build a `DevTokenProbe` screen rendering a grid of `bg-*`/`text-*` swatches; if a swatch is unstyled, the token is wrong |
| Performance regression from CSS-in-class compilation | Measure list scroll fps and cold start before/after; budget: no more than 5% slower |
| Losing the design's identity | The keep-list in §6.2 is a contract. Signature components are not up for replacement |
| Two styling systems alive at once | No — the migration ends with the old primitives deleted in the same PR |

## 6.7 Definition of done

- [ ] Every screen renders in light + dark × 5 accents with no unstyled element.
- [ ] `ui/Button` and friends keep their exact public props; no screen file was edited.
- [ ] `check-tokens.mjs` (updated for Tailwind) exits 0.
- [ ] Cold start within 5% of the `pre-gluestack` baseline.
- [ ] List scroll holds 60 fps on the mid-range device.
- [ ] TalkBack reads gluestack `Select` and `Actionsheet` correctly.
- [ ] Full QA matrix passes; the app is shippable from this branch.
