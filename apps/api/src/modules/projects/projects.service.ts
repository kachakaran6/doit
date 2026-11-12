import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: {
        workspaceId_key: {
          workspaceId,
          key: dto.key,
        },
      },
    });

    if (existing) {
      throw new AppError(
        ErrorCode.CONFLICT,
        `Project key '${dto.key}' already exists in this workspace.`,
        409,
        [{ field: 'key', issue: 'duplicate_key' }],
      );
    }

    if (dto.defaultAssigneeId) {
      const isMember = await this.prisma.membership.findFirst({
        where: { workspaceId, userId: dto.defaultAssigneeId },
      });
      if (!isMember) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Default assignee must be a member of the workspace.',
          400,
        );
      }
    }

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        name: dto.name,
        key: dto.key,
        description: dto.description,
        color: dto.color,
        defaultAssigneeId: dto.defaultAssigneeId || null,
      },
      include: {
        defaultAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return project;
  }

  async findAll(workspaceId: string) {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        defaultAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            stickies: true,
          },
        },
      },
    });

    return projects;
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, archivedAt: null },
      include: {
        defaultAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            stickies: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
    }

    return project;
  }

  async update(projectId: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    if (!existing) {
      throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
    }

    if (dto.defaultAssigneeId) {
      const isMember = await this.prisma.membership.findFirst({
        where: { workspaceId: existing.workspaceId, userId: dto.defaultAssigneeId },
      });
      if (!isMember) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Default assignee must be a member of the workspace.',
          400,
        );
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.defaultAssigneeId !== undefined
          ? { defaultAssigneeId: dto.defaultAssigneeId }
          : {}),
        ...(dto.archived !== undefined
          ? { archivedAt: dto.archived ? new Date() : null }
          : {}),
      },
      include: {
        defaultAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async getProjectMembers(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, archivedAt: null },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        defaultAssigneeId: true,
        defaultAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
    }

    const memberships = await this.prisma.membership.findMany({
      where: { workspaceId: project.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      projectId: project.id,
      projectName: project.name,
      defaultAssigneeId: project.defaultAssigneeId,
      defaultAssignee: project.defaultAssignee,
      members: memberships.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
      })),
    };
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({
      where: { id: projectId },
    });
    return { success: true };
  }
}
