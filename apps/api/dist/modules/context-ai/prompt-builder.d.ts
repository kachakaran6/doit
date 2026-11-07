export declare const ALLOWED_MODELS: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"];
export type AllowedModel = (typeof ALLOWED_MODELS)[number];
export declare const VISION_MODELS: Set<string>;
export declare const MAX_CONTEXT_CHARS = 32000;
export declare const MAX_PROMPT_CHARS = 80000;
export declare const CONTEXT_STARTER = "# Project overview\nWhat this project does and who uses it.\n\n## Goals\n- ...\n\n## Tech stack\n- Mobile:\n- Backend:\n- Web:\n- Database:\n\n## Architecture\nImportant modules, flows and boundaries.\n\n## Conventions\nCoding style, naming, patterns and rules.\n\n## Important paths\n- ...\n\n## Constraints\nCompatibility, performance, security and product constraints.\n\n## Definition of done\nWhat a completed task should include.\n";
export declare function sanitizeMarkdown(input: string): string;
export declare function isAllowedModel(model: string): model is AllowedModel;
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
    attachments?: {
        id: string;
        kind: string;
        mimeType: string;
        included: boolean;
    }[];
    visionAnalyzed: boolean;
}
export declare function hashSnapshot(facts: PromptFacts): string;
export declare function visionWarning(facts: PromptFacts, visionSupported: boolean): string | null;
export declare function assertPromptSafe(text: string, secret?: string): string;
export declare function assembleTemplatePrompt(facts: PromptFacts): string;
export declare function buildProviderMessages(facts: PromptFacts): {
    system: string;
    user: string;
};
