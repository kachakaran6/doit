# 07 — Compliance & Risks surfaced by the screens

1. **AccessibilityService "Silent Screenshots" (P1).** Google Play restricts AccessibilityService use to genuine accessibility purposes and requires declarations; apps using it for screenshots/automation are commonly rejected. Verify current policy at the Play Console help. Options: (a) **two flavors**: `play` (no AccessibilityService; MediaProjection with per-session consent + in-app capture + "detect user's own screenshot" prompt) and `direct` (full silent capture, distributed as APK to your team); (b) drop the feature. Document in `DECISIONS.md`; gate in UI with build flavor; privacy policy must describe any capture.
2. **Overlay & screen capture disclosure**: consent screen before first use, persistent notification while active, redaction tool, preview-before-send (see production kit doc 07).
3. **Data export & account deletion** (store requirement): in-app screens S70 + web page.
4. **AI provider keys & prompts**: project context + task text + attachments sent to a third-party provider — explicit consent copy, per-workspace opt-in, key stored server-side (already designed), log scrubbing, cost caps.
5. **Telemetry in bug reports** (device/app/foreground app): disclose, minimize, allow opt-out per field; foreground-app detection needs Usage Access (sensitive) — optional.
6. **Plane licensing/branding**: study only; no copied code/assets/trademarks; verify license terms.
7. **Brand/trademark**: "DoIt" is generic; clear before launch.
8. **Notifications permission** (Android 13+) rationale; battery/OEM guidance for the bubble.
