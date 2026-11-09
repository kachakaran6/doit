import { z } from 'zod';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { ContextAiService } from './context-ai.service';
declare const ContextSchema: z.ZodObject<{
    markdown: z.ZodString;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    markdown: string;
    version?: number | undefined;
}, {
    markdown: string;
    version?: number | undefined;
}>;
declare const PrefsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    defaultProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    defaultLabelIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rememberLastProject: z.ZodOptional<z.ZodBoolean>;
    showProjectSelector: z.ZodOptional<z.ZodBoolean>;
    labelsExpanded: z.ZodOptional<z.ZodBoolean>;
    lastProjectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
    defaultProjectId?: string | null | undefined;
    defaultLabelIds?: string[] | undefined;
    rememberLastProject?: boolean | undefined;
    showProjectSelector?: boolean | undefined;
    labelsExpanded?: boolean | undefined;
    lastProjectId?: string | null | undefined;
}, {
    workspaceId: string;
    defaultProjectId?: string | null | undefined;
    defaultLabelIds?: string[] | undefined;
    rememberLastProject?: boolean | undefined;
    showProjectSelector?: boolean | undefined;
    labelsExpanded?: boolean | undefined;
    lastProjectId?: string | null | undefined;
}>;
declare const CredentialSchema: z.ZodObject<{
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodString;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    model: string;
    enabled?: boolean | undefined;
    apiKey?: string | undefined;
}, {
    model: string;
    enabled?: boolean | undefined;
    apiKey?: string | undefined;
}>;
declare const GenerateSchema: z.ZodObject<{
    selectedAttachmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    force: z.ZodOptional<z.ZodBoolean>;
    useTemplate: z.ZodOptional<z.ZodBoolean>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selectedAttachmentIds?: string[] | undefined;
    force?: boolean | undefined;
    useTemplate?: boolean | undefined;
    idempotencyKey?: string | undefined;
}, {
    selectedAttachmentIds?: string[] | undefined;
    force?: boolean | undefined;
    useTemplate?: boolean | undefined;
    idempotencyKey?: string | undefined;
}>;
declare const UpdatePromptSchema: z.ZodObject<{
    promptMarkdown: z.ZodString;
}, "strip", z.ZodTypeAny, {
    promptMarkdown: string;
}, {
    promptMarkdown: string;
}>;
export declare class ContextAiController {
    private readonly service;
    constructor(service: ContextAiService);
    getContext(user: AuthUserPayload, projectId: string): Promise<{
        projectId: string;
        projectName: string;
        markdown: string;
        version: number;
        updatedAt: Date | null;
        updatedBy: {
            id: string;
            name: string;
        } | null;
        maxChars: number;
        starter: string;
    }>;
    putContext(user: AuthUserPayload, projectId: string, body: z.infer<typeof ContextSchema>): Promise<{
        projectId: string;
        markdown: string;
        version: number;
        updatedAt: Date;
        updatedBy: {
            id: string;
            name: string;
        } | null;
    }>;
    getPrefs(user: AuthUserPayload, workspaceId: string): Promise<{
        workspaceId: string;
        defaultProjectId: string | null;
        defaultLabelIds: string[];
        rememberLastProject: boolean;
        showProjectSelector: boolean;
        labelsExpanded: boolean;
        lastProjectId: string | null;
    }>;
    putPrefs(user: AuthUserPayload, body: z.infer<typeof PrefsSchema>): Promise<{
        workspaceId: string;
        defaultProjectId: string | null;
        defaultLabelIds: string[];
        rememberLastProject: boolean;
        showProjectSelector: boolean;
        labelsExpanded: boolean;
        lastProjectId: string | null;
    }>;
    listProviders(user: AuthUserPayload): Promise<{
        credentials: {
            provider: string;
            model: string;
            keyHint: string;
            enabled: boolean;
            lastTestedAt: Date | null;
            status: string;
            updatedAt: Date;
            allowedModels: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"] | readonly ["anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-haiku", "deepseek/deepseek-chat", "deepseek/deepseek-r1", "google/gemini-2.0-flash-exp:free", "google/gemini-pro-1.5", "meta-llama/llama-3.3-70b-instruct", "openai/gpt-4o", "openai/gpt-4o-mini", "qwen/qwen-2.5-coder-32b-instruct"];
        }[];
        allowedModels: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1", "anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-haiku", "deepseek/deepseek-chat", "deepseek/deepseek-r1", "google/gemini-2.0-flash-exp:free", "google/gemini-pro-1.5", "meta-llama/llama-3.3-70b-instruct", "openai/gpt-4o", "openai/gpt-4o-mini", "qwen/qwen-2.5-coder-32b-instruct"];
        openAiModels: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"];
        openRouterModels: readonly ["anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-haiku", "deepseek/deepseek-chat", "deepseek/deepseek-r1", "google/gemini-2.0-flash-exp:free", "google/gemini-pro-1.5", "meta-llama/llama-3.3-70b-instruct", "openai/gpt-4o", "openai/gpt-4o-mini", "qwen/qwen-2.5-coder-32b-instruct"];
        notice: string;
    }>;
    saveProvider(user: AuthUserPayload, provider: string, body: z.infer<typeof CredentialSchema>): Promise<{
        provider: string;
        model: string;
        keyHint: string;
        enabled: boolean;
        lastTestedAt: Date | null;
        status: string;
        updatedAt: Date;
        allowedModels: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"] | readonly ["anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-haiku", "deepseek/deepseek-chat", "deepseek/deepseek-r1", "google/gemini-2.0-flash-exp:free", "google/gemini-pro-1.5", "meta-llama/llama-3.3-70b-instruct", "openai/gpt-4o", "openai/gpt-4o-mini", "qwen/qwen-2.5-coder-32b-instruct"];
    }>;
    testProvider(user: AuthUserPayload, provider: string): Promise<{
        ok: boolean;
        status: string;
        lastTestedAt: string;
    }>;
    deleteProvider(user: AuthUserPayload, provider: string): Promise<{
        deleted: boolean;
    }>;
    listPrompts(user: AuthUserPayload, taskId: string): Promise<{
        prompts: {
            id: string;
            taskId: string;
            projectId: string;
            promptMarkdown: string;
            generationStatus: string;
            provider: string | null;
            model: string | null;
            sourceSnapshotHash: string | null;
            sourceContextVersion: number | null;
            selectedAttachmentIds: string[];
            isUserEdited: boolean;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    generate(user: AuthUserPayload, taskId: string, body: z.infer<typeof GenerateSchema>): Promise<unknown>;
    updatePrompt(user: AuthUserPayload, promptId: string, body: z.infer<typeof UpdatePromptSchema>): Promise<{
        id: string;
        taskId: string;
        projectId: string;
        promptMarkdown: string;
        generationStatus: string;
        provider: string | null;
        model: string | null;
        sourceSnapshotHash: string | null;
        sourceContextVersion: number | null;
        selectedAttachmentIds: string[];
        isUserEdited: boolean;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    regenerate(user: AuthUserPayload, promptId: string, body: z.infer<typeof GenerateSchema>): Promise<unknown>;
}
export {};
