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
var StickiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickiesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let StickiesService = StickiesService_1 = class StickiesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StickiesService_1.name);
    }
    async create(projectId, userId, dto) {
        let targetProjectId = projectId;
        let project = null;
        if (projectId && projectId !== 'default') {
            project = await this.prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true },
            });
            if (project)
                targetProjectId = project.id;
        }
        if (!project) {
            let firstMembership = await this.prisma.membership.findFirst({
                where: { userId },
                include: { workspace: { include: { projects: { take: 1 } } } },
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
            }
            else {
                if (firstMembership.workspace.projects.length > 0) {
                    project = firstMembership.workspace.projects[0];
                    targetProjectId = project.id;
                }
                else {
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
                color: dto.color || client_1.AccentName.AMBER,
                pinned: dto.pinned || false,
                order: new client_1.Prisma.Decimal(nextOrder),
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                project: { select: { id: true, key: true, name: true } },
            },
        });
        return sticky;
    }
    async findAll(projectId, pinned) {
        let targetProjectId = projectId;
        if (projectId === 'default') {
            const firstProject = await this.prisma.project.findFirst({ select: { id: true } });
            if (firstProject)
                targetProjectId = firstProject.id;
        }
        const where = {
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
    async findOne(id) {
        const sticky = await this.prisma.sticky.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                project: { select: { id: true, key: true, name: true } },
            },
        });
        if (!sticky) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
        }
        return sticky;
    }
    async update(id, dto) {
        const existing = await this.prisma.sticky.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
        }
        const updated = await this.prisma.sticky.update({
            where: { id },
            data: {
                ...(dto.body ? { body: dto.body.trim() } : {}),
                ...(dto.color ? { color: dto.color } : {}),
                ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {}),
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                project: { select: { id: true, key: true, name: true } },
            },
        });
        return updated;
    }
    async reorder(id, dto) {
        const sticky = await this.prisma.sticky.findUnique({
            where: { id },
        });
        if (!sticky) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
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
        }
        else if (dto.beforeId) {
            const before = await this.prisma.sticky.findUnique({ where: { id: dto.beforeId } });
            if (before) {
                newOrder = Number(before.order) / 2;
            }
        }
        else if (dto.afterId) {
            const after = await this.prisma.sticky.findUnique({ where: { id: dto.afterId } });
            if (after) {
                newOrder = Number(after.order) + 1000;
            }
        }
        const updated = await this.prisma.sticky.update({
            where: { id },
            data: { order: new client_1.Prisma.Decimal(newOrder) },
        });
        return { id: updated.id, order: String(updated.order) };
    }
    async convert(id, userId, dto) {
        const sticky = await this.prisma.sticky.findUnique({
            where: { id },
            include: { project: true },
        });
        if (!sticky) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
        }
        if (sticky.convertedTaskId) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'Sticky has already been converted to a task.', 409, [{ field: 'convertedTaskId', issue: sticky.convertedTaskId }]);
        }
        const targetProjectId = dto.projectId || sticky.projectId;
        const project = await this.prisma.project.findUnique({
            where: { id: targetProjectId },
        });
        if (!project) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Target project not found.', 404);
        }
        const firstLine = sticky.body.split('\n')[0].trim();
        const title = dto.title || (firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine) || 'Untitled Task';
        const result = await this.prisma.$transaction(async (tx) => {
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
                    priority: client_1.Priority.MEDIUM,
                    type: client_1.TaskType.TASK,
                    source: client_1.TaskSource.STICKY,
                    status: client_1.TaskStatus.TODO,
                    order: new client_1.Prisma.Decimal(nextOrder),
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
    async delete(id) {
        const existing = await this.prisma.sticky.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.STICKY_NOT_FOUND, 'Sticky not found.', 404);
        }
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
};
exports.StickiesService = StickiesService;
exports.StickiesService = StickiesService = StickiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StickiesService);
//# sourceMappingURL=stickies.service.js.map