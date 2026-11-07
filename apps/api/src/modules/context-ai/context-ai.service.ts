import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import { decryptAiSecret, encryptAiSecret, aiKeyVersion, keyHint, assertAiKeyConfigured } from './ai-crypto';
import {
  ALLOWED_MODELS,
  CONTEXT_STARTER,
  MAX_CONTEXT_CHARS,
  VISION_MODELS,
  assembleTemplatePrompt,
  assertPromptSafe,
  buildProviderMessages,
  hashSnapshot,
  isAllowedModel,
  sanitizeMarkdown,
  visionWarning,
  PromptFacts,
} from './prompt-builder';

const generateHits = new Map<string, number[]>();
const testHits = new Map<string, number[]>();
const generationIdempotency = new Map<string, unknown>();

function hit(bucket: Map<string, number[]>, userId: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (bucket.get(userId) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    throw new AppError(ErrorCode.RATE_LIMITED, 'Too many AI requests. Try again shortly.', 429);
  }
  recent.push(now);
  bucket.set(userId, recent);
}

function publicCredential(row: {
  provider: string;
  model: string;
  keyHint: string;
  enabled: boolean;
  lastTestedAt: Date | null;
  status: string;
  updatedAt: Date;
}) {
  return {
    provider: row.provider,
    model: row.model,
    keyHint: row.keyHint,
    enabled: row.enabled,
    lastTestedAt: row.lastTestedAt,
    status: row.status,
    updatedAt: row.updatedAt,
    allowedModels: ALLOWED_MODELS,
  };
}

@Injectable()
export class ContextAiService {
  private readonly logger = new Logger(ContextAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async membership(userId: string, workspaceId: string) {
    const member = await this.prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) {
      throw new AppError(ErrorCode.NOT_WORKSPACE_MEMBER, 'You are not a member of this workspace.', 403);
    }
    return member;
  }

