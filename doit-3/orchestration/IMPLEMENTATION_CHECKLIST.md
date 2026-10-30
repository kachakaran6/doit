# Implementation Checklist

## Planning gate
- [ ] Read all kit documents.
- [ ] Inspect repository and existing conventions.
- [ ] Decide Expo development build vs bare React Native using a feasibility spike.
- [ ] Select ORM and object storage provider; record ADRs.
- [ ] Produce architecture diagram, phased plan and risk register.
- [ ] Confirm MVP boundaries and Android-only experimental features.

## Foundation
- [ ] Strict TypeScript, lint, formatter, environment validation.
- [ ] NestJS API and PostgreSQL migrations.
- [ ] OpenAPI and consistent error handling.
- [ ] Mobile shell, typed navigation, API client.
- [ ] Design tokens, three modes, five accent palettes.
- [ ] CI checks.

## Core features
- [ ] Auth/session and logout/revocation.
- [ ] Workspace and membership roles.
- [ ] Projects and tasks/todos.
- [ ] Status, priority, labels, due date and assignment.
- [ ] Comments/activity.
- [ ] Sticky notes and convert-to-task.
- [ ] Search/filter.
- [ ] Authorization tests.

## Capture
- [ ] Shared quick composer.
- [ ] Draft recovery and typed input fallback.
- [ ] Editable speech-to-text.
- [ ] Explicit user-started voice recording.
- [ ] Image picker, preview, upload and retry.
- [ ] Bug-report template and optional QA context.
- [ ] Consent-based screenshot path if feasible.

## Experimental Android access
- [ ] Compare shortcut, notification action, Quick Settings tile and overlay.
- [ ] Permission rationale and explicit opt-in.
- [ ] No AccessibilityService misuse.
- [ ] Shake threshold/cooldown and no automatic capture.
- [ ] Real-device/OEM tests.
- [ ] Manual fallback always available.
- [ ] Document Android/iOS limitations.

## Release quality
- [ ] Cross-workspace access tests pass.
- [ ] Attachment validation and private storage verified.
- [ ] Light/dark/accent consistency review.
- [ ] Accessibility and keyboard audit.
- [ ] Permission-denial audit.
- [ ] Backup/restore and migration strategy.
- [ ] No secrets in Git/client bundle.
- [ ] Privacy disclosures prepared.
- [ ] Internal pilot feedback addressed.
