# 09 — Phase 2 Rules (delta)

Phase 1's `09-AGENT-RULES.md` still applies in full. These are additions and two amendments.

---

## Additions

### P2-1 — Naming
`@doit/*` for every package and import. `com.samyukt.doit` for the app identity, unchanged,
forever. `doit://` for the deep-link scheme. Never introduce a third variation.

### P2-2 — One token file
Colour, spacing, radius and type values live in `packages/design-tokens/src/theme.css`. The
mobile app consumes it through NativeWind; the web app through Tailwind v4. Adding a colour
anywhere else — including a Tailwind palette class like `text-blue-500` — is a bug.

### P2-3 — One permission map
`can(role, action)` from `@doit/contracts` is the only way a client decides what to show. The
server imports the same constant. Never hardcode `role === 'ADMIN'` in a component.

### P2-4 — Web never calls `fetch` outside `lib/api.ts`
Same rule as mobile's `lib/http.ts`: one client, typed errors, one refresh path.

### P2-5 — URL is state
On web, filters, sort, view mode and the open detail item live in the query string. If a user
cannot copy the URL and send it to a colleague, the screen is not finished.

### P2-6 — Both surfaces or neither
A feature added to the web app that the mobile API cannot express is a design smell. Add the
contract first, then both clients.

### P2-7 — No unverified green
A phase is PASSED only with evidence: a device screenshot, a log line, a measured number, a
test name. "It typechecks" is not evidence for a native feature.

## Amendments to Phase 1 rules

### R1 amended — styling
Rule 1 said "no hex outside `theme/`". With Tailwind the rule becomes: no arbitrary values
(`bg-[#fff]`), no inline `style` colours, and no Tailwind palette colours that bypass the
tokens. Utility classes referencing our semantic tokens (`bg-surface`, `text-text-secondary`)
are the correct form on both platforms.

### R6 amended — evidence
Rule 21 said "paste the output". Now also paste: the command, the device/emulator name, and for
native features a screenshot or a `dumpsys`/log excerpt. An agent that cannot produce evidence
must report the check as FAILED, not skip it.

## Never do

- Do not change `com.samyukt.doit`.
- Do not put a token in `localStorage`.
- Do not render user text as HTML without sanitising it.
- Do not run M02 and W02 at the same time.
- Do not merge a web PR that changes the API without the mobile suite passing.
- Do not ship a store build from a branch where the token linter fails.
- Do not claim iOS can overlay or screenshot other apps.
