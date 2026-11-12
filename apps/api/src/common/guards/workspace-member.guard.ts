import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';
import { AuthUserPayload } from '../decorators/current-user.decorator';

export interface RequestWithWorkspace extends Request {
  user: AuthUserPayload;
  workspaceId: string;
  memberRole: Role;
}

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithWorkspace>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Unauthorized', 401);
    }

    const wsParam = request.params['workspaceId'];
    let workspaceId: string | undefined = typeof wsParam === 'string' ? wsParam : undefined;

    // Check query param e.g. /projects?workspaceId=...
    const queryWsParam = request.query ? (request.query as any)['workspaceId'] : undefined;
    if (!workspaceId && typeof queryWsParam === 'string' && queryWsParam.trim()) {
      workspaceId = queryWsParam.trim();
    }

    // Check active workspace header sent by mobile and web
    const headerWsRaw = request.headers ? request.headers['x-workspace-id'] : undefined;
    const headerWsId = typeof headerWsRaw === 'string' && headerWsRaw.trim() ? headerWsRaw.trim() : undefined;

    // If route is /workspaces/:id or /workspaces/:workspaceId
    const idParam = request.params['id'];
    if (!workspaceId && ((request.baseUrl && request.baseUrl.includes('workspaces')) || (request.originalUrl && request.originalUrl.includes('workspaces'))) && typeof idParam === 'string') {
      workspaceId = idParam;
    }

    // If route is /projects/:id or has :projectId
    const projParam = request.params['projectId'] || request.params['id'];
    const projId = typeof projParam === 'string' ? projParam : undefined;

    if (!workspaceId && projId) {
      if (projId === 'default') {
        const targetWsId = headerWsId;
        const project = targetWsId
          ? await this.prisma.project.findFirst({
              where: { workspaceId: targetWsId, archivedAt: null },
              orderBy: { createdAt: 'asc' },
            })
          : null;
        if (project) {
          workspaceId = project.workspaceId;
          if (request.params['projectId']) request.params['projectId'] = project.id;
          if (request.params['id'] === 'default') request.params['id'] = project.id;
        } else {
          const firstMembership = await this.prisma.membership.findFirst({
            where: { userId },
            include: {
              workspace: {
                include: {
                  projects: {
                    where: { archivedAt: null },
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          });
          if (firstMembership) {
            workspaceId = firstMembership.workspaceId;
            if (firstMembership.workspace?.projects[0]) {
              const resolvedId = firstMembership.workspace.projects[0].id;
              if (request.params['projectId']) request.params['projectId'] = resolvedId;
              if (request.params['id'] === 'default') request.params['id'] = resolvedId;
            }
          }
        }
      } else {
        const project = await this.prisma.project.findUnique({
          where: { id: projId },
          select: { workspaceId: true, archivedAt: true },
        });
        if (project) {
          if (project.archivedAt) {
            throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found or is archived/deleted.', 404);
          }
          workspaceId = project.workspaceId;
        } else {
          const task = await this.prisma.task.findUnique({
            where: { id: projId },
            select: { project: { select: { workspaceId: true, archivedAt: true } } },
          });
          if (task?.project) {
            if (task.project.archivedAt) {
              throw new AppError(ErrorCode.PROJECT_NOT_FOUND, 'Project not found or is archived/deleted.', 404);
            }
            workspaceId = task.project.workspaceId;
          } else {
            const firstMembership = await this.prisma.membership.findFirst({
              where: { userId },
            });
            if (firstMembership) {
              workspaceId = firstMembership.workspaceId;
            }
          }
        }
      }
    }

    if (headerWsId) {
      if (workspaceId && workspaceId !== headerWsId) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Cross-workspace access denied: Target project does not belong to the active workspace.',
          403,
        );
      }
      if (!workspaceId) {
        workspaceId = headerWsId;
      }
    }

    if (!workspaceId) {
      return true; // No workspace context on this route
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        ErrorCode.NOT_WORKSPACE_MEMBER,
        'You are not a member of this workspace.',
        403,
      );
    }

    request.workspaceId = workspaceId;
    request.memberRole = membership.role;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `Role ${membership.role} has insufficient permissions for this operation.`,
        403,
      );
    }

    return true;
  }
}
