# 07 — Platform Craft

The details that make a React Native app feel native rather than "an app built in React Native".

---

## 7.1 The keyboard (visible in your screenshots)

Your composer opens a **teal** Gboard. The app's palette is violet-on-black. That single clash
undoes the polish of the whole screen.

```tsx
<TextInput keyboardAppearance="dark" ... />   // iOS
```

Android has no per-app keyboard theme, but you can:

- Set `windowSoftInputMode="adjustResize"` so the sheet resizes rather than being covered.
- Set `android:windowLightStatusBar` / `navigationBarColor` in the theme so the system chrome
  matches.
- On Android 13+, set `Theme.Material3.Dark` as the app theme so system surfaces (keyboard
  suggestions bar, text selection handles) follow.

Additionally, **style the selection handles and cursor**: `selectionColor={accent}` on every
`TextInput`. Default blue handles on a violet app look borrowed.

## 7.2 Status bar

```tsx
<StatusBar style="light" backgroundColor="transparent" translucent />
```

On Home the status bar icons sit directly on the canvas — good. But ensure:
- `translucent` + a top safe-area inset so content never slides under the clock.
- Light content in dark theme, dark content in light theme, switching with the theme.
- The navbar's bottom inset respects the gesture bar (`useSafeAreaInsets().bottom`).

## 7.3 Safe areas

Every screen:

```
paddingTop: insets.top + 16
paddingBottom: insets.bottom + navbarHeight + 24
```

Never hardcode 44 or 24 for the notch. Test on a device with a cutout (the Pixel 7a in your
screenshots has one).

## 7.4 Touch targets

44×44 minimum, everywhere. Your checkbox looks ~28 — wrap it in a 44 hit area:

```tsx
<Pressable hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
```

Chips at 32 tall are fine visually but need 8px vertical `hitSlop`.

## 7.5 Scrolling

- Use `FlashList` for every list. `estimatedItemSize` set to the row height.
- `contentInsetAdjustmentBehavior="automatic"` on iOS.
- `showsVerticalScrollIndicator={false}` — the navbar is the scroll affordance.
- Pull-to-refresh tinted `accent` (`tintColor` on iOS, `colors` on Android).
- Overscroll glow on Android: set `overScrollMode="never"` so it matches iOS's rubber band.

## 7.6 Android-specific polish

| Issue | Fix |
|---|---|
| Ripple on every pressable looks dated | `android_ripple={{ color: 'rgba(255,255,255,0.06)', borderless: false }}` — or disable and use the scale primitive |
| Elevation shadows look grey and dirty | use `elevation: 0` and rely on the ladder + highlight |
| Font falls back to Roboto | set `fontFamily` explicitly on every text token |
| Back gesture | `react-native-screens` + `enableFreeze()`; test the predictive back gesture on Android 14 |
| Status bar contrast | `expo-status-bar` with `style="light"`, not `"auto"` |

## 7.7 iOS-specific polish

| Issue | Fix |
|---|---|
| Bouncy scroll beyond content | correct — leave it |
| Sheet drag-to-dismiss | `@gorhom/bottom-sheet` with `enablePanDownToClose` |
| Haptics | `expo-haptics` `impactAsync` — iOS is where it matters most |
| Large title collapse | if you use one, `headerLargeTitle` on the native stack; otherwise skip |
| Blur | `expo-blur` with `tint="dark"` matches the system material |

## 7.8 Performance as a visual quality

Jank reads as cheap. Non-negotiables:

| Budget | Target |
|---|---|
| Frame rate while scrolling | 60fps locked (120 on ProMotion if the device allows) |
| Tap → visual response | < 100ms |
| Screen transition | < 320ms |
| JS thread work during scroll | zero |
| Image decode | off-thread, sized to display size |

Common causes of jank in this app specifically:

- Inline `style={{}}` objects recreated per render → hoist to `StyleSheet.create`.
- `FlatList` instead of `FlashList` with variable heights.
- Animating `height`/`top` instead of `transform`.
- The blur view re-rendering on scroll — memoise it, or use a static colour at rest.

## 7.9 The five-minute device check

Before any screen is called done, on a **physical** device:

1. Scroll to the bottom and back — no jank, no white flash.
2. Open the keyboard — nothing is covered, the sheet resizes smoothly.
3. Rotate (if supported) — nothing clips.
4. Switch theme — no flash of the wrong theme, no reload.
5. Tap every interactive element — each responds within 100ms with a visible state.
