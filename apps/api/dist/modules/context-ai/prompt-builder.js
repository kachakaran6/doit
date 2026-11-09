"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTEXT_STARTER = exports.MAX_PROMPT_CHARS = exports.MAX_CONTEXT_CHARS = exports.VISION_MODELS = exports.ALLOWED_MODELS = exports.OPENROUTER_MODELS = exports.OPENAI_MODELS = void 0;
exports.sanitizeMarkdown = sanitizeMarkdown;
exports.isAllowedModel = isAllowedModel;
exports.hashSnapshot = hashSnapshot;
exports.visionWarning = visionWarning;
exports.assertPromptSafe = assertPromptSafe;
exports.assembleTemplatePrompt = assembleTemplatePrompt;
exports.buildProviderMessages = buildProviderMessages;
const node_crypto_1 = require("node:crypto");
exports.OPENAI_MODELS = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1',
];
exports.OPENROUTER_MODELS = [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-r1',
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-pro-1.5',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'qwen/qwen-2.5-coder-32b-instruct',
];
exports.ALLOWED_MODELS = [
    ...exports.OPENAI_MODELS,
    ...exports.OPENROUTER_MODELS,
];
exports.VISION_MODELS = new Set([
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-pro-1.5',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
]);
exports.MAX_CONTEXT_CHARS = 32_000;
exports.MAX_PROMPT_CHARS = 80_000;
exports.CONTEXT_STARTER = `# Project overview
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
function sanitizeMarkdown(input) {
    return input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/<\/?[a-z][^>]*>/gi, '');
}
function isAllowedModel(model, provider) {
    if (provider === 'OPENROUTER' || model.includes('/')) {
        return Boolean(model && model.trim().length > 0);
    }
    return exports.ALLOWED_MODELS.includes(model);
}
function hashSnapshot(facts) {
    return (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(facts)).digest('hex');
}
function lines(title, body) {
    return `## ${title}\n${body.trim() || 'Not recorded.'}\n`;
}
function visionWarning(facts, visionSupported) {
    const selectedImages = (facts.attachments || []).filter((item) => item.included && item.mimeType.startsWith('image/'));
    if (selectedImages.length === 0)
        return null;
    if (visionSupported && facts.visionAnalyzed)
        return null;
    return 'Selected images were not analyzed. The prompt does not include visual observations.';
}
function assertPromptSafe(text, secret) {
    const clean = sanitizeMarkdown(text).slice(0, exports.MAX_PROMPT_CHARS);
    if (secret && secret.length > 8 && clean.includes(secret)) {
        throw new Error('Generated prompt contained a secret and was discarded.');
    }
    return clean;
}
function assembleTemplatePrompt(facts) {
    const steps = Array.isArray(facts.bug?.steps) ? facts.bug?.steps.map(String).join('\n') : '';
    const evidence = facts.visionAnalyzed
        ? 'Selected images were sent to a vision-capable model. Use only observations that model returns. Do not invent others.'
        : 'Images were not analyzed. Do not invent visual observations.';
    const context = facts.contextMarkdown?.trim()
        ? facts.contextMarkdown.trim()
        : 'No project context has been saved. Do not assume a stack, file layout, or API.';
    return assertPromptSafe([
        `# Task: ${facts.taskTitle}`,
        '',
        lines('Role', 'Act as a senior engineer working in the existing repository. Inspect the code before editing. Do not invent file paths, APIs, or stack details.'),
        lines('Project context', [facts.projectName ? `Project: ${facts.projectName}${facts.projectKey ? ` (${facts.projectKey})` : ''}` : '', context]
            .filter(Boolean)
            .join('\n\n')),
        lines('Objective', facts.taskDescription?.trim() || 'Not recorded. Do not invent the requirement.'),
        lines('Current behavior', [facts.bug?.actual || 'Not recorded.', steps ? `Reproduction steps:\n${steps}` : ''].filter(Boolean).join('\n')),
        lines('Expected behavior', facts.bug?.expected?.trim() || 'Not recorded. Say so instead of guessing.'),
        lines('Relevant evidence', evidence),
        lines('Constraints', 'Use only conventions in the project context. Keep backward compatibility. Priority, status, and labels below are metadata, not implementation instructions.\n' +
            `Priority: ${facts.priority || 'unspecified'}. Status: ${facts.status || 'unspecified'}. Labels: ${facts.labels?.join(', ') || 'none'}.`),
        lines('Required workflow', '1. Inspect repository and current implementation.\n2. Identify root cause before editing.\n3. Propose a minimal safe implementation.\n4. Implement end-to-end.\n5. Add or update tests.\n6. Run checks and fix regressions.\n7. Report changed files and verified results.'),
        lines('Acceptance criteria', `The recorded task "${facts.taskTitle}" is done. Missing facts stay marked as not recorded.`),
        lines('Reporting requirements', 'Separate PASS, FAIL, and NOT TESTED. Do not claim tests that were not run.'),
        '_Assembled from saved task and project data. No external model was called._',
    ].join('\n'));
}
function buildProviderMessages(facts) {
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
        system: 'You write precise developer prompts. You do not invent repository facts. You output Markdown only, with no preamble.',
        user,
    };
}
//# sourceMappingURL=prompt-builder.js.map