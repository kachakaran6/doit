"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceMemberGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const roles_decorator_1 = require("../decorators/roles.decorator");
const app_error_1 = require("../errors/app.error");
const error_code_enum_1 = require("../errors/error-code.enum");
let WorkspaceMemberGuard = class WorkspaceMemberGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;
        if (!userId) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Unauthorized', 401);
        }
        const wsParam = request.params['workspaceId'];
        let workspaceId = typeof wsParam === 'string' ? wsParam : undefined;
        const idParam = request.params['id'];
        if (!workspaceId && ((request.baseUrl && request.baseUrl.includes('workspaces')) || (request.originalUrl && request.originalUrl.includes('workspaces'))) && typeof idParam === 'string') {
            workspaceId = idParam;
        }
        const projParam = request.params['projectId'] || request.params['id'];
        const projId = typeof projParam === 'string' ? projParam : undefined;
        if (!workspaceId && projId) {
            if (projId === 'default') {
                const firstMembership = await this.prisma.membership.findFirst({
                    where: { userId },
                    include: { workspace: { include: { projects: { take: 1 } } } },
                });
                if (firstMembership) {
                    workspaceId = firstMembership.workspaceId;
                    if (firstMembership.workspace?.projects[0]) {
                        const resolvedId = firstMembership.workspace.projects[0].id;
                        if (request.params['projectId'])
                            request.params['projectId'] = resolvedId;
                        if (request.params['id'] === 'default')
                            request.params['id'] = resolvedId;
                    }
                }
            }
            else {
                const project = await this.prisma.project.findUnique({
                    where: { id: projId },
                    select: { workspaceId: true },
                });
                if (project) {
                    workspaceId = project.workspaceId;
                }
                else {
                    const task = await this.prisma.task.findUnique({
                        where: { id: projId },
                        select: { project: { select: { workspaceId: true } } },
                    });
                    if (task?.project) {
                        workspaceId = task.project.workspaceId;
                    }
                    else {
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
        if (!workspaceId) {
            return true;
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
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_WORKSPACE_MEMBER, 'You are not a member of this workspace.', 403);
        }
        request.workspaceId = workspaceId;
        request.memberRole = membership.role;
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        if (!requiredRoles.includes(membership.role)) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, `Role ${membership.role} has insufficient permissions for this operation.`, 403);
        }
        return true;
    }
};
exports.WorkspaceMemberGuard = WorkspaceMemberGuard;
exports.WorkspaceMemberGuard = WorkspaceMemberGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], WorkspaceMemberGuard);
//# sourceMappingURL=workspace-member.guard.js.map