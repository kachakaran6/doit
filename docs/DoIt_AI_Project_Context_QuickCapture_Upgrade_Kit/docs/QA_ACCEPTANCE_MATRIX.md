# QA Acceptance Matrix

Record each test as PASS, FAIL or NOT TESTED, with build, device/browser and evidence.

| Area | Scenario | Expected result |
|---|---|---|
| Bottom nav | Light theme | Floating pill only; no full-width backplate |
| Bottom nav | Dark theme | Screen background visible outside floating pill |
| Bottom nav | Android gesture area | No clipping or overlap |
| Startup | Normal cold launch | Normal home/auth route |
| Startup | No initial URL | Invitation parser is not activated |
| Deep link | Valid invite URL | Invitation flow opens |
| Deep link | Invalid invite URL | Invite error shown only on invite route |
| Deep link | Restart after invalid invite | Normal app launch |
| Quick Capture | Select project | Correct project is saved |
| Quick Capture | Select labels | Valid labels are associated |
| Quick Capture | Switch project | Incompatible labels are removed/revalidated |
| Preferences | Default project | Applied only in matching workspace |
| Context | Save Markdown | Context persists and is scoped to project |
| Context | Render Markdown | HTML/script injection is sanitized |
| AI key | Save credential | Secret never returned to client |
| AI key | Test invalid key | Safe error, no secret leakage |
| AI key | Remove credential | Provider use disabled |
| Prompt | Task + context | Context-aware prompt generated |
| Prompt | Selected image + vision model | Image is actually analyzed |
| Prompt | Non-vision model | UI states image was not analyzed |
| Prompt | Manual edit + regenerate | User edits are not silently overwritten |
| Prompt | Copy | Exact prompt copied |
| Cross-platform | Generate on mobile | Prompt visible on web |
| Cross-platform | Generate on web | Prompt visible on mobile |
| Regression | Task/Bug/Sticky | Existing flows still work |
| Regression | Screenshot/audio | Existing attachment workflows still work |
| Regression | Invitations | Valid invitations still work |

## Security checks

- Search repository/build artifacts for test secret markers.
- Inspect browser network responses for provider keys.
- Inspect AsyncStorage/localStorage for provider keys.
- Inspect logs and crash reports for tokens.
- Verify cross-workspace and cross-user authorization.
- Verify attachment access checks.
- Verify Markdown sanitization.
- Verify rate limits and size limits.

## Build/test record template

- Commit/branch:
- Backend build:
- Backend tests:
- Mobile typecheck/build:
- Web typecheck/build:
- Android device/model/OS:
- Web browser/version:
- Test date:
- PASS:
- FAIL:
- NOT TESTED:
- Known limitations:
