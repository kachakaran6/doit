# 08 — Feature Recipe (how every future feature/screen is added)

Goal: a new feature is a copy of a template, not a design decision. The agent MUST scaffold using this recipe; ship a generator script `pnpm gen:feature <name>` in Phase 4 that creates the skeleton.

## Backend
1. `nest g resource`-style module in `modules/<name>` (controller, service, dto/, mapper).
2. Update `prisma/schema.prisma` → `prisma migrate dev`.
3. Add types/enums/zod to `packages/shared`.
4. Update `docs/04-data-model-and-api.md`.
5. Add e2e test for happy path + validation + auth.

## Mobile
```
features/<name>/
  screens/<Name>ListScreen.tsx      # uses <Screen>, <Header>, list + Skeleton/Empty/Error
  screens/<Name>DetailScreen.tsx
  components/                       # only feature-specific
  hooks/use<Name>Query.ts, use<Name>Mutation.ts
  api.ts
  index.ts                          # exports manifest
app/(tabs)/<name>.tsx               # 3-line route file re-exporting the screen
```
Steps:
1. `pnpm gen:feature <name>`
2. Fill `api.ts` + hooks (TanStack Query, keys `['<name>', ...]`).
3. Build screens ONLY from `src/ui` components. Need a new visual pattern? Add it to `ui/` first (with dark/light/accent check), then use it.
4. Export `FeatureManifest` and add it to `core/navigation/registry.ts` (one line).
5. Provide states: loading skeleton, empty (EmptyState with CTA), error (ErrorState with retry), pull-to-refresh.
6. Contextual keyboard toolbar config if the screen has inputs.
7. Verify: dark + light + each accent, small & large font scale, offline error.

## Screen skeleton (mandatory shape)
```tsx
<Screen header={<Header title="…" actions={…} />} scroll>
  <Section title="…">…</Section>
</Screen>
```
Floating navbar and safe-area padding come from `Screen`; screens never handle them manually.

## PR checklist
- [ ] No raw colors/sizes in screens
- [ ] Uses shared types, no duplicate types
- [ ] All 3 states handled
- [ ] Manifest registered
- [ ] Docs updated (04 and, if UI pattern added, 05)
