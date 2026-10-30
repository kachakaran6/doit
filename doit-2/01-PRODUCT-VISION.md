# 01 — Product Vision (the POV)

## The problem

Testing is boring because *capturing* is boring.

A tester finds a bug. The bug lives in their head for about forty seconds while they do this:
switch to WhatsApp, or open Jira, or open a notes app; remember what they saw; type it badly
with one thumb; realise they forgot the screenshot; go back; can't reproduce it; type "nvm";
give up. Half the bugs found in a testing session never get filed, and the ones that do arrive
stripped of the context that made them reproducible.

The bug was never the problem. **The gap between seeing and recording is the problem.**

## The thesis

> Capture must happen *on top of the app being tested*, in under five seconds, with one tap
> or one shake — and the system must fill in everything the tester would otherwise have to type.

Samyukt exists to close that gap. Everything else — tasks, stickies, labels, due dates — is
the natural home for what gets captured.

## Three capture surfaces, one pipeline

| Surface | Trigger | Platform | Latency target |
|---|---|---|---|
| **Quick Capture bubble** | Tap the floating bubble over any app | Android | < 5 s to submitted |
| **Shake capture** | Shake the phone during a Test Session | Android (full), iOS (in-app) | < 4 s |
| **Home-screen widget** | One tap on the widget | Both | < 3 s to a saved task |

All three land in the same pipeline:

```
trigger → capture (text / voice / screenshot) → auto-context → transcribe → structure → confirm → sync
```

## The auto-context rule

A bug report the tester has to fill in is a bug report that doesn't get filled in. So Samyukt
captures, without asking:

- app under test (foreground package / bundle id) and, where readable, its version
- device model, OS version, screen density, locale, free storage
- timestamp, test session id, tester
- screenshot (or short screen recording) of the moment
- voice transcript, plus the raw audio file
- the tester's own words as the "steps to reproduce" seed

The tester's only job is to say what happened. The system proposes the title, the severity,
the labels and the repro steps; the tester taps **Send**. Editing is optional, never required.

## Who it is for

- **The tester** (primary). On their feet, one hand, app in front of them, patience for exactly
  one interaction. Success = they never open WhatsApp to report a bug again.
- **The lead** (secondary). Triages a queue that arrives pre-labelled, pre-screenshotted, and
  grouped by app and session.
- **The dev** (tertiary). Opens one bug and gets: what happened, on what device, in what build,
  with a picture and a recording of it.

## Product principles

1. **Five seconds or it doesn't ship.** Any capture flow that needs more than one screen and
   one confirmation is wrong.
2. **Voice is a first-class input, not a feature.** Speaking is faster than typing on a phone
   with one hand. Every text field that accepts a description also accepts a voice note.
3. **Quiet, planar, professional.** Flat surfaces, hairline borders, one accent colour used
   sparingly. No gradients, no drop-shadow stacks, no playful bounce. The UI should feel like
   a tool, not a toy.
4. **One design system, zero exceptions.** Five accents, two themes, one navbar, one keyboard
   bar. A screen that invents its own look is a bug.
5. **Capture is offline-first.** Testers test in lifts, basements, and on bad 4G. Recording
   must never depend on the network. Sync is a background concern.
6. **Nothing is a dead end.** Every sticky becomes a task. Every bug is a task. Every voice
   note is editable text. Every capture is recoverable.
7. **Permissions are asked once, explained in plain language, and never nagged.** If a
   permission is denied, the app degrades to a slower path instead of breaking.

## Non-goals (v1)

- Not a Jira/Linear replacement. No sprints, no story points, no Gantt, no epics hierarchy.
- No web app. Mobile + API only. (The API is web-ready; the UI is not built.)
- No time tracking, no billing, no client portals.
- No cross-app screenshot on iOS — it is not permitted by the OS. Do not attempt it.
- No team chat. Comments on a task, nothing more.
- No AI auto-fixing or code generation. AI is used for transcription and structuring only.

## Success metrics

| Metric | Target |
|---|---|
| Median capture time (bubble tap → submitted) | < 5 s |
| % of bug reports with a screenshot attached | > 85% |
| % of reports created by voice | > 50% |
| Bugs filed per tester per session | 2× baseline |
| Reports needing lead re-labelling | < 15% |
| Crash-free sessions | > 99.5% |

## The one-sentence POV

**A tester's phone should be the bug tracker: shake it, say what broke, and be back in the app
before the animation finishes.**
