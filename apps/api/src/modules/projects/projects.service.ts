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

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        name: dto.name,
        key: dto.key,
        description: dto.description,
        color: dto.color,
      },
    });

    return project;
  }

  async findAll(workspaceId: string) {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
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
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
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
    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.archived !== undefined
          ? { archivedAt: dto.archived ? new Date() : null }
          : {}),
      },
    });

    return updated;
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({
      where: { id: projectId },
    });
    return { success: true };
  }
}
