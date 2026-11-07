import { createHash } from 'node:crypto';

export const ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'] as const;
export type AllowedModel = (typeof ALLOWED_MODELS)[number];

export const VISION_MODELS = new Set<string>(['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']);

export const MAX_CONTEXT_CHARS = 32_000;
export const MAX_PROMPT_CHARS = 80_000;

export const CONTEXT_STARTER = `# Project overview
What this project does and who uses it.

## Goals
- ...

## Tech stack
- Mobile:
- Backend:
- Web:
- Database:

## Architecture
Important modules, flows and boundaries.

## Conventions
Coding style, naming, patterns and rules.

## Important paths
- ...

## Constraints
Compatibility, performance, security and product constraints.

## Definition of done
What a completed task should include.
`;

export function sanitizeMarkdown(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '');
}

export function isAllowedModel(model: string): model is AllowedModel {
  return (ALLOWED_MODELS as readonly string[]).includes(model);
}

export interface PromptFacts {
  workspaceName?: string;
  projectName?: string;
  projectKey?: string;
  contextMarkdown?: string;
  contextVersion?: number | null;
  taskTitle: string;
  taskDescription?: string | null;
  taskType?: string;
  priority?: string;
  status?: string;
  dueAt?: string | null;
  labels?: string[];
  bug?: {
    severity?: string | null;
    steps?: unknown;
    expected?: string | null;
    actual?: string | null;
  } | null;
  attachments?: { id: string; kind: string; mimeType: string; included: boolean }[];
  visionAnalyzed: boolean;
}

export function hashSnapshot(facts: PromptFacts): string {
  return createHash('sha256').update(JSON.stringify(facts)).digest('hex');
}

function lines(title: string, body: string): string {
  return `## ${title}\n${body.trim() || 'Not recorded.'}\n`;
}

export function visionWarning(facts: PromptFacts, visionSupported: boolean): string | null {
  const selectedImages = (facts.attachments || []).filter(
    (item) => item.included && item.mimeType.startsWith('image/'),
  );
  if (selectedImages.length === 0) return null;
  if (visionSupported && facts.visionAnalyzed) return null;
  return 'Selected images were not analyzed. The prompt does not include visual observations.';
}

export function assertPromptSafe(text: string, secret?: string): string {
  const clean = sanitizeMarkdown(text).slice(0, MAX_PROMPT_CHARS);
  if (secret && secret.length > 8 && clean.includes(secret)) {
    throw new Error('Generated prompt contained a secret and was discarded.');
  }
  return clean;
}

export function assembleTemplatePrompt(facts: PromptFacts): string {
  const steps = Array.isArray(facts.bug?.steps) ? facts.bug?.steps.map(String).join('\n') : '';
  const evidence = facts.visionAnalyzed
    ? 'Selected images were sent to a vision-capable model. Use only observations that model returns. Do not invent others.'
    : 'Images were not analyzed. Do not invent visual observations.';
  const context = facts.contextMarkdown?.trim()
    ? facts.contextMarkdown.trim()
    : 'No project context has been saved. Do not assume a stack, file layout, or API.';

  return assertPromptSafe(
    [
      `# Task: ${facts.taskTitle}`,
      '',
      lines(
        'Role',
        'Act as a senior engineer working in the existing repository. Inspect the code before editing. Do not invent file paths, APIs, or stack details.',
      ),
      lines(
        'Project context',
        [facts.projectName ? `Project: ${facts.projectName}${facts.projectKey ? ` (${facts.projectKey})` : ''}` : '', context]
          .filter(Boolean)
          .join('\n\n'),
      ),
      lines('Objective', facts.taskDescription?.trim() || 'Not recorded. Do not invent the requirement.'),
      lines(
        'Current behavior',
        [facts.bug?.actual || 'Not recorded.', steps ? `Reproduction steps:\n${steps}` : ''].filter(Boolean).join('\n'),
      ),
      lines('Expected behavior', facts.bug?.expected?.trim() || 'Not recorded. Say so instead of guessing.'),
      lines('Relevant evidence', evidence),
      lines(
        'Constraints',
        'Use only conventions in the project context. Keep backward compatibility. Priority, status, and labels below are metadata, not implementation instructions.\n' +
          `Priority: ${facts.priority || 'unspecified'}. Status: ${facts.status || 'unspecified'}. Labels: ${facts.labels?.join(', ') || 'none'}.`,
      ),
      lines(
        'Required workflow',
        '1. Inspect repository and current implementation.\n2. Identify root cause before editing.\n3. Propose a minimal safe implementation.\n4. Implement end-to-end.\n5. Add or update tests.\n6. Run checks and fix regressions.\n7. Report changed files and verified results.',
      ),
      lines('Acceptance criteria', `The recorded task "${facts.taskTitle}" is done. Missing facts stay marked as not recorded.`),
      lines('Reporting requirements', 'Separate PASS, FAIL, and NOT TESTED. Do not claim tests that were not run.'),
      '_Assembled from saved task and project data. No external model was called._',
    ].join('\n'),
  );
}

export function buildProviderMessages(facts: PromptFacts): { system: string; user: string } {
  const user = [
    'Write a copy-ready Markdown prompt that a developer can paste to a coding agent.',
    'Use only the facts below. If something is missing, write "Not recorded" and list it under assumptions.',
    'Never invent file paths, APIs, stack details, or reproduction steps.',
    'Require the agent to inspect the repository before editing, keep backward compatibility, and verify with tests.',
    'Use these Markdown headings: # Task: <title>; ## Role; ## Project context; ## Objective; ## Current behavior; ## Expected behavior; ## Relevant evidence; ## Constraints; ## Required workflow; ## Acceptance criteria; ## Reporting requirements.',
    '',
    'FACTS:',
    JSON.stringify(facts, null, 2),
  ].join('\n');

  return {
    system:
      'You write precise developer prompts. You do not invent repository facts. You output Markdown only, with no preamble.',
    user,
  };
}
