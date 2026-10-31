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

    // If route is /workspaces/:id
    const idParam = request.params['id'];
    if (!workspaceId && request.baseUrl.includes('workspaces') && typeof idParam === 'string') {
      workspaceId = idParam;
    }

    // If route is /projects/:id or has :projectId
    const projParam = request.params['projectId'] || request.params['id'];
    const projId = typeof projParam === 'string' ? projParam : undefined;

    if (!workspaceId && projId) {
      if (projId === 'default') {
        const firstMembership = await this.prisma.membership.findFirst({
          where: { userId },
          include: { workspace: { include: { projects: { take: 1 } } } },
        });
        if (firstMembership?.workspace?.projects[0]) {
          workspaceId = firstMembership.workspaceId;
          const resolvedId = firstMembership.workspace.projects[0].id;
          if (request.params['projectId']) request.params['projectId'] = resolvedId;
          if (request.params['id'] === 'default') request.params['id'] = resolvedId;
        }
      } else {
        const project = await this.prisma.project.findUnique({
          where: { id: projId },
          select: { workspaceId: true },
        });
        if (project) {
          workspaceId = project.workspaceId;
        } else {
          const task = await this.prisma.task.findUnique({
            where: { id: projId },
            select: { project: { select: { workspaceId: true } } },
          });
          if (task?.project) {
            workspaceId = task.project.workspaceId;
          }
        }
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
