# 05 — Skills & Libraries to use (verified at kit time)

## Agent skills (install, then READ each SKILL.md before designing)
| Skill | Install | Why |
|---|---|---|
| **building-native-ui** (Expo, official) | `npx skills add expo/skills --skill building-native-ui` | Expo Router patterns, native-feeling controls, sheets, animations (Reanimated), platform limits |
| **vercel-react-native-skills** | `npx skills add vercel-labs/agent-skills --skill vercel-react-native-skills` | RN performance, lists, Reanimated/Gesture Handler patterns |
| **sleek-design-mobile-apps** | `npx skills add sleekdotdesign/agent-skills --skill sleek-design-mobile-apps` | Mobile-first design patterns, gestures, safe areas, native feel |
| **gluestack-ui-v5** | `npx skills add gluestack/agent-skills --skill gluestack-ui-v5` | Component foundation + semantic-token discipline (if adopted) |
| **expo-tailwind-setup** (only if using NativeWind) | `npx skills add expo/skills --skill expo-tailwind-setup` | Correct Tailwind v4/NativeWind v5 wiring |
| **frontend-design** (Anthropic skills, if available in your agent) | check the skills registry (skills.sh) | Pushes distinctive, non-template visual decisions |
Rules: check each skill's repo/readme for current install syntax; pin what you install in `DECISIONS.md`; if two skills disagree, the **design spec in docs 02–03 wins**.

## Libraries (verify against current Expo SDK + New Architecture)
Already planned in `kit-ui` (UI polish kit): Reanimated + worklets, Gesture Handler, keyboard-controller, expo-blur (Android `BlurTargetView`), expo-image, expo-haptics, MMKV, FlashList, @gorhom/bottom-sheet, Phosphor or Ionicons, Inter, optional moti/Lottie/wheel-picker.
Additional for this kit:
| Need | Choice |
|---|---|
| Progress ring / small charts | `react-native-svg` (+ Reanimated for the arc) |
| Squircle surfaces | SVG-path squircle helper for large cards/nav only |
| Swipe rows | `ReanimatedSwipeable` from gesture-handler |
| Screenshots in CI/dev | adb + Maestro `takeScreenshot` |
| Image diff/contact sheets | `scripts/contact_sheet.py` |

## Reference apps to study (look, don't copy assets)
Apple Reminders · Things 3 · Linear mobile · Craft · Fantastical · Notion Calendar · Arc. For each, screenshot 3 screens and note: surface tones, row structure, header behavior, empty state, motion.
