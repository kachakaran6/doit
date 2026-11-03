import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TaskStatus, Priority, TaskType, TaskSource } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
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

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto, idempotencyKey?: string) {
    if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
      this.logger.log(`Idempotent replay detected for key: ${idempotencyKey}`);
      return {
        task: this.idempotencyCache.get(idempotencyKey),
        isReplay: true,
      };
    }

    let project: { id: string; key: string; workspaceId: string } | null = null;
    if (dto.projectId && dto.projectId !== 'default') {
      project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true, key: true, workspaceId: true },
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
          assigneeId: dto.assigneeId || null,
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
          _count: { select: { attachments: true, comments: true } },
        },
      });

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
          _count: { select: { attachments: true, comments: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const mapped = tasks.map((t) => mapTaskListItem(t as unknown as RawTaskModel));
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

  async findOne(taskId: string) {
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

    return {
      ...mapTaskListItem(task as unknown as RawTaskModel, task.project.key),
      checklist: task.checklist,
      attachments: task.attachments,
      bug: task.bug,
      activity: task.activity,
    };
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existing) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
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

  async updateStatus(taskId: string, userId: string, dto: UpdateStatusDto) {
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

  async assign(taskId: string, userId: string, assigneeId: string | null) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
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
        meta: { assigneeId },
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
}