  private async projectForUser(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { select: { id: true, name: true } } },
    });
    if (!project) throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
    await this.membership(userId, project.workspaceId);
    return project;
  }

  private async taskForUser(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { workspace: { select: { id: true, name: true } }, context: true } },
        labels: { include: { label: true } },
        bug: true,
        attachments: true,
      },
    });
    if (!task || task.deletedAt) throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    await this.membership(userId, task.project.workspaceId);
    return task;
  }

  async getContext(userId: string, projectId: string) {
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
      maxChars: Number(process.env.AI_CONTEXT_MAX_CHARS || MAX_CONTEXT_CHARS),
      starter: CONTEXT_STARTER,
    };
  }

  async putContext(userId: string, projectId: string, markdown: string, expectedVersion?: number) {
    const max = Number(process.env.AI_CONTEXT_MAX_CHARS || MAX_CONTEXT_CHARS);
    if (markdown.length > max) {
      throw new AppError(ErrorCode.PAYLOAD_TOO_LARGE, `Project context is limited to ${max} characters.`, 413);
    }
    await this.projectForUser(userId, projectId);
    const clean = sanitizeMarkdown(markdown);
    const existing = await this.prisma.projectContext.findUnique({ where: { projectId } });
    if (expectedVersion != null && (existing?.version ?? 0) !== expectedVersion) {
      throw new AppError(ErrorCode.STALE_WRITE, 'Project context was updated by someone else. Reload and try again.', 409);
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

  async getCapturePrefs(userId: string, workspaceId: string) {
    if (!workspaceId) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'workspaceId is required.', 400);
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

  async putCapturePrefs(
    userId: string,
    body: {
      workspaceId: string;
      defaultProjectId?: string | null;
      defaultLabelIds?: string[];
      rememberLastProject?: boolean;
      showProjectSelector?: boolean;
      labelsExpanded?: boolean;
      lastProjectId?: string | null;
    },
  ) {
    await this.membership(userId, body.workspaceId);
    if (body.defaultProjectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: body.defaultProjectId, workspaceId: body.workspaceId, archivedAt: null },
      });
      if (!project) {
        throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Default project is not in this workspace.', 400);
      }
    }
    const labelIds = body.defaultLabelIds ?? [];
    if (labelIds.length) {
      const found = await this.prisma.label.count({
        where: { workspaceId: body.workspaceId, id: { in: labelIds } },
      });
      if (found !== labelIds.length) {
        throw new AppError(ErrorCode.LABEL_NOT_FOUND, 'A default label is not in this workspace.', 400);
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

  async listCredentials(userId: string) {
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
      allowedModels: ALLOWED_MODELS,
      notice:
        'Provider usage may incur charges. Project context, task text, and selected attachments are sent to the provider only when you generate a prompt. Keys stay on the server and are not returned after saving.',
    };
  }

  async saveCredential(userId: string, provider: string, body: { apiKey?: string; model: string; enabled?: boolean }) {
    if (provider !== 'openai') {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Only the OpenAI provider is supported.', 400);
    }
    if (!isAllowedModel(body.model)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'That model is not supported.', 400);
    }
    const existing = await this.prisma.aiProviderCredential.findUnique({
      where: { ownerUserId_provider: { ownerUserId: userId, provider: 'OPENAI' } },
    });
    let encrypted = existing?.encryptedSecret;
    let hint = existing?.keyHint;
    if (body.apiKey?.trim()) {
      try {
        assertAiKeyConfigured();
        encrypted = encryptAiSecret(body.apiKey.trim());
      } catch {
        throw new AppError(
          ErrorCode.VALIDATION_FAILED,
          'Set AI_CREDENTIALS_KEY on the server before saving a provider key.',
          400,
        );
      }
      hint = keyHint(body.apiKey.trim());
    }
    if (!encrypted || !hint) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'An API key is required the first time you save a provider.', 400);
    }
    const saved = await this.prisma.aiProviderCredential.upsert({
      where: { ownerUserId_provider: { ownerUserId: userId, provider: 'OPENAI' } },
      create: {
        ownerUserId: userId,
        provider: 'OPENAI',
        model: body.model,
        encryptedSecret: encrypted,
        encryptionKeyVersion: aiKeyVersion(),
        keyHint: hint,
        enabled: body.enabled ?? true,
        status: 'UNTESTED',
      },
      update: {
        model: body.model,
        encryptedSecret: encrypted,
        encryptionKeyVersion: aiKeyVersion(),
        keyHint: hint,
        enabled: body.enabled ?? existing?.enabled ?? true,
        status: body.apiKey?.trim() ? 'UNTESTED' : existing?.status ?? 'UNTESTED',
      },
    });
    return publicCredential(saved);
  }

  async deleteCredential(userId: string, provider: string) {
    if (provider !== 'openai') {
      throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found.', 404);
    }
    await this.prisma.aiProviderCredential.deleteMany({
      where: { ownerUserId: userId, provider: 'OPENAI' },
    });
    return { deleted: true };
  }

  async testCredential(userId: string, provider: string) {
    hit(testHits, userId, 5, 10 * 60 * 1000);
    if (provider !== 'openai') {
      throw new AppError(ErrorCode.NOT_FOUND, 'Provider not found.', 404);
    }
    const row = await this.prisma.aiProviderCredential.findUnique({
      where: { ownerUserId_provider: { ownerUserId: userId, provider: 'OPENAI' } },
    });
    if (!row || !row.enabled) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Save an enabled provider key before testing.', 400);
    }
    let secret: string;
    try {
      secret = decryptAiSecret(row.encryptedSecret);
    } catch {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Stored key could not be decrypted. Save it again.', 400);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${secret}` },
        signal: controller.signal,
      });
      const ok = res.ok;
      await this.prisma.aiProviderCredential.update({
        where: { id: row.id },
        data: { lastTestedAt: new Date(), status: ok ? 'VALID' : 'INVALID' },
      });
      if (!ok) {
        this.logger.warn(`AI provider test failed with status ${res.status}`);
        throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'The provider rejected this key.', 400);
      }
      return { ok: true, status: 'VALID', lastTestedAt: new Date().toISOString() };
    } catch (err) {
      if (err instanceof AppError) throw err;
      this.logger.warn('AI provider test did not complete');
      await this.prisma.aiProviderCredential.update({
        where: { id: row.id },
        data: { lastTestedAt: new Date(), status: 'INVALID' },
      });
      throw new AppError(ErrorCode.UNPROCESSABLE, 'Could not reach the provider.', 422);
    } finally {
      clearTimeout(timer);
    }
  }

  private toPublicPrompt(row: {
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
  }) {
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

  async listPrompts(userId: string, taskId: string) {
    await this.taskForUser(userId, taskId);
    const rows = await this.prisma.taskSolutionPrompt.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { prompts: rows.map((row) => this.toPublicPrompt(row)) };
  }

  async regenerate(userId: string, promptId: string, body: { selectedAttachmentIds?: string[]; force?: boolean; useTemplate?: boolean; idempotencyKey?: string }) {
    const row = await this.prisma.taskSolutionPrompt.findUnique({ where: { id: promptId } });
    if (!row) throw new AppError(ErrorCode.NOT_FOUND, 'Prompt not found.', 404);
    return this.generate(userId, row.taskId, { ...body, force: body.force ?? true });
  }

  async updatePrompt(userId: string, promptId: string, markdown: string) {
    const row = await this.prisma.taskSolutionPrompt.findUnique({ where: { id: promptId } });
    if (!row) throw new AppError(ErrorCode.NOT_FOUND, 'Prompt not found.', 404);
    await this.taskForUser(userId, row.taskId);
    if (markdown.length > 80_000) {
      throw new AppError(ErrorCode.PAYLOAD_TOO_LARGE, 'Prompt is too large.', 413);
    }
    const saved = await this.prisma.taskSolutionPrompt.update({
      where: { id: promptId },
      data: {
        promptMarkdown: sanitizeMarkdown(markdown),
        isUserEdited: true,
        generationStatus: 'EDITED',
      },
    });
    return this.toPublicPrompt(saved);
  }

  async generate(userId: string, taskId: string, body: { selectedAttachmentIds?: string[]; force?: boolean; useTemplate?: boolean; idempotencyKey?: string }) {
    if (body.idempotencyKey) {
      const cached = generationIdempotency.get(`${userId}:${body.idempotencyKey}`);
      if (cached) return cached;
    }
    hit(generateHits, userId, 8, 10 * 60 * 1000);
    const task = await this.taskForUser(userId, taskId);
    const latest = await this.prisma.taskSolutionPrompt.findFirst({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
    if (latest?.isUserEdited && !body.force) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'This prompt was edited. Regenerate only if you want to replace that edit.',
        409,
      );
    }

    const selected = new Set(body.selectedAttachmentIds ?? []);
    const attachments = task.attachments.filter((a) => selected.has(a.id));
    if (attachments.length !== selected.size) {
      throw new AppError(ErrorCode.ATTACHMENT_NOT_FOUND, 'An attachment is not on this task.', 400);
    }

    const facts: PromptFacts = {
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

    const remember = (payload: unknown) => {
      if (body.idempotencyKey) generationIdempotency.set(`${userId}:${body.idempotencyKey}`, payload);
      return payload;
    };

    if (body.useTemplate) {
      const promptMarkdown = assembleTemplatePrompt(facts);
      const saved = await this.prisma.taskSolutionPrompt.create({
        data: {
          taskId: task.id,
          projectId: task.projectId,
          createdByUserId: userId,
          promptMarkdown,
          generationStatus: 'DRAFT',
          provider: 'template',
          model: null,
          sourceSnapshotHash: hashSnapshot(facts),
          sourceContextVersion: task.project.context?.version ?? null,
          selectedAttachmentIds: [...selected],
          isUserEdited: false,
        },
      });
      return remember({
        ...this.toPublicPrompt(saved),
        visionAnalyzed: false,
        visionSupported: false,
        visionWarning: visionWarning(facts, false),
      });
    }

    if (process.env.AI_GENERATION_ENABLED === 'false') {
      throw new AppError(
        ErrorCode.UNPROCESSABLE,
        'AI generation is disabled on the server. Assembling a prompt from the task still works.',
        422,
      );
    }

    const credential = await this.prisma.aiProviderCredential.findUnique({
      where: { ownerUserId_provider: { ownerUserId: userId, provider: 'OPENAI' } },
    });
    if (!credential || !credential.enabled) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        'No AI provider is configured. Add a personal key in Settings, or assemble a prompt from the task without calling a provider.',
        400,
      );
    }
    if (!isAllowedModel(credential.model)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'The saved model is not supported.', 400);
    }

    const vision = VISION_MODELS.has(credential.model);
    const imageParts: { mimeType: string; data: string }[] = [];
    if (vision) {
      for (const att of attachments) {
        if (!att.mimeType.startsWith('image/')) continue;
        if (att.sizeBytes > 4_000_000) {
          throw new AppError(ErrorCode.PAYLOAD_TOO_LARGE, 'An image is larger than 4 MB.', 413);
        }
        const bytes = await this.storage.getObject(att.storageKey);
        if (!bytes) throw new AppError(ErrorCode.ATTACHMENT_NOT_FOUND, 'An image could not be read.', 404);
        imageParts.push({ mimeType: att.mimeType, data: bytes.toString('base64') });
      }
      facts.visionAnalyzed = imageParts.length > 0;
    }

    let secret: string;
    try {
      secret = decryptAiSecret(credential.encryptedSecret);
    } catch {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Stored key could not be decrypted. Save it again.', 400);
    }

    const messages = buildProviderMessages(facts);
    const userContent = imageParts.length
      ? [
          { type: 'text', text: messages.user },
          ...imageParts.map((img) => ({
            type: 'image_url',
            image_url: { url: `data:${img.mimeType};base64,${img.data}` },
          })),
        ]
      : messages.user;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
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
        const message =
          res.status === 401
            ? 'The provider rejected the API key.'
            : res.status === 429
              ? 'The provider rate limit or quota was reached.'
              : 'The provider could not generate a prompt.';
        throw new AppError(ErrorCode.UNPROCESSABLE, message, 422);
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: unknown;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new AppError(ErrorCode.UNPROCESSABLE, 'The provider returned an empty prompt.', 422);
      let promptMarkdown: string;
      try {
        promptMarkdown = assertPromptSafe(text, secret);
      } catch {
        throw new AppError(ErrorCode.UNPROCESSABLE, 'The provider response was discarded because it was unsafe to store.', 422);
      }
      const saved = await this.prisma.taskSolutionPrompt.create({
        data: {
          taskId: task.id,
          projectId: task.projectId,
          createdByUserId: userId,
          promptMarkdown,
          generationStatus: 'GENERATED',
          provider: 'openai',
          model: credential.model,
          sourceSnapshotHash: hashSnapshot(facts),
          sourceContextVersion: task.project.context?.version ?? null,
          selectedAttachmentIds: [...selected],
          isUserEdited: false,
          usageJson: json.usage ? (json.usage as object) : undefined,
        },
      });
      return remember({
        ...this.toPublicPrompt(saved),
        visionAnalyzed: facts.visionAnalyzed,
        visionSupported: vision,
        visionWarning: visionWarning(facts, vision),
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      this.logger.warn('Prompt generation did not complete');
      throw new AppError(ErrorCode.UNPROCESSABLE, 'The provider timed out or could not be reached.', 422);
    } finally {
      clearTimeout(timer);
    }
  }
}
