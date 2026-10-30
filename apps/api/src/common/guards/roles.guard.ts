import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';
import { AuthUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUserPayload }>();
    if (!user || !user.role) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions for this resource.', 403);
    }

    const hasRole = requiredRoles.includes(user.role as Role);
    if (!hasRole) {
      throw new AppError(ErrorCode.FORBIDDEN, 'User role does not meet required privileges.', 403);
    }

    return true;
  }
}
