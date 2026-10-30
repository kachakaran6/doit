# Prompt for Adding Any Future Feature

Implement the requested feature: **[FEATURE NAME]**.

Before coding:
1. Read `ARCHITECTURE.md`, `UI_DESIGN_SYSTEM.md`, `FEATURE_SPEC.md` and the relevant feature modules.
2. Identify the existing patterns to reuse and list the files/modules that will change.
3. State data model/API changes, permission requirements and acceptance criteria.
4. Check whether a shared component already solves part of the problem.

Implementation rules:
- Follow the feature-first folder convention.
- Reuse shared design tokens, components, API client, query keys, error handling and navigation.
- No hard-coded colors, duplicated API clients or cross-feature deep imports.
- Add loading/error/empty/success states and preserve accessibility/keyboard behavior.
- Enforce authorization in the backend, not just the UI.
- Add/update tests, API docs, migrations and user documentation as required.
- Request only necessary permissions and provide denial fallbacks.
- Run relevant checks and report actual results and known limitations.

Do not refactor unrelated areas. If an architecture change is necessary, write an ADR first.
