# AI Solution Prompt Generation Specification

## Purpose

Generate a high-quality, copy/paste-ready prompt for a coding agent from a DoIt task or bug and its project context.

## Source precedence

1. Explicit task/bug fields.
2. Project context maintained by project members.
3. Selected attachments actually analyzed.
4. Other authorized metadata only when useful.

Do not infer missing requirements as facts.

## Prompt output structure

```md
# Task: <title>

## Role
Act as a senior engineer working in the existing repository.

## Project context
<relevant project context, summarized faithfully>

## Objective
<what needs to be achieved>

## Current behavior
<facts from task/bug>

## Expected behavior
<facts; state if unspecified>

## Relevant evidence
<observations from selected images only if vision analysis ran>

## Constraints
<architecture, compatibility, security and project conventions>

## Required workflow
1. Inspect repository and current implementation.
2. Identify root cause before editing.
3. Propose a minimal safe implementation.
4. Implement end-to-end.
5. Add/update tests.
6. Run checks and fix regressions.
7. Report changed files and verified results.

## Acceptance criteria
<testable criteria>

## Reporting requirements
Separate PASS, FAIL and NOT TESTED. Do not claim tests that were not run.
```

## Image behavior

- User chooses which images are sent.
- Backend validates each attachment and access rights.
- Vision-capable provider: include image content for analysis.
- Non-vision provider: do not claim image analysis; show a clear warning.
- Keep original attachment linked to the task.
- Avoid sending unrelated files or attachments.

## Generation controls

- Explicit user action.
- Preview before save/copy.
- Regenerate.
- Manual editing.
- Confirm before overwriting manual edits.
- Save history/version metadata where feasible.
- Copy-to-clipboard feedback.
- Display provider/model and generation time, never credential.

## Quality checks

Before saving, verify generated content:
- Contains no secret values.
- Does not invent file paths, APIs or stack.
- Identifies unknown information.
- Includes repository inspection and regression testing.
- Is valid Markdown and copy-ready.
- Is bounded to configured output size.
