# 01 — Naming Migration (Samyukt = company, DoIt = product)

One rule: **the npm scope is the product, the bundle id is the company + product.**

`@doit/*` for code. `com.samyukt.doit` for the store identity. Never mix them.

---

## 1.1 Why this matters more than it looks

`applicationId` / `bundleIdentifier` is **permanent after the first store upload**. You cannot
change `com.samyukt.doit` later without shipping a brand-new app and losing every install. So
that string stays exactly as it is, forever, and everything else moves to DoIt.

The npm scope, by contrast, is internal and costs nothing to change — which is why it should be
changed now, before `apps/web` doubles the number of files that reference it.

---

## 1.2 The canonical table

| Thing | Old | New | Notes |
|---|---|---|---|
| npm scope | `@samyukt/` | `@doit/` | internal only |
| API package | `@samyukt/api` | `@doit/api` | |
| Mobile package | `@samyukt/mobile` | `@doit/mobile` | |
| Web package | — | `@doit/web` | new in W00 |
| Contracts | `@samyukt/contracts` | `@doit/contracts` | |
| Tokens | `@samyukt/tokens` | `@doit/tokens` | |
| Config | `@samyukt/config` | `@doit/config` | |
| **Android applicationId** | `com.samyukt.doit` | **`com.samyukt.doit`** | unchanged, permanent |
| **iOS bundleIdentifier** | `com.samyukt.doit` | **`com.samyukt.doit`** | unchanged, permanent |
| iOS widget extension id | — | `com.samyukt.doit.widget` | must be a child of the app id |
| iOS Share Extension id | — | `com.samyukt.doit.share` | child of the app id |
| App Group (widget ↔ app) | — | `group.com.samyukt.doit` | must match on both targets |
| Android widget authority | — | `com.samyukt.doit.widget` | `AppWidgetProvider` authority |
| Display name | "Samyukt" | **"Samyukt DoIt"** | launcher + store |
| Short name / widget label | — | **"DoIt"** | home-screen widget only |
| Expo `name` | — | `Samyukt DoIt` | `app.config.ts` |
| Expo `slug` | — | `doit` | permanent-ish, used by EAS |
| Deep-link scheme | `samyukt://` | **`doit://`** | `doit://task/<id>`, `doit://bug/<id>`, `doit://capture` |
| Universal link | — | `https://app.samyukt.com/*` | iOS associated domains + Android App Links |
| Web app | — | `https://app.samyukt.com` | |
| API | — | `https://api.samyukt.com` | |
| Marketing | — | `https://samyukt.com` | separate, later |
| Cookie domain | — | `.samyukt.com` | lets app + api share the refresh cookie |
| Postgres database | `doit` | `doit` | already correct |
| Docker compose project | — | `doit` | |
| Sentry projects | — | `samyukt-doit-api` / `-mobile` / `-web` | |
| FCM sender / APNs key name | — | `samyukt-doit` | |
| Repo folder | `K:\Doit` | `K:\Doit` | already correct |

Rule of thumb: **if it appears in a store, an OS dialog, or a URL a user can see → `samyukt.doit`.
If it appears in an import statement or a `pnpm --filter` → `doit`.**

---

## 1.3 Find-and-replace map

Run these from the repo root, in this order, and review the diff before committing.

```bash
# 1. npm scope in all package.json files
rg -l '"@samyukt/' --glob 'package.json' | xargs sed -i 's|"@samyukt/|"@doit/|g'

# 2. imports and requires in source
rg -l "@samyukt/" --glob '!node_modules' --glob '!*.lock' \
  | xargs sed -i 's|@samyukt/|@doit/|g'

# 3. tsconfig paths
sed -i 's|@samyukt/|@doit/|g' tsconfig.base.json apps/*/tsconfig.json packages/*/tsconfig.json

# 4. Turbo / workspace filters in docs, CI and scripts
rg -l "@samyukt/" --glob '!node_modules' | xargs sed -i 's|@samyukt/|@doit/|g'

# 5. deep-link scheme
rg -l "samyukt://" --glob '!node_modules' | xargs sed -i 's|samyukt://|doit://|g'

# 6. verify nothing is left
rg "@samyukt/" --glob '!node_modules' --glob '!*.lock'   # expect: only docs mentioning the company
rg "samyukt://"  --glob '!node_modules'                  # expect: nothing
```

Then regenerate the lockfile and prove it still builds:

```bash
pnpm install
pnpm -r typecheck
pnpm -r lint
pnpm --filter @doit/api test
```

### Deliberately NOT replaced

These keep `samyukt` because they are user-visible or permanent:

- `com.samyukt.doit` (everywhere: gradle, `app.config.ts`, Xcode, entitlements)
- `group.com.samyukt.doit`
- `https://app.samyukt.com`, `https://api.samyukt.com`
- `@samyukt.com` email addresses of the seeded accounts
- the word "Samyukt" in `README`, store listing copy, legal documents

---

## 1.4 `app.config.ts` after migration

```ts
export default {
  name: 'Samyukt DoIt',
  slug: 'doit',
  scheme: 'doit',
  version: '1.0.0',
  ios: {
    bundleIdentifier: 'com.samyukt.doit',
    associatedDomains: ['applinks:app.samyukt.com'],
  },
  android: {
    package: 'com.samyukt.doit',
    intentFilters: [{
      action: 'VIEW',
      autoVerify: true,
      data: [{ scheme: 'https', host: 'app.samyukt.com', pathPrefix: '/t' }],
      category: ['BROWSABLE', 'DEFAULT'],
    }],
  },
  extra: { apiUrl: process.env.EXPO_PUBLIC_API_URL },
};
```

---

## 1.5 Command cheat-sheet after the rename

| Task | Command |
|---|---|
| Start API | `pnpm --filter @doit/api start:dev` |
| Start mobile (dev client) | `pnpm --filter @doit/mobile start` |
| Build + install Android dev client | `pnpm --filter @doit/mobile android` |
| Build + install iOS dev client | `pnpm --filter @doit/mobile ios` |
| Start web | `pnpm --filter @doit/web dev` |
| Run all tests | `pnpm -r test` |
| Typecheck everything | `pnpm -r typecheck` |
| Token lint | `node scripts/check-tokens.mjs` |

**Note on `pnpm --filter @doit/mobile android`:** this requires a dev client build and a
connected device. It does **not** work against Expo Go, and neither do the overlay, widgets or
screen capture. If your current workflow is "scan QR with Expo Go", switch to:

```bash
adb reverse tcp:3000 tcp:3000        # phone → your PC's API
npx expo run:android                 # builds the dev client with native modules
```

---

## 1.6 Definition of done

- [ ] `rg "@samyukt/"` returns only docs/store/legal mentions, zero code hits.
- [ ] `rg "samyukt://"` returns nothing.
- [ ] `pnpm install && pnpm -r typecheck && pnpm -r lint && pnpm -r test` all green.
- [ ] `com.samyukt.doit` still present in `app.config.ts`, `build.gradle`, Xcode project,
      entitlements, and `AndroidManifest.xml` — unchanged, byte for byte.
- [ ] Launcher label reads "Samyukt DoIt".
- [ ] `doit://task/<id>` opens the task screen on a real device.
- [ ] A dev-client build (not Expo Go) installs and launches.
