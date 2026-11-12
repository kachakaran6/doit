import { Injectable, Logger } from '@nestjs/common';
import { Prisma, AccentName, TaskSource, TaskStatus, Priority, TaskType } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  CreateStickyDto,
  UpdateStickyDto,
  ReorderStickyDto,
  ConvertStickyDto,
} from './stickies.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class StickiesService {
  private readonly logger = new Logger(StickiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, userId: string, dto: CreateStickyDto) {
    let targetProjectId = projectId;
    let project: { id: string } | null = null;

    if (projectId && projectId !== 'default') {
      project = await this.prisma.project.findFirst({
        where: { id: projectId, archivedAt: null },
        select: { id: true },
      });
      if (!project) {
        throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found or is archived/deleted.', 404);
      }
      targetProjectId = project.id;
    }

    if (!project) {
      let firstMembership = await this.prisma.membership.findFirst({
        where: { userId },
        include: { workspace: { include: { projects: { where: { archivedAt: null }, take: 1 } } } },
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
        targetProjectId = project.id;
      } else {
        if (firstMembership.workspace.projects.length > 0) {
          project = firstMembership.workspace.projects[0];
          targetProjectId = project.id;
        } else {
          project = await this.prisma.project.create({
            data: {
              workspaceId: firstMembership.workspaceId,
              name: 'General',
              key: 'GEN',
            },
            select: { id: true },
          });
          targetProjectId = project.id;
        }
      }
    }

    const latest = await this.prisma.sticky.findFirst({
      where: { projectId: targetProjectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = latest ? Number(latest.order) + 1000 : 1000;

    const sticky = await this.prisma.sticky.create({
      data: {
        projectId: targetProjectId,
        authorId: userId,
        body: dto.body.trim(),
        color: (dto.color as AccentName) || AccentName.AMBER,
        pinned: dto.pinned || false,
        order: new Prisma.Decimal(nextOrder),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, key: true, name: true } },
      },
    });

    return sticky;
  }

  async findAll(projectId: string, pinned?: boolean) {
    let targetProjectId = projectId;
    if (projectId === 'default') {
      const firstProject = await this.prisma.project.findFirst({ select: { id: true } });
      if (firstProject) targetProjectId = firstProject.id;
    }

    const where: Prisma.StickyWhereInput = {
      projectId: targetProjectId,
      deletedAt: null,
    };

    if (pinned !== undefined) {
      where.pinned = pinned;
    }

    return this.prisma.sticky.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { order: 'asc' }],
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, key: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const sticky = await this.prisma.sticky.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, key: true, name: true } },
      },
    });

    if (!sticky) {
      throw new AppError(ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
    }

    return sticky;
  }

  async update(id: string, dto: UpdateStickyDto) {
    const existing = await this.prisma.sticky.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
    }

    const updated = await this.prisma.sticky.update({
      where: { id },
      data: {
        ...(dto.body ? { body: dto.body.trim() } : {}),
        ...(dto.color ? { color: dto.color as AccentName } : {}),
        ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {}),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, key: true, name: true } },
      },
    });

    return updated;
  }

  async reorder(id: string, dto: ReorderStickyDto) {
    const sticky = await this.prisma.sticky.findUnique({
      where: { id },
    });

    if (!sticky) {
      throw new AppError(ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
    }

    let newOrder = Number(sticky.order);

    if (dto.beforeId && dto.afterId) {
      const [before, after] = await Promise.all([
        this.prisma.sticky.findUnique({ where: { id: dto.beforeId } }),
        this.prisma.sticky.findUnique({ where: { id: dto.afterId } }),
      ]);

      if (before && after) {
        newOrder = (Number(before.order) + Number(after.order)) / 2;
      }
    } else if (dto.beforeId) {
      const before = await this.prisma.sticky.findUnique({ where: { id: dto.beforeId } });
      if (before) {
        newOrder = Number(before.order) / 2;
      }
    } else if (dto.afterId) {
      const after = await this.prisma.sticky.findUnique({ where: { id: dto.afterId } });
      if (after) {
        newOrder = Number(after.order) + 1000;
      }
    }

    const updated = await this.prisma.sticky.update({
      where: { id },
      data: { order: new Prisma.Decimal(newOrder) },
    });

    return { id: updated.id, order: String(updated.order) };
  }

  async convert(id: string, userId: string, dto: ConvertStickyDto) {
    const sticky = await this.prisma.sticky.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!sticky) {
      throw new AppError(ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
    }

    // Converting twice returns 409 CONFLICT with existing task id in details
    if (sticky.convertedTaskId) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'Sticky has already been converted to a task.',
        409,
        [{ field: 'convertedTaskId', issue: sticky.convertedTaskId }],
      );
    }

    const targetProjectId = dto.projectId || sticky.projectId;
    const project = await this.prisma.project.findUnique({
      where: { id: targetProjectId },
    });

    if (!project) {
      throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Target project not found.', 404);
    }

    // Extract first line as title if not provided
    const firstLine = sticky.body.split('\n')[0].trim();
    const title = dto.title || (firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine) || 'Untitled Task';

    const result = await this.prisma.$transaction(async (tx) => {
      // Find highest number in project
      const latestTask = await tx.task.findFirst({
        where: { projectId: targetProjectId },
        orderBy: { number: 'desc' },
        select: { number: true, order: true },
      });

      const nextNumber = (latestTask?.number ?? 0) + 1;
      const nextOrder = latestTask ? Number(latestTask.order) + 1000 : 1000;

      const task = await tx.task.create({
        data: {
          projectId: targetProjectId,
          number: nextNumber,
          title,
          description: sticky.body,
          priority: Priority.MEDIUM,
          type: TaskType.TASK,
          source: TaskSource.STICKY,
          status: TaskStatus.TODO,
          order: new Prisma.Decimal(nextOrder),
          createdById: userId,
          convertedFromStickyId: sticky.id,
        },
      });

      const updatedSticky = await tx.sticky.update({
        where: { id: sticky.id },
        data: { convertedTaskId: task.id },
      });

      await tx.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          taskId: task.id,
          actorId: userId,
          action: 'sticky.converted',
          meta: { stickyId: sticky.id, taskNumber: task.number },
        },
      });

      return {
        task,
        sticky: updatedSticky,
      };
    });

    return result;
  }

  async delete(id: string) {
    const existing = await this.prisma.sticky.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
    }

    // Deleting the sticky -> the task survives with convertedFromStickyId set to null
    await this.prisma.$transaction([
      this.prisma.task.updateMany({
        where: { convertedFromStickyId: id },
        data: { convertedFromStickyId: null },
      }),
      this.prisma.sticky.delete({
        where: { id },
      }),
    ]);

    return { success: true };
  }
}
