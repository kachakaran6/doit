"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContextAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const storage_service_1 = require("../../infra/storage/storage.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
const ai_crypto_1 = require("./ai-crypto");
const prompt_builder_1 = require("./prompt-builder");
const generateHits = new Map();
const testHits = new Map();
const generationIdempotency = new Map();
function hit(bucket, userId, limit, windowMs) {
    const now = Date.now();
    const recent = (bucket.get(userId) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
        throw new app_error_1.AppError(error_code_enum_1.ErrorCode.RATE_LIMITED, 'Too many AI requests. Try again shortly.', 429);
    }
    recent.push(now);
    bucket.set(userId, recent);
}
function publicCredential(row) {
    return {
        provider: row.provider.toLowerCase(),
        model: row.model,
        keyHint: row.keyHint,
        enabled: row.enabled,
        lastTestedAt: row.lastTestedAt,
        status: row.status,
        updatedAt: row.updatedAt,
        allowedModels: row.provider === 'OPENROUTER' ? prompt_builder_1.OPENROUTER_MODELS : prompt_builder_1.OPENAI_MODELS,
    };
}
let ContextAiService = ContextAiService_1 = class ContextAiService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
        this.logger = new common_1.Logger(ContextAiService_1.name);
    }
    async membership(userId, workspaceId) {
        const member = await this.prisma.membership.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
        });
        if (!member) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_WORKSPACE_MEMBER, 'You are not a member of this workspace.', 403);
        }
        return member;
    }
    async projectForUser(userId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { workspace: { select: { id: true, name: true } } },
        });
        if (!project)
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
        await this.membership(userId, project.workspaceId);
        return project;
    }
    async taskForUser(userId, taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { include: { workspace: { select: { id: true, name: true } }, context: true } },
                labels: { include: { label: true } },
                bug: true,
                attachments: true,
            },
        });
        if (!task || task.deletedAt)
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        await this.membership(userId, task.project.workspaceId);
        return task;
    }
    async getContext(userId, projectId) {
        const project = await this.projectForUser(userId, projectId);
        const row = await this.prisma.projectContext.findUnique({
            where: { projectId },
            include: { updatedBy: { select: { id: true, name: true } } },
        });
        return {
            projectId,
            projectName: project.name,
            markdown: row?.markdown ?? '',
            version: row?.version ?? 0,
            updatedAt: row?.updatedAt ?? null,
            updatedBy: row?.updatedBy ?? null,
            maxChars: Number(process.env.AI_CONTEXT_MAX_CHARS || prompt_builder_1.MAX_CONTEXT_CHARS),
            starter: prompt_builder_1.CONTEXT_STARTER,
        };
    }
    async putContext(userId, projectId, markdown, expectedVersion) {
        const max = Number(process.env.AI_CONTEXT_MAX_CHARS || prompt_builder_1.MAX_CONTEXT_CHARS);
        if (markdown.length > max) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PAYLOAD_TOO_LARGE, `Project context is limited to ${max} characters.`, 413);
        }
        await this.projectForUser(userId, projectId);
        const clean = (0, prompt_builder_1.sanitizeMarkdown)(markdown);
        const existing = await this.prisma.projectContext.findUnique({ where: { projectId } });
        if (expectedVersion != null && (existing?.version ?? 0) !== expectedVersion) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STALE_WRITE, 'Project context was updated by someone else. Reload and try again.', 409);
        }
        const saved = await this.prisma.projectContext.upsert({
            where: { projectId },
            create: { projectId, markdown: clean, version: 1, updatedByUserId: userId },
            update: { markdown: clean, version: { increment: 1 }, updatedByUserId: userId },
            include: { updatedBy: { select: { id: true, name: true } } },
        });
        return {
            projectId,
            markdown: saved.markdown,
            version: saved.version,
            updatedAt: saved.updatedAt,
            updatedBy: saved.updatedBy,
        };
    }
    async getCapturePrefs(userId, workspaceId) {
        if (!workspaceId) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'workspaceId is required.', 400);
        }
        await this.membership(userId, workspaceId);
        const row = await this.prisma.quickCapturePreference.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
        const projects = await this.prisma.project.findMany({
            where: { workspaceId, archivedAt: null },
            select: { id: true },
        });
        const ids = new Set(projects.map((p) => p.id));
        const defaultProjectId = row?.defaultProjectId && ids.has(row.defaultProjectId) ? row.defaultProjectId : null;
        const lastProjectId = row?.lastProjectId && ids.has(row.lastProjectId) ? row.lastProjectId : null;
        const labels = await this.prisma.label.findMany({
            where: { workspaceId, id: { in: row?.defaultLabelIds ?? [] } },
            select: { id: true },
        });
        return {
            workspaceId,
            defaultProjectId,
            defaultLabelIds: labels.map((l) => l.id),
            rememberLastProject: row?.rememberLastProject ?? true,
            showProjectSelector: row?.showProjectSelector ?? true,
            labelsExpanded: row?.labelsExpanded ?? false,
            lastProjectId,
        };
    }
    async putCapturePrefs(userId, body) {
        await this.membership(userId, body.workspaceId);
        if (body.defaultProjectId) {
            const project = await this.prisma.project.findFirst({
                where: { id: body.defaultProjectId, workspaceId: body.workspaceId, archivedAt: null },
            });
            if (!project) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Default project is not in this workspace.', 400);
            }
        }
        const labelIds = body.defaultLabelIds ?? [];
        if (labelIds.length) {
            const found = await this.prisma.label.count({
                where: { workspaceId: body.workspaceId, id: { in: labelIds } },
            });
            if (found !== labelIds.length) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.LABEL_NOT_FOUND, 'A default label is not in this workspace.', 400);
            }
        }
        const saved = await this.prisma.quickCapturePreference.upsert({
            where: { userId_workspaceId: { userId, workspaceId: body.workspaceId } },
            create: {
                userId,
                workspaceId: body.workspaceId,
                defaultProjectId: body.defaultProjectId ?? null,
                defaultLabelIds: labelIds,
                rememberLastProject: body.rememberLastProject ?? true,
                showProjectSelector: body.showProjectSelector ?? true,
                labelsExpanded: body.labelsExpanded ?? false,
                lastProjectId: body.lastProjectId ?? null,
            },
            update: {
                ...(body.defaultProjectId !== undefined ? { defaultProjectId: body.defaultProjectId } : {}),
                ...(body.defaultLabelIds !== undefined ? { defaultLabelIds: labelIds } : {}),
                ...(body.rememberLastProject !== undefined ? { rememberLastProject: body.rememberLastProject } : {}),
                ...(body.showProjectSelector !== undefined ? { showProjectSelector: body.showProjectSelector } : {}),
                ...(body.labelsExpanded !== undefined ? { labelsExpanded: body.labelsExpanded } : {}),
                ...(body.lastProjectId !== undefined ? { lastProjectId: body.lastProjectId } : {}),
            },
        });
        return this.getCapturePrefs(userId, saved.workspaceId);
    }
    async listCredentials(userId) {
        const rows = await this.prisma.aiProviderCredential.findMany({
            where: { ownerUserId: userId },
            select: {
                provider: true,
                model: true,
                keyHint: true,
                enabled: true,
                lastTestedAt: true,
                status: true,
                updatedAt: true,
            },
        });
        return {
            credentials: rows.map(publicCredential),
            allowedModels: prompt_builder_1.ALLOWED_MODELS,
            openAiModels: prompt_builder_1.OPENAI_MODELS,
            openRouterModels: prompt_builder_1.OPENROUTER_MODELS,
            notice: 'Provider usage may incur charges. Project context, task text, and selected attachments are sent to OpenRouter or OpenAI only when you generate a prompt. Keys stay encrypted on the server and are not returned after saving.',
        };
    }
    async saveCredential(userId, provider, body) {
        const provKey = provider.toUpperCase();
        if (provKey !== 'OPENAI' && provKey !== 'OPENROUTER') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Supported providers: openrouter, openai.', 400);
        }
        const provEnum = provKey;
        if (!(0, prompt_builder_1.isAllowedModel)(body.model, provEnum)) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'That model is not supported.', 400);
        }
        const existing = await this.prisma.aiProviderCredential.findUnique({
            where: { ownerUserId_provider: { ownerUserId: userId, provider: provEnum } },
        });
        let encrypted = existing?.encryptedSecret;
        let hint = existing?.keyHint;
        if (body.apiKey?.trim()) {
            try {
                (0, ai_crypto_1.assertAiKeyConfigured)();
                encrypted = (0, ai_crypto_1.encryptAiSecret)(body.apiKey.trim());
            }
            catch {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Set AI_CREDENTIALS_KEY on the server before saving a provider key.', 400);
            }
            hint = (0, ai_crypto_1.keyHint)(body.apiKey.trim());
        }
        if (!encrypted || !hint) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'An API key is required the first time you save a provider.', 400);
        }
        const saved = await this.prisma.aiProviderCredential.upsert({
            where: { ownerUserId_provider: { ownerUserId: userId, provider: provEnum } },
            create: {
                ownerUserId: userId,
                provider: provEnum,
                model: body.model,
                encryptedSecret: encrypted,
                encryptionKeyVersion: (0, ai_crypto_1.aiKeyVersion)(),
                keyHint: hint,
                enabled: body.enabled ?? true,
                status: 'UNTESTED',
            },
            update: {
                model: body.model,
                encryptedSecret: encrypted,
                encryptionKeyVersion: (0, ai_crypto_1.aiKeyVersion)(),
                keyHint: hint,
                enabled: body.enabled ?? existing?.enabled ?? true,
                status: body.apiKey?.trim() ? 'UNTESTED' : existing?.status ?? 'UNTESTED',
            },
        });
        return publicCredential(saved);
    }
    async deleteCredential(userId, provider) {
        const provKey = provider.toUpperCase();
        if (provKey !== 'OPENAI' && provKey !== 'OPENROUTER') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Provider not found.', 404);
        }
        const provEnum = provKey;
        await this.prisma.aiProviderCredential.deleteMany({
            where: { ownerUserId: userId, provider: provEnum },
        });
        return { deleted: true };
    }
    async testCredential(userId, provider) {
        hit(testHits, userId, 5, 10 * 60 * 1000);
        const provKey = provider.toUpperCase();
        if (provKey !== 'OPENAI' && provKey !== 'OPENROUTER') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Provider not found.', 404);
        }
        const provEnum = provKey;
        const row = await this.prisma.aiProviderCredential.findUnique({
            where: { ownerUserId_provider: { ownerUserId: userId, provider: provEnum } },
        });
        if (!row || !row.enabled) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Save an enabled provider key before testing.', 400);
        }
        let secret;
        try {
            secret = (0, ai_crypto_1.decryptAiSecret)(row.encryptedSecret);
        }
        catch {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Stored key could not be decrypted. Save it again.', 400);
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15_000);
        try {
            const url = provEnum === 'OPENROUTER'
                ? 'https://openrouter.ai/api/v1/auth/key'
                : 'https://api.openai.com/v1/models';
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${secret}`,
                    ...(provEnum === 'OPENROUTER'
                        ? {
                            'HTTP-Referer': process.env.APP_URL || 'https://doit-web.samyukt.pro',
                            'X-Title': 'DoIt AI Workspace',
                        }
                        : {}),
                },
                signal: controller.signal,
            });
            const ok = res.ok;
            await this.prisma.aiProviderCredential.update({
                where: { id: row.id },
                data: { lastTestedAt: new Date(), status: ok ? 'VALID' : 'INVALID' },
            });
            if (!ok) {
                this.logger.warn(`AI provider test failed with status ${res.status}`);
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.INVALID_CREDENTIALS, 'The provider rejected this key.', 400);
            }
            return { ok: true, status: 'VALID', lastTestedAt: new Date().toISOString() };
        }
        catch (err) {
            if (err instanceof app_error_1.AppError)
                throw err;
            this.logger.warn('AI provider test did not complete');
            await this.prisma.aiProviderCredential.update({
                where: { id: row.id },
                data: { lastTestedAt: new Date(), status: 'INVALID' },
            });
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'Could not reach the provider.', 422);
        }
        finally {
            clearTimeout(timer);
        }
    }
    toPublicPrompt(row) {
        return {
            id: row.id,
            taskId: row.taskId,
            projectId: row.projectId,
            promptMarkdown: row.promptMarkdown,
            generationStatus: row.generationStatus,
            provider: row.provider,
            model: row.model,
            sourceSnapshotHash: row.sourceSnapshotHash,
            sourceContextVersion: row.sourceContextVersion,
            selectedAttachmentIds: row.selectedAttachmentIds,
            isUserEdited: row.isUserEdited,
            errorMessage: row.errorMessage,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
    async listPrompts(userId, taskId) {
        await this.taskForUser(userId, taskId);
        const rows = await this.prisma.taskSolutionPrompt.findMany({
            where: { taskId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return { prompts: rows.map((row) => this.toPublicPrompt(row)) };
    }
    async regenerate(userId, promptId, body) {
        const row = await this.prisma.taskSolutionPrompt.findUnique({ where: { id: promptId } });
        if (!row)
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Prompt not found.', 404);
        return this.generate(userId, row.taskId, { ...body, force: body.force ?? true });
    }
    async updatePrompt(userId, promptId, markdown) {
        const row = await this.prisma.taskSolutionPrompt.findUnique({ where: { id: promptId } });
        if (!row)
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Prompt not found.', 404);
        await this.taskForUser(userId, row.taskId);
        if (markdown.length > 80_000) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PAYLOAD_TOO_LARGE, 'Prompt is too large.', 413);
        }
        const saved = await this.prisma.taskSolutionPrompt.update({
            where: { id: promptId },
            data: {
                promptMarkdown: (0, prompt_builder_1.sanitizeMarkdown)(markdown),
                isUserEdited: true,
                generationStatus: 'EDITED',
            },
        });
        return this.toPublicPrompt(saved);
    }
    async generate(userId, taskId, body) {
        if (body.idempotencyKey) {
            const cached = generationIdempotency.get(`${userId}:${body.idempotencyKey}`);
            if (cached)
                return cached;
        }
        hit(generateHits, userId, 8, 10 * 60 * 1000);
        const task = await this.taskForUser(userId, taskId);
        const latest = await this.prisma.taskSolutionPrompt.findFirst({
            where: { taskId },
            orderBy: { createdAt: 'desc' },
        });
        if (latest?.isUserEdited && !body.force) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'This prompt was edited. Regenerate only if you want to replace that edit.', 409);
        }
        const selected = new Set(body.selectedAttachmentIds ?? []);
        const attachments = task.attachments.filter((a) => selected.has(a.id));
        if (attachments.length !== selected.size) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.ATTACHMENT_NOT_FOUND, 'An attachment is not on this task.', 400);
        }
        const facts = {
            workspaceName: task.project.workspace.name,
            projectName: task.project.name,
            projectKey: task.project.key,
            contextMarkdown: task.project.context?.markdown || '',
            contextVersion: task.project.context?.version ?? null,
            taskTitle: task.title,
            taskDescription: task.description,
            taskType: task.type,
            priority: task.priority,
            status: task.status,
            dueAt: task.dueAt ? task.dueAt.toISOString() : null,
            labels: task.labels.map((l) => l.label.name),
            bug: task.bug
                ? {
                    severity: task.bug.severity,
                    steps: task.bug.steps,
                    expected: task.bug.expected,
                    actual: task.bug.actual,
                }
                : null,
            attachments: task.attachments.map((a) => ({
                id: a.id,
                kind: a.kind,
                mimeType: a.mimeType,
                included: selected.has(a.id),
            })),
            visionAnalyzed: false,
        };
        const remember = (payload) => {
            if (body.idempotencyKey)
                generationIdempotency.set(`${userId}:${body.idempotencyKey}`, payload);
            return payload;
        };
        if (body.useTemplate) {
            const promptMarkdown = (0, prompt_builder_1.assembleTemplatePrompt)(facts);
            const saved = await this.prisma.taskSolutionPrompt.create({
                data: {
                    taskId: task.id,
                    projectId: task.projectId,
                    createdByUserId: userId,
                    promptMarkdown,
                    generationStatus: 'DRAFT',
                    provider: 'template',
                    model: null,
                    sourceSnapshotHash: (0, prompt_builder_1.hashSnapshot)(facts),
                    sourceContextVersion: task.project.context?.version ?? null,
                    selectedAttachmentIds: [...selected],
                    isUserEdited: false,
                },
            });
            return remember({
                ...this.toPublicPrompt(saved),
                visionAnalyzed: false,
                visionSupported: false,
                visionWarning: (0, prompt_builder_1.visionWarning)(facts, false),
            });
        }
        if (process.env.AI_GENERATION_ENABLED === 'false') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'AI generation is disabled on the server. Assembling a prompt from the task still works.', 422);
        }
        const credentials = await this.prisma.aiProviderCredential.findMany({
            where: { ownerUserId: userId, enabled: true },
        });
        if (credentials.length === 0) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'No AI provider is configured. Add an OpenRouter or OpenAI personal key in Settings.', 400);
        }
        const credential = credentials.find((c) => c.status === 'VALID') || credentials[0];
        if (!(0, prompt_builder_1.isAllowedModel)(credential.model, credential.provider)) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'The saved model is not supported.', 400);
        }
        const vision = prompt_builder_1.VISION_MODELS.has(credential.model) || credential.model.includes('vision') || credential.model.includes('4o');
        const imageParts = [];
        if (vision) {
            for (const att of attachments) {
                if (!att.mimeType.startsWith('image/'))
                    continue;
                if (att.sizeBytes > 4_000_000) {
                    throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PAYLOAD_TOO_LARGE, 'An image is larger than 4 MB.', 413);
                }
                const bytes = await this.storage.getObject(att.storageKey);
                if (!bytes)
                    throw new app_error_1.AppError(error_code_enum_1.ErrorCode.ATTACHMENT_NOT_FOUND, 'An image could not be read.', 404);
                imageParts.push({ mimeType: att.mimeType, data: bytes.toString('base64') });
            }
            facts.visionAnalyzed = imageParts.length > 0;
        }
        let secret;
        try {
            secret = (0, ai_crypto_1.decryptAiSecret)(credential.encryptedSecret);
        }
        catch {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Stored key could not be decrypted. Save it again.', 400);
        }
        const messages = (0, prompt_builder_1.buildProviderMessages)(facts);
        const userContent = imageParts.length
            ? [
                { type: 'text', text: messages.user },
                ...imageParts.map((img) => ({
                    type: 'image_url',
                    image_url: { url: `data:${img.mimeType};base64,${img.data}` },
                })),
            ]
            : messages.user;
        const isOpenRouter = credential.provider === 'OPENROUTER';
        const endpoint = isOpenRouter
            ? 'https://openrouter.ai/api/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        const reqHeaders = {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
            ...(isOpenRouter
                ? {
                    'HTTP-Referer': process.env.APP_URL || 'https://doit-web.samyukt.pro',
                    'X-Title': 'DoIt AI Solution Assistant',
                }
                : {}),
        };
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45_000);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: reqHeaders,
                body: JSON.stringify({
                    model: credential.model,
                    temperature: 0.2,
                    messages: [
                        { role: 'system', content: messages.system },
                        { role: 'user', content: userContent },
                    ],
                }),
                signal: controller.signal,
            });
            if (!res.ok) {
                this.logger.warn(`Prompt generation failed with status ${res.status}`);
                const message = res.status === 401
                    ? 'The provider rejected the API key.'
                    : res.status === 429
                        ? 'The provider rate limit or quota was reached.'
                        : 'The provider could not generate a prompt.';
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, message, 422);
            }
            const json = (await res.json());
            const text = json.choices?.[0]?.message?.content?.trim();
            if (!text)
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'The provider returned an empty prompt.', 422);
            let promptMarkdown;
            try {
                promptMarkdown = (0, prompt_builder_1.assertPromptSafe)(text, secret);
            }
            catch {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'The provider response was discarded because it was unsafe to store.', 422);
            }
            const saved = await this.prisma.taskSolutionPrompt.create({
                data: {
                    taskId: task.id,
                    projectId: task.projectId,
                    createdByUserId: userId,
                    promptMarkdown,
                    generationStatus: 'GENERATED',
                    provider: credential.provider.toLowerCase(),
                    model: credential.model,
                    sourceSnapshotHash: (0, prompt_builder_1.hashSnapshot)(facts),
                    sourceContextVersion: task.project.context?.version ?? null,
                    selectedAttachmentIds: [...selected],
                    isUserEdited: false,
                    usageJson: json.usage ? json.usage : undefined,
                },
            });
            return remember({
                ...this.toPublicPrompt(saved),
                visionAnalyzed: facts.visionAnalyzed,
                visionSupported: vision,
                visionWarning: (0, prompt_builder_1.visionWarning)(facts, vision),
            });
        }
        catch (err) {
            if (err instanceof app_error_1.AppError)
                throw err;
            this.logger.warn('Prompt generation did not complete');
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'The provider timed out or could not be reached.', 422);
        }
        finally {
            clearTimeout(timer);
        }
    }
};
exports.ContextAiService = ContextAiService;
exports.ContextAiService = ContextAiService = ContextAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ContextAiService);
//# sourceMappingURL=context-ai.service.js.map