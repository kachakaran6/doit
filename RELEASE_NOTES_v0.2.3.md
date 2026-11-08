## DoIt v0.2.3 — Release Build 23

### Highlights & Fixes in Build 23:

1. **Native Intent Lifecycle & Deep Link Routing Fix**:
   - Resolved the persistent "Invitation Unavailable / Error" screen on cold start and task resume.
   - Added `consumeDeepLinkIntent` in `MainActivity.kt` across `onCreate`, `onNewIntent`, and `onPause` to ensure deep link intents are converted to clean launcher intents once consumed.
   - Added single-execution guard in `RootNavigator.tsx` (`hasProcessedInitialUrl`).
   - Added token consumption tracking in `invite-link.ts` (`markInviteTokenConsumed` and `isInviteTokenConsumed`), preventing handled invitation tokens from ever re-triggering navigation.

2. **Full UI/UX Redesign Kit Alignment (`docs/DoIt_UI_Redesign_Kit`)**:
   - Comprehensive audit across all 38 mobile application screens, bottom sheets, drawers, and modal states.
   - Centralized `@doit/tokens` design token engine across both light and dark themes.
   - Verified 4-point spacing scale, typography hierarchy, zero emoji icons, and balanced elevation.
   - Detailed implementation audit logged in `docs/ui-redesign/IMPLEMENTATION_AUDIT.md`.

3. **Web TopBar & Layout Refinements**:
   - Fixed workspace switcher layout shift by locking button width with truncation.
   - Removed redundant duplicate page `<h1>` headings across Overview, Tasks, Bug Queue, Stickies, Projects, Team, and Settings pages.
   - Enhanced Bug Queue thumbnail and screenshot rendering.

### Downloads & Verification:
- **APK**: `DoIt-v0.2.3-build23.apk` (36.0 MB)
- **SHA256**: `35976df7088b2f3633a2474d6e44d7c9160d65f8acc9207455e0c67257c5efe3`

