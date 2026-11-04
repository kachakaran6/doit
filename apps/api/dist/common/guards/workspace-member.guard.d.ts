import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuthUserPayload } from '../decorators/current-user.decorator';
export interface RequestWithWorkspace extends Request {
    user: AuthUserPayload;
    workspaceId: string;
    memberRole: Role;
}
export declare class WorkspaceMemberGuard implements CanActivate {
    private readonly reflector;
    private readonly prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
