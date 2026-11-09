import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
export declare class ContextAiService {
    private readonly prisma;
    private readonly storage;
    private readonly logger;
    constructor(prisma: PrismaService, storage: StorageService);
    private membership;
    private projectForUser;
    private taskForUser;
    getContext(userId: string, projectId: string): Promise<{
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
    putContext(userId: string, projectId: string, markdown: string, expectedVersion?: number): Promise<{
        projectId: string;
        markdown: string;
        version: number;
        updatedAt: Date;
        updatedBy: {
            id: string;
            name: string;
        } | null;
    }>;
    getCapturePrefs(userId: string, workspaceId: string): Promise<{
        workspaceId: string;
        defaultProjectId: string | null;
        defaultLabelIds: string[];
        rememberLastProject: boolean;
        showProjectSelector: boolean;
        labelsExpanded: boolean;
        lastProjectId: string | null;
    }>;
    putCapturePrefs(userId: string, body: {
        workspaceId: string;
        defaultProjectId?: string | null;
        defaultLabelIds?: string[];
        rememberLastProject?: boolean;
        showProjectSelector?: boolean;
        labelsExpanded?: boolean;
        lastProjectId?: string | null;
    }): Promise<{
        workspaceId: string;
        defaultProjectId: string | null;
        defaultLabelIds: string[];
        rememberLastProject: boolean;
        showProjectSelector: boolean;
        labelsExpanded: boolean;
        lastProjectId: string | null;
    }>;
    listCredentials(userId: string): Promise<{
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
    saveCredential(userId: string, provider: string, body: {
        apiKey?: string;
        model: string;
        enabled?: boolean;
    }): Promise<{
        provider: string;
        model: string;
        keyHint: string;
        enabled: boolean;
        lastTestedAt: Date | null;
        status: string;
        updatedAt: Date;
        allowedModels: readonly ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"] | readonly ["anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-haiku", "deepseek/deepseek-chat", "deepseek/deepseek-r1", "google/gemini-2.0-flash-exp:free", "google/gemini-pro-1.5", "meta-llama/llama-3.3-70b-instruct", "openai/gpt-4o", "openai/gpt-4o-mini", "qwen/qwen-2.5-coder-32b-instruct"];
    }>;
    deleteCredential(userId: string, provider: string): Promise<{
        deleted: boolean;
    }>;
    testCredential(userId: string, provider: string): Promise<{
        ok: boolean;
        status: string;
        lastTestedAt: string;
    }>;
    private toPublicPrompt;
    listPrompts(userId: string, taskId: string): Promise<{
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
    regenerate(userId: string, promptId: string, body: {
        selectedAttachmentIds?: string[];
        force?: boolean;
        useTemplate?: boolean;
        idempotencyKey?: string;
    }): Promise<unknown>;
    updatePrompt(userId: string, promptId: string, markdown: string): Promise<{
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
    generate(userId: string, taskId: string, body: {
        selectedAttachmentIds?: string[];
        force?: boolean;
        useTemplate?: boolean;
        idempotencyKey?: string;
    }): Promise<unknown>;
}
