# QA and Security Review Prompt

Review Samyukt Pulse against the complete specification. Do not merely inspect whether screens render.

Check:
- Auth, refresh rotation, logout, expired/revoked sessions.
- Workspace/project authorization on every API route.
- Cross-workspace data and attachment isolation.
- DTO validation, error consistency, rate limiting and upload limits.
- Light/dark mode and all five accent palettes.
- Keyboard focus, multiline input, Android back behavior and small screens.
- Loading, empty, offline/error, retry and permission-denied states.
- Draft preservation and upload retry.
- Microphone/speech denial and missing-service fallback.
- Screenshot consent, overlay disclosure, accessibility-service avoidance and no silent capture.
- Screen-reader labels, touch targets, contrast and text scaling.
- Dependency health, secret scanning, `.env.example`, migration safety and logs redaction.

Return findings by severity: Critical, High, Medium, Low. Include exact file/route, reproduction steps, expected/actual result, and a proposed fix. Fix critical/high findings before sign-off. Never claim a test passed unless it was actually run.
