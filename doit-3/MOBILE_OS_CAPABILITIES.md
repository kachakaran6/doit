# Mobile OS Capabilities and Permission Reality

## Critical principle
Do not request “every permission.” Request only permissions needed for a feature, at the moment the user invokes it, with a clear explanation. Permission access is governed by Android/iOS versions, OEM behavior, app-store policies and OS security. The app cannot promise unrestricted access to other apps' screens or UI.

## Capability matrix
### Reliable baseline
- In-app task capture and text entry.
- User-selected image/file attachment through system picker.
- Microphone recording after explicit user action and permission.
- Speech-to-text when a supported speech service is available.
- Device/OS metadata that the OS makes available without sensitive access.
- Share target/intent handling where configured and tested.
- Local notifications after permission where required.

### Android overlay
A floating button above other apps generally requires special “display over other apps” access and a native Android implementation. OEMs may restrict it, and Play policy review may apply. It must be opt-in, explain why it is needed, provide a disable control and have an in-app fallback. Do not use overlays to deceive users, capture credentials, or obstruct system UI.

### Accessibility service
Do not use AccessibilityService merely as a shortcut to detect other apps or to bypass OS restrictions. It is highly sensitive, requires explicit user enablement and policy-compliant disclosure, and should only be considered if the app has a legitimate accessibility use case. Prefer a normal overlay permission, notification action, Quick Settings tile, app shortcut or share target when those satisfy the use case.

### Screenshots of another app
Android does not provide a universal silent screenshot API for arbitrary other apps. Screen capture should use an explicit user-consented MediaProjection flow where appropriate, with the required foreground service and notification behavior for the target Android version. Capture must be user initiated and visible. For MVP, use system screenshot sharing or the image picker as the reliable fallback.

### Shake gesture
Sensor-based shake detection is feasible in supported states, but background behavior depends on lifecycle, battery restrictions and OEMs. It must not silently start recording or capture. Use cooldown, threshold, user opt-in, and a clear disable switch. If the app is not allowed to run, use a notification/shortcut fallback.

### iOS
iOS generally does not allow arbitrary third-party apps to display persistent floating controls over other apps or silently capture other apps. Do not promise Android-style cross-app overlay behavior on iOS. Provide in-app quick capture, share extension or supported system flows instead.

## Recommended rollout
1. MVP: in-app quick composer, dictation, voice note, system picker, manual screenshot attachment.
2. Validate Android quick capture options on target Android versions/devices.
3. Add one supported mechanism at a time (notification action, shortcut, Quick Settings tile, overlay).
4. Add shake-to-open only if lifecycle and false-trigger testing are acceptable.
5. Implement screenshot capture only through a consent-based supported flow.
6. Document platform/device limitations in settings and help.

## Permission UX requirements
- Ask contextually, not all at onboarding.
- Show rationale before system prompt.
- Provide “Not now” and continue with typed/manual capture.
- Explain how to re-enable in system settings if denied.
- Avoid repeated prompts after denial.
- Do not upload/capture/record before explicit user action.
- Add real-device tests for allow, deny, permanently deny, revoke while app is open and OEM-specific settings.
