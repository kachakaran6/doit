# Release, Migration and Legacy Flow Retirement

## Principle

The new project-context and solution-prompt workflow becomes the canonical experience. “Stop the previous version” means retire duplicate/conflicting UI and code paths safely, not delete historical user data.

## Suggested rollout

### Stage 1 — Inventory
- Locate existing prompt generators, prompt fields, AI settings and old UI.
- Locate project/task/label relations and existing preference storage.
- Record data that needs migration.

### Stage 2 — Additive backend migration
- Add context and prompt metadata structures only if missing.
- Add encrypted credential storage or secret-manager integration.
- Add APIs while preserving old API behavior.
- Add indexes and constraints.
- Keep migration reversible where practical.

### Stage 3 — Backfill
- Copy existing saved prompt content into the canonical prompt model if required.
- Preserve timestamps, authorship and task/project links where known.
- Do not fabricate missing metadata.
- Verify counts and sample records.
- Make backfill idempotent.

### Stage 4 — Client integration
- Deploy compatible backend first.
- Ship mobile and web clients using the new endpoints.
- Keep existing task and attachment flows working.
- Add feature flags only if needed for safe staged rollout.

### Stage 5 — Retire legacy UI
- Route old prompt actions to the new canonical Task Prompt section or remove them after migration.
- Remove duplicate generators and obsolete settings.
- Search all route references, imports and tests before deleting code.
- Do not leave both flows available to users.
- Do not delete saved prompts or project context.

### Stage 6 — Verify and release
- Run full QA matrix.
- Test old client compatibility if older app versions may still be active.
- Confirm backend supports old and new client versions during rollout.
- Document minimum supported client version if an unavoidable breaking change exists.

## Rollback

- Keep database changes additive for the initial release.
- Disable AI generation server-side if provider or security issue occurs; core DoIt must continue working.
- Preserve project context and prompt records during rollback.
- Do not drop new columns/tables during an emergency rollback unless data is safely exported and migration is explicitly planned.
- Restore old UI only if necessary and only if its behavior is safe.
- Rotate compromised provider encryption keys/credentials using a documented procedure.

## Release gates

- Database migration verified on staging.
- Backfill verified.
- Secrets configured in server secret management.
- No provider secret in client bundles or storage.
- Mobile and web builds pass.
- Deep link regression passes.
- Physical Android verification completed or explicitly marked NOT TESTED.
- Rollback plan reviewed.
