# React Native Agent Prompt

Build the Samyukt Pulse mobile app using React Native + TypeScript, following `ARCHITECTURE.md`, `UI_DESIGN_SYSTEM.md`, `FEATURE_SPEC.md` and `MOBILE_OS_CAPABILITIES.md`.

Implement in this order:
1. App shell, typed navigation, providers, API client and auth.
2. Design tokens, system/light/dark mode and five accents.
3. Workspace/project selection and primary navigation.
4. Task list/detail/create/edit and global quick composer.
5. Sticky notes and convert-to-task.
6. Comments, labels, due date, attachments and bug template.
7. Editable speech-to-text and optional voice recording.
8. QA quick-access experiments only after native feasibility validation.

Requirements:
- Reuse one composer and common API/query conventions.
- Preserve drafts and typed text if permissions or speech recognition fail.
- Keep keyboard behavior correct on small devices.
- Do not use Flutter packages in React Native.
- Avoid hard-coded colors and feature-specific UI kits.
- Every screen includes appropriate loading/error/empty states.
- Respect safe areas, screen readers and text scaling.
- Never silently record audio or capture another app's screen.
- Document native module choices and platform limitations.

Do not begin with an overlay. First deliver a stable in-app capture workflow. Test on a real Android device before claiming native capability support.
