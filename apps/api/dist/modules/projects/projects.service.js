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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(workspaceId, dto) {
        const existing = await this.prisma.project.findUnique({
            where: {
                workspaceId_key: {
                    workspaceId,
                    key: dto.key,
                },
            },
        });
        if (existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, `Project key '${dto.key}' already exists in this workspace.`, 409, [{ field: 'key', issue: 'duplicate_key' }]);
        }
        if (dto.defaultAssigneeId) {
            const isMember = await this.prisma.membership.findFirst({
                where: { workspaceId, userId: dto.defaultAssigneeId },
            });
            if (!isMember) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, 'Default assignee must be a member of the workspace.', 400);
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
    async findAll(workspaceId) {
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
    async findOne(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
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
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
        }
        return project;
    }
    async update(projectId, dto) {
        const existing = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
        }
        if (dto.defaultAssigneeId) {
            const isMember = await this.prisma.membership.findFirst({
                where: { workspaceId: existing.workspaceId, userId: dto.defaultAssigneeId },
            });
            if (!isMember) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, 'Default assignee must be a member of the workspace.', 400);
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
    async getProjectMembers(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
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
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND, 'Project not found.', 404);
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
    async delete(projectId) {
        await this.prisma.project.delete({
            where: { id: projectId },
        });
        return { success: true };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map