# P10 — Navigation Shell & Floating Navbar

**Lane** B · **Depends on** P09 · **Branch** `feat/p10-navigation-floating-navbar`

## Load
- `09-AGENT-RULES.md`
- `03-DESIGN-SYSTEM.md` §3.3
- `04-ARCHITECTURE.md` §4.3

## Goal
Wire React Navigation and build the floating pill navbar — the signature element. Every screen
in the app will sit inside this shell.

## Deliverables
- `src/navigation/RootNavigator.tsx` (auth stack vs. app stack, based on session)
- `src/navigation/TabsNavigator.tsx` with a **custom** `tabBar` rendering `FloatingNavBar`
- `src/navigation/types.ts` — fully typed `RootStackParamList` and `TabParamList`
- `src/components/ui/FloatingNavBar.tsx` + `useNavBarScroll` hook
- deep-link config (`samyukt://task/:id`, `samyukt://bug/:id`, `samyukt://capture`)
- placeholder screens: Home, Tasks, Bugs, Search, plus the raised Capture button opening the
  capture sheet (stub)

## Requirements
- Implement exactly the spec in §3.3: 64 pt pill, 16 pt margins, safe-area aware, blur behind,
  hairline border, 4 destinations + raised 56 pt centre capture button at `translateY(-12)`.
- Scroll behaviour: hide on scroll down, show on scroll up, never hide while the keyboard is
  open. Implement with `useAnimatedScrollHandler` on the shared value passed down through
  `NavBarScrollContext` — screens attach their scroll handler via a provided hook, not by
  prop-drilling.
- Keyboard behaviour: navbar hides when `keyboardContext` is a full-screen composer and lifts
  above the keyboard otherwise. Declared per screen in a `screenOptions` map, not per component.
- Active indicator slides between items with a spring (`damping 18`, `stiffness 180`).
- Long-press on capture → bug composer directly.
- Haptics: light impact on tab change and on capture open.
- Android back must never exit from a non-home tab; it returns to Home first.

## Do not
- Do not use the default `tabBar` styling as a base — build the pill from scratch.
- Do not render two navbars on nested stacks.
- Do not let the navbar overlap content: every screen gets a bottom inset of
  `navbarHeight + safeArea.bottom + 8` via a `useBottomInset()` hook.

## Acceptance checks
- [ ] Navbar matches the spec on a device with a home indicator and on one without.
- [ ] Scrolling a long list hides it smoothly and reveals it on scroll-up.
- [ ] Opening the keyboard on a non-composer screen lifts the bar; on the capture composer it
      hides cleanly with no double-shift.
- [ ] Deep links `samyukt://task/<id>` open the correct screen.
- [ ] Tab switching has no jank at 60 fps on a mid-range Android device.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
