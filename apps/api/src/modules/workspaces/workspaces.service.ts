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
    let memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            projects: true,
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

    if (memberships.length === 0) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const name = user?.name ? `${user.name}'s Workspace` : 'Personal Workspace';
      const slug = `ws-${userId.slice(0, 8)}-${Date.now().toString(36)}`;
      const newWs = await this.prisma.workspace.create({
        data: {
          name,
          slug,
          ownerId: userId,
          memberships: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
          projects: {
            create: {
              name: 'General',
              key: 'GEN',
            },
          },
        },
        include: {
          projects: true,
          _count: {
            select: {
              projects: true,
              memberships: true,
            },
          },
        },
      });
      return [{ ...newWs, role: 'OWNER' }];
    }

    // Ensure each workspace has at least one project
    for (const m of memberships) {
      if (!m.workspace.projects || m.workspace.projects.length === 0) {
        const defaultProj = await this.prisma.project.create({
          data: {
            workspaceId: m.workspace.id,
            name: 'General',
            key: 'GEN',
          },
        });
        m.workspace.projects = [defaultProj];
      }
    }

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
