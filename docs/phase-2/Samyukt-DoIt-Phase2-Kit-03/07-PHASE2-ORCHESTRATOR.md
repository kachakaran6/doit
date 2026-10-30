# 07 — Phase 2 Orchestrator

Same contract as Phase 1: one prompt = one branch = one PR, no gate skipped, `PROGRESS.md`
updated every time. Read `00-WHAT-REMAINS.md` first — it explains why the order is this order.

---

## 1. Phase map

```
R00  Naming migration                          ← blocks everything
 │
 ├── M  mobile      M01 ──► M02 ──► M03
 ├── B  backend     B00 ──► B01 ──► B02
 ├── W  web         W00 ──► W01 ──► W02 ──► W03 ──► W04 ──► W05 ──► W06 ──► W07 ──► W08 ──► W09 ──► W10
 └── L  launch      L01 (legal) ──► L00 (store submission, after M03 + B00 + B01)
```

Three lanes run genuinely in parallel after R00: mobile, backend, web. L01 can start the day you
decide to let anyone outside the team log in.

## 2. Prompt index

| ID | Title | Depends on | Lane | Est. |
|---|---|---|---|---|
| R00 | Naming migration (`@doit/*`, keep `com.samyukt.doit`) | — | — | S |
| M01 | Dev client build + native module verification | R00 | M | M |
| M02 | gluestack-ui v5 adoption (scoped) | M01 | M | L |
| M03 | QA evidence, targeted tests, hardening | M02 | M | L |
| B00 | Production infrastructure | R00 | B | M |
| B01 | Real email, push, AI providers | B00 | B | M |
| B02 | Observability, security headers, backups | B01 | B | M |
| W00 | Web scaffold + shared tokens + CI | R00 | W | S |
| W01 | Web auth (cookies, CSRF, guards, invites) | W00, B00 | W | L |
| W02 | Web design system (shadcn + accents + parity) | W01 | W | M |
| W03 | App shell (sidebar, topbar, workspace, dashboard) | W02 | W | M |
| W04 | Board (drag, filters, URL state, virtualisation) | W03 | W | L |
| W05 | Task detail drawer (comments, checklist, attachments, activity) | W04 | W | L |
| W06 | Bugs, sessions, stickies on web | W05 | W | M |
| W07 | Search, command palette, notifications | W06 | W | M |
| W08 | Settings, members, roles, admin/audit | W07 | W | M |
| W09 | Realtime + presence + conflict UX | W08 | W | M |
| W10 | Web QA, a11y, performance, deploy | W09 | W | L |
| L00 | Store submission (Play + App Store) | M03, B00, B01, L01 | L | L |
| L01 | Legal, privacy, DPDP compliance, deletion/export | — | L | M |

## 3. Gates

### G7 — after R00
- [ ] `rg "@samyukt/"` finds no code references; `rg "samyukt://"` finds nothing.
- [ ] `pnpm install && pnpm -r typecheck && pnpm -r lint && pnpm -r test` green.
- [ ] `com.samyukt.doit` unchanged in every native config file.
- [ ] Launcher label reads "Samyukt DoIt".

### G8 — after M01 (the honesty gate)
- [ ] A **dev client** build (not Expo Go) installs on a physical Android device.
- [ ] The overlay bubble actually appears over a third-party app.
- [ ] A shake during a session produces a real screenshot.
- [ ] A widget exists in the launcher's widget picker and quick-add works.
- [ ] Anything that does not work is written down as a defect with a severity — **no green
      boxes for unverified phases**.

### G9 — after M02
- [ ] Every screen renders in light/dark × 5 accents, nothing unstyled.
- [ ] No screen file was edited (only `components/ui/*` internals changed).
- [ ] Cold start within 5% of the pre-gluestack baseline.

### G10 — after B00/B01/B02
- [ ] Production DB, storage and Redis reachable; TLS valid; secrets in a manager.
- [ ] A restore from backup has been performed successfully and timed.
- [ ] An invite email arrives in a real inbox; a password reset works end to end.
- [ ] A push notification arrives on a real device from a production build.
- [ ] Sentry receives an error from each of the three apps.

### G11 — after W03
- [ ] A user can register on the web, verify, create a workspace, and see the dashboard.
- [ ] Refresh works across a page reload with no login flash.
- [ ] Two tabs stay logged in together (BroadcastChannel).
- [ ] Revoking the web session from mobile logs the browser out.

### G12 — after W05
- [ ] Board with 300 cards: drag across columns, filters in the URL, detail drawer as a route.
- [ ] A TESTER sees no delete controls anywhere; an ADMIN does.
- [ ] Keyboard-only: `⌘K` → create a task → complete it, without touching the mouse.

### G13 — after W10
- [ ] Lighthouse performance ≥ 90, accessibility ≥ 95.
- [ ] Playwright suite covers the 12 critical journeys.
- [ ] Deployed to `app.samyukt.com` with the security headers from `04-WEB-AUTH-AND-AUTHZ.md`.
- [ ] A second person (not the author) completes a bug report on web unaided.

### G14 — release (after L00/L01)
- [ ] Store listings approved on both platforms.
- [ ] Privacy policy and terms live at public URLs, linked in both apps.
- [ ] Data deletion and export work and are tested.
- [ ] The three surfaces (mobile, web, API) all report healthy.

## 4. Parallelism rules

- Lanes M, B and W touch disjoint paths. They can run in the same week, even with two agents.
- **Exception:** W01 depends on B00's cookie/CORS work. Do B00's CORS + cookie endpoints before
  starting W01, even if the rest of B00 (storage, Redis) is still in progress.
- M02 and W02 both edit `packages/design-tokens`. **Never run them concurrently.** Do M02 first,
  then W02, so the token file has one author at a time.

## 5. Context discipline

Per prompt, always load: `09-PHASE2-RULES.md` + the prompt itself. Add only what the prompt's
`## Load` section lists. Phase 1 documents remain authoritative for anything not contradicted
here. Carry state in `PROGRESS.md`.

## 6. Escalation triggers

Stop and ask when:
- a native module turns out not to exist and the prompt assumed it did (very likely in M01);
- the store rejects the overlay permission justification;
- a token migration would change the visual design;
- the web app needs an API shape that does not exist and adding it breaks mobile;
- a legal question arises that you cannot answer from `L01` (refund policy, data residency).

## 7. Definition of done for Phase 2

The product is finished when all four are true:

1. A tester reports a bug from inside another app on Android in under five seconds, and on iOS
   via Back Tap in under eight.
2. A lead triages the same queue on a laptop in a browser, with drag-and-drop, filters in the
   URL, and keyboard shortcuts.
3. Both clients share one token file, one permission map and one API contract.
4. A stranger can install the app from a store link, sign up, and be productive without you
   explaining anything.
