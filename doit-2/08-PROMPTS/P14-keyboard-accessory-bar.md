# P14 — Keyboard Accessory Bar (Contextual)

**Lane** B · **Depends on** P11 · **Branch** `feat/p14-keyboard-accessory-bar`

## Load
- `09-AGENT-RULES.md`
- `03-DESIGN-SYSTEM.md` §3.4
- `02-FEATURE-SPEC.md` F3, F6

## Goal
Build the contextual keyboard bar so a tester can set a due date, priority, label, severity or
attach a screenshot without ever leaving the text field.

## Deliverables
- `src/app/providers/KeyboardProvider.tsx` — tracks the focused field and the active
  `keyboardContext`
- `src/components/ui/KeyboardAccessoryBar.tsx` — the bar itself
- `src/components/ui/KeyboardChip.tsx`
- wiring into the task composer, bug composer, comment composer, sticky composer, search
- `useKeyboardInset()` hook so screens can pad correctly

## Requirements
- The chip set is driven by `(screenContext, focusedField)` exactly as the table in §3.4 says.
  Unknown combinations fall back to `[Voice, Attach, Send]`.
- Chips that mutate (due date, priority, label, severity, colour) apply immediately with a
  150 ms accent flash and no navigation. Chips that open a picker open a `Sheet`, and closing
  the sheet returns focus to the field it came from.
- iOS: `InputAccessoryView` with `nativeID` per context. Android: a `View` positioned with
  `useAnimatedKeyboard()`; must not double-shift with `KeyboardAvoidingView` (pick one strategy
  and document it).
- The bar scrolls horizontally when chips overflow; the Send chip is pinned right and always
  visible.
- Long-press on the mic chip starts recording without releasing the field.
- Accessibility: each chip is a button with a spoken label including its current value
  ("Due date, none" → "Due date, today").

## Do not
- Do not build a second, different quick-action row anywhere else in the app.
- Do not shift the layout twice — the input must not jump when the bar appears.
- Do not show the bar on screens that have no composer.

## Acceptance checks
- [ ] Task title focused → chips are Today / Tomorrow / Priority / Label / Voice / Send.
- [ ] Bug description focused → chips include Severity and Screenshot.
- [ ] Tapping "Today" sets the due date without dismissing the keyboard, and the field above
      reflects it immediately.
- [ ] Opening a picker sheet and closing it restores focus to the same field.
- [ ] No layout jump on either platform (record a 5 s screen capture as evidence).
- [ ] VoiceOver/TalkBack reads each chip with its current value.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
