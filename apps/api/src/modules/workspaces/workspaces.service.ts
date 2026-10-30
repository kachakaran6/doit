import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug =
      dto.slug ||
      `${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;

    const existing = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, 'Workspace slug is already in use.', 409, [
        { field: 'slug', issue: 'already_taken' },
      ]);
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    return workspace;
  }

  async findAll(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                projects: true,
                memberships: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  async findOne(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: true,
        memberships: {
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
        },
      },
    });

    if (!workspace) {
      throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 'Workspace not found.', 404);
    }

    return workspace;
  }

  async update(workspaceId: string, dto: UpdateWorkspaceDto) {
    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
      },
    });
    return updated;
  }

  async delete(workspaceId: string) {
    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
    return { success: true };
  }
}
