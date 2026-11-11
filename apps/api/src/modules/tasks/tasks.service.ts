import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TaskStatus, Priority, TaskType, TaskSource } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateStatusDto,
  ReorderTaskDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  TaskListQueryDto,
} from './tasks.dto';
import { validateStatusTransition } from './status-machine';
import { mapTaskListItem, RawTaskModel } from './tasks.mapper';
import { CursorPage } from '../../common/pagination/cursor-page';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly idempotencyCache = new Map<string, unknown>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(userId: string, dto: CreateTaskDto, idempotencyKey?: string) {
    if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
      this.logger.log(`Idempotent replay detected for key: ${idempotencyKey}`);
      return {
        task: this.idempotencyCache.get(idempotencyKey),
        isReplay: true,
      };
    }

    let project: { id: string; key: string; workspaceId: string; defaultAssigneeId?: string | null } | null = null;
    if (dto.projectId && dto.projectId !== 'default') {
      project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true, key: true, workspaceId: true, defaultAssigneeId: true },
      });
    }

    if (!project) {
      let firstMembership = await this.prisma.membership.findFirst({
        where: { userId },
        include: { workspace: { include: { projects: { take: 1 } } } },
      });

      if (!firstMembership) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const name = user?.name ? `${user.name}'s Workspace` : 'Personal Workspace';
        const slug = `ws-${userId.slice(0, 8)}-${Date.now().toString(36)}`;
        const ws = await this.prisma.workspace.create({
          data: {
            name,
            slug,
            ownerId: userId,
            memberships: { create: { userId, role: 'OWNER' } },
            projects: { create: { name: 'General', key: 'GEN' } },
          },
          include: { projects: { take: 1 } },
        });
        project = ws.projects[0];
        dto.projectId = project.id;
      } else {
        if (firstMembership.workspace.projects.length > 0) {
          project = firstMembership.workspace.projects[0];
          dto.projectId = project.id;
        } else {
          project = await this.prisma.project.create({
            data: {
              workspaceId: firstMembership.workspaceId,
              name: 'General',
              key: 'GEN',
            },
            select: { id: true, key: true, workspaceId: true },
          });
          dto.projectId = project.id;
        }
      }
    }

    if (dto.labelIds?.length && project) {
      const found = await this.prisma.label.count({
        where: { workspaceId: project.workspaceId, id: { in: dto.labelIds } },
      });
      if (found !== dto.labelIds.length) {
        throw new AppError(ErrorCode.LABEL_NOT_FOUND, 'One or more labels are not in this workspace.', 400);
      }
    }

    const task = await this.prisma.$transaction(async (tx) => {
      // Find highest number in project
      const latestTask = await tx.task.findFirst({
        where: { projectId: project.id },
        orderBy: { number: 'desc' },
        select: { number: true, order: true },
      });

      const nextNumber = (latestTask?.number ?? 0) + 1;
      const nextOrder = latestTask ? Number(latestTask.order) + 1000 : 1000;

      const created = await tx.task.create({
        data: {
          projectId: project.id,
          number: nextNumber,
          title: dto.title,
          description: dto.description,
          priority: (dto.priority as Priority) || Priority.MEDIUM,
          type: (dto.type as TaskType) || TaskType.TASK,
          source: (dto.source as TaskSource) || TaskSource.MANUAL,
          status: TaskStatus.TODO,
          order: new Prisma.Decimal(nextOrder),
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          dueHasTime: dto.dueHasTime || false,
          createdById: userId,
          assigneeId:
            dto.assigneeId !== undefined && dto.assigneeId !== null && dto.assigneeId !== ''
              ? dto.assigneeId
              : project?.defaultAssigneeId || null,
          labels: {
            create: (dto.labelIds || []).map((labelId) => ({
              label: { connect: { id: labelId } },
            })),
          },
        },
        include: {
          project: { select: { key: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          labels: { select: { label: { select: { id: true, name: true, color: true } } } },
          checklist: { select: { id: true, done: true } },
          bug: true,
          _count: { select: { attachments: true, comments: true } },
        },
      });

      if (dto.type === TaskType.BUG || (dto as any).type === 'BUG' || dto.source === TaskSource.BUG || (dto as any).source === 'BUG') {
        const rawSev = (dto as any).severity;
        const sev = rawSev === 'CRITICAL' || rawSev === 'BLOCKER' || rawSev === 'MAJOR' || rawSev === 'MINOR' || rawSev === 'COSMETIC'
          ? (rawSev as any)
          : (created.priority === Priority.URGENT ? 'CRITICAL' : 'MAJOR');

        const bugReport = await tx.bugReport.create({
          data: {
            taskId: created.id,
            reporterId: userId,
            severity: sev,
            steps: (dto as any).steps || [],
            expected: (dto as any).expected || null,
            actual: (dto as any).actual || null,
            frequency: (dto as any).frequency || 'often',
            deviceModel: (dto as any).deviceModel || (dto as any).telemetry?.deviceModel || 'Mobile Device',
            osVersion: (dto as any).osVersion || (dto as any).telemetry?.osVersion || 'Android',
            appVersion: (dto as any).appVersion || (dto as any).telemetry?.appVersion || '0.2.4',
            autoContext: (dto as any).telemetry || {},
          },
        });
        (created as any).bug = bugReport;
      }

      // Write ActivityLog
      await tx.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          taskId: created.id,
          actorId: userId,
          action: 'task.created',
          meta: { title: created.title, number: created.number },
        },
      });

      return created;
    });

    const mapped = mapTaskListItem(task as unknown as RawTaskModel, project.key);

    if (idempotencyKey) {
      this.idempotencyCache.set(idempotencyKey, mapped);
    }

    return {
      task: mapped,
      isReplay: false,
    };
  }

  async findAll(
    scope: string | { workspaceId?: string; projectId?: string },
    query: TaskListQueryDto,
  ) {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
    };

    if (typeof scope === 'string') {
      where.project = { workspaceId: scope };
    } else {
      if (scope.projectId && scope.projectId !== 'default') {
        where.projectId = scope.projectId;
      } else if (scope.projectId === 'default') {
        const firstProject = await this.prisma.project.findFirst({ select: { id: true } });
        if (firstProject) where.projectId = firstProject.id;
      } else if (scope.workspaceId) {
        where.project = { workspaceId: scope.workspaceId };
      }
    }

    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      where.status = { in: statuses as TaskStatus[] };
    }

    if (query.priority) {
      const priorities = Array.isArray(query.priority) ? query.priority : [query.priority];
      where.priority = { in: priorities as Priority[] };
    }

    if (query.type) {
      where.type = query.type as TaskType;
    }

    if (query.assignee) {
      if (query.assignee === 'none') {
        where.assigneeId = null;
      } else {
        where.assigneeId = query.assignee;
      }
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const limit = query.limit || 20;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        take: limit + 1,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          project: { select: { key: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          labels: { select: { label: { select: { id: true, name: true, color: true } } } },
          checklist: { select: { id: true, done: true } },
          attachments: true,
          bug: true,
          _count: { select: { attachments: true, comments: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const mapped = await Promise.all(
      tasks.map(async (t) => {
        const item = mapTaskListItem(t as unknown as RawTaskModel);
        if (t.attachments && (t.attachments as any[]).length > 0) {
          const attachmentsWithUrls = await Promise.all(
            (t.attachments as any[]).map(async (att) => {
              try {
                const [url, thumbUrl] = await Promise.all([
                  this.storage.getSignedUrl(att.storageKey, 3600),
                  att.thumbKey ? this.storage.getSignedUrl(att.thumbKey, 3600) : Promise.resolve(''),
                ]);
                return { ...att, url, thumbUrl: thumbUrl || url };
              } catch {
                return { ...att, url: null, thumbUrl: null };
              }
            }),
          );
          item.attachments = attachmentsWithUrls;
        }
        return item;
      }),
    );
    return CursorPage.create(mapped, limit, total);
  }

  async findMyDay(userId: string, workspaceId: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        project: { workspaceId },
        assigneeId: userId,
        deletedAt: null,
        OR: [{ dueAt: { lte: today } }, { status: { not: TaskStatus.DONE } }],
      },
      orderBy: { order: 'asc' },
      include: {
        project: { select: { key: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { select: { id: true, done: true } },
        _count: { select: { attachments: true, comments: true } },
      },
    });

    return tasks.map((t) => mapTaskListItem(t as unknown as RawTaskModel));
  }

  async findInbox(workspaceId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        project: { workspaceId },
        assigneeId: null,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { key: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { select: { id: true, done: true } },
        _count: { select: { attachments: true, comments: true } },
      },
    });

    return tasks.map((t) => mapTaskListItem(t as unknown as RawTaskModel));
  }

  private async resolveTaskId(idOrHumanId: string): Promise<string> {
    if (!idOrHumanId) return idOrHumanId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrHumanId);
    if (isUuid) return idOrHumanId;
    const match = idOrHumanId.match(/^([A-Z0-9]+)-(\d+)$/i);
    if (match) {
      const projectKey = match[1].toUpperCase();
      const taskNumber = parseInt(match[2], 10);
      const task = await this.prisma.task.findFirst({
        where: {
          number: taskNumber,
          project: { key: projectKey },
        },
        select: { id: true },
      });
      return task?.id || idOrHumanId;
    }
    return idOrHumanId;
  }

  async findOne(rawTaskId: string) {
    const taskId = await this.resolveTaskId(rawTaskId);
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, key: true, name: true, workspaceId: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { orderBy: { order: 'asc' } },
        attachments: true,
        bug: true,
        activity: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, name: true } } },
        },
      },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const attachmentsWithUrls = await Promise.all(
      (task.attachments || []).map(async (att) => {
        try {
          const [url, thumbUrl] = await Promise.all([
            this.storage.getSignedUrl(att.storageKey, 3600),
            att.thumbKey ? this.storage.getSignedUrl(att.thumbKey, 3600) : Promise.resolve(''),
          ]);
          return {
            ...att,
            url,
            thumbUrl: thumbUrl || url,
          };
        } catch {
          return {
            ...att,
            url: null,
            thumbUrl: null,
          };
        }
      }),
    );

    return {
      ...mapTaskListItem(task as unknown as RawTaskModel, task.project.key),
      checklist: task.checklist,
      attachments: attachmentsWithUrls,
      bug: task.bug,
      activity: task.activity,
    };
  }

  async update(rawTaskId: string, userId: string, dto: UpdateTaskDto) {
    const taskId = await this.resolveTaskId(rawTaskId);
    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existing) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    if (dto.status) {
      const targetStatus = dto.status as TaskStatus;
      validateStatusTransition(existing.status, targetStatus);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status
          ? {
              status: dto.status as TaskStatus,
              completedAt: dto.status === TaskStatus.DONE ? new Date() : null,
            }
          : {}),
        ...(dto.priority ? { priority: dto.priority as Priority } : {}),
        ...(dto.dueAt !== undefined ? { dueAt: dto.dueAt ? new Date(dto.dueAt) : null } : {}),
        ...(dto.dueHasTime !== undefined ? { dueHasTime: dto.dueHasTime } : {}),
        ...(dto.assigneeId !== undefined ? { assigneeId: dto.assigneeId } : {}),
      },
      include: {
        project: { select: { key: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { select: { id: true, done: true } },
        _count: { select: { attachments: true, comments: true } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: existing.project.workspaceId,
        taskId,
        actorId: userId,
        action: 'task.updated',
        meta: { fields: Object.keys(dto) },
      },
    });

    return mapTaskListItem(updated as unknown as RawTaskModel);
  }

  async updateStatus(rawTaskId: string, userId: string, dto: UpdateStatusDto) {
    const taskId = await this.resolveTaskId(rawTaskId);
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const targetStatus = dto.status as TaskStatus;
    validateStatusTransition(task.status, targetStatus);

    const completedAt = targetStatus === TaskStatus.DONE ? new Date() : null;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: targetStatus,
        completedAt,
      },
      include: {
        project: { select: { key: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { select: { id: true, done: true } },
        _count: { select: { attachments: true, comments: true } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId,
        actorId: userId,
        action: 'task.status.changed',
        meta: { from: task.status, to: targetStatus },
      },
    });

    return mapTaskListItem(updated as unknown as RawTaskModel);
  }

  async reorder(taskId: string, dto: ReorderTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    let newOrder = Number(task.order);

    if (dto.beforeId && dto.afterId) {
      const [before, after] = await Promise.all([
        this.prisma.task.findUnique({ where: { id: dto.beforeId } }),
        this.prisma.task.findUnique({ where: { id: dto.afterId } }),
      ]);

      if (before && after) {
        newOrder = (Number(before.order) + Number(after.order)) / 2;
      }
    } else if (dto.beforeId) {
      const before = await this.prisma.task.findUnique({ where: { id: dto.beforeId } });
      if (before) {
        newOrder = Number(before.order) / 2;
      }
    } else if (dto.afterId) {
      const after = await this.prisma.task.findUnique({ where: { id: dto.afterId } });
      if (after) {
        newOrder = Number(after.order) + 1000;
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { order: new Prisma.Decimal(newOrder) },
    });

    return { id: updated.id, order: String(updated.order) };
  }

  async assign(rawTaskId: string, userId: string, rawAssigneeId: string | null) {
    const taskId = await this.resolveTaskId(rawTaskId);
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const cleanAssigneeId =
      rawAssigneeId && rawAssigneeId !== 'unassigned' && rawAssigneeId.trim() !== ''
        ? rawAssigneeId.trim()
        : null;

    if (cleanAssigneeId) {
      const isMember = await this.prisma.membership.findFirst({
        where: { workspaceId: task.project.workspaceId, userId: cleanAssigneeId },
      });
      if (!isMember) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Selected assignee must be a member of this workspace.',
          400,
        );
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: cleanAssigneeId },
      include: {
        project: { select: { key: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        checklist: { select: { id: true, done: true } },
        _count: { select: { attachments: true, comments: true } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId,
        actorId: userId,
        action: 'task.assigned',
        meta: { assigneeId: cleanAssigneeId },
      },
    });

    return mapTaskListItem(updated as unknown as RawTaskModel);
  }

  async setLabels(taskId: string, userId: string, labelIds: string[]) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Remove existing labels
      await tx.taskLabel.deleteMany({
        where: { taskId },
      });

      // Add new labels
      if (labelIds.length > 0) {
        await tx.taskLabel.createMany({
          data: labelIds.map((labelId) => ({
            taskId,
            labelId,
          })),
        });
      }

      return tx.task.findUnique({
        where: { id: taskId },
        include: {
          project: { select: { key: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          labels: { select: { label: { select: { id: true, name: true, color: true } } } },
          checklist: { select: { id: true, done: true } },
          _count: { select: { attachments: true, comments: true } },
        },
      });
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId,
        actorId: userId,
        action: 'task.labels.updated',
        meta: { labelIds },
      },
    });

    return mapTaskListItem(updated as unknown as RawTaskModel);
  }

  async delete(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        actorId: userId,
        action: 'task.deleted',
        meta: { taskId, title: task.title },
      },
    });

    return { success: true };
  }

  async addChecklistItem(taskId: string, dto: CreateChecklistItemDto) {
    const latest = await this.prisma.checklistItem.findFirst({
      where: { taskId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = latest ? Number(latest.order) + 1000 : 1000;

    const item = await this.prisma.checklistItem.create({
      data: {
        taskId,
        text: dto.text,
        order: new Prisma.Decimal(nextOrder),
      },
    });

    return item;
  }

  async updateChecklistItem(itemId: string, dto: UpdateChecklistItemDto) {
    const updated = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(dto.text ? { text: dto.text } : {}),
        ...(dto.done !== undefined ? { done: dto.done } : {}),
      },
    });

    return updated;
  }

  async deleteChecklistItem(itemId: string) {
    await this.prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }

  async getComments(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });
    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }
    return this.prisma.comment.findMany({
      where: { taskId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async createComment(taskId: string, userId: string, dto: { body: string; voiceNoteId?: string }) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        body: dto.body,
        voiceNoteId: dto.voiceNoteId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId,
        actorId: userId,
        action: 'task.comment_added',
        meta: { commentId: comment.id },
      },
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Comment not found.', 404);
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}
