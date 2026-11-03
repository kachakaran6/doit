# 05 — Motion & Response

Premium is largely a *temporal* quality. A static screenshot can look expensive and still feel
dead in the hand. This file makes it feel alive without making it busy.

---

## 5.1 The four motion primitives

Every animation in the app is one of these four. Anything else is decoration and should be
deleted.

| Primitive | Spec | Used for |
|---|---|---|
| **Press** | scale `0.97`, 90ms `ease-out`, plus an `L3` overlay at 60% | every tappable surface |
| **Arrive** | opacity 0→1 + translateY 8→0, 220ms `ease-out`, stagger 20ms, max 6 items | list items, cards on mount |
| **Expand** | spring `damping 18, stiffness 180`, height auto | sheets, accordions, inline detail |
| **Settle** | spring `damping 20, stiffness 200, mass 0.8` | selection indicators, tab pill, checkbox |

**Nothing loops. Nothing bounces for decoration. Nothing animates that the user did not cause** —
except `Arrive` on first paint, which is allowed once.

## 5.2 Durations

| Interaction | Duration |
|---|---|
| Press | 90ms |
| Colour / opacity change | 150ms |
| Chip selection, checkbox | 150ms |
| Row expand | 220ms |
| Screen push | platform default (iOS slide / Android fade-through) |
| Sheet open | 240ms `ease-out` |
| Toast in | 200ms `ease-out`, out 150ms |
| Skeleton shimmer | 1200ms, linear, infinite (the only loop) |

Nothing exceeds 320ms. If a transition feels slow, the problem is the transition, not the user.

## 5.3 Shared elements — the one "wow" worth building

Two places, both cheap with Reanimated's `sharedTransitionTag` (or a manual layout animation):

1. **Task row → detail sheet.** The card's title and surface morph into the sheet header.
2. **Sticky → sticky editor.** The tinted card expands in place.

Everything else uses standard push transitions. Two shared elements is taste; ten is a portfolio
piece that will break on a mid-range Android.

## 5.4 Haptics

`expo-haptics`, four uses only:

| Event | Haptic |
|---|---|
| Tab change, chip select | `impactAsync(Light)` |
| Primary button press | `impactAsync(Medium)` |
| Capture started (mic/bubble) | `impactAsync(Heavy)` |
| Submit success | `notificationAsync(Success)` |
| Validation failure | `notificationAsync(Error)` |

Never on scroll, never on every row render, never on mount. Respect the OS setting — `expo-haptics`
already no-ops when disabled.

## 5.5 The response budget

This is the part users feel without naming:

| Action | Must respond within |
|---|---|
| Any tap shows *something* (scale, colour, ripple) | 100ms |
| Checkbox toggles visually | 50ms |
| Optimistic create appears in the list | 100ms |
| Sheet starts moving | 100ms |
| Screen transition begins | 100ms |

The rule: **the UI acknowledges before the network answers.** A tap that produces no visual change
for 300ms reads as a bug, even when it is working.

## 5.6 Loading choreography

| Situation | What to show |
|---|---|
| First load of a list | 6 skeleton rows matching the real row layout, shimmer |
| Refresh | native pull-to-refresh only — **never** a full-screen spinner |
| Creating an item | the item appears immediately, with a subtle 40% opacity until confirmed |
| Creating fails | the item stays, marked with a small warning icon + retry, never disappears silently |
| Uploading an attachment | the thumbnail appears with a progress ring overlay |
| Background sync | a 6px dot in the header, no toast |

No centred spinners anywhere. A spinner says "I have no idea how long this will take"; a skeleton
says "here is what is coming".

## 5.7 Reduced motion

```ts
const reduce = useReducedMotion();
const config = reduce ? { duration: 0 } : { damping: 18, stiffness: 180 };
```

When reduced motion is on: springs become instant, `Arrive` becomes a plain fade, shared elements
are disabled, shimmer becomes a static skeleton. Layout still changes; only the transition
disappears.

## 5.8 Implementation notes (Reanimated 3)

```ts
// the press primitive, used by every tappable
const scale = useSharedValue(1);
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

<AnimatedPressable
  onPressIn={() => { scale.value = withTiming(0.97, { duration: 90 }); }}
  onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
  style={style}
/>
```

- Use `withSpring` for anything released by a finger; `withTiming` for anything the system drives.
- Animate `transform` and `opacity` only. Never animate `height`, `top`, `width` — use layout
  animations.
- One `useAnimatedScrollHandler` per screen, shared between the navbar and the header.
