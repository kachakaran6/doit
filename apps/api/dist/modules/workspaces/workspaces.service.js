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
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let WorkspacesService = class WorkspacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        let baseSlug = (dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'ws';
        if (baseSlug.length > 20)
            baseSlug = baseSlug.slice(0, 20);
        let slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        let existing = await this.prisma.workspace.findUnique({ where: { slug } });
        while (existing) {
            slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
            existing = await this.prisma.workspace.findUnique({ where: { slug } });
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
                projects: {
                    create: {
                        name: 'General',
                        key: 'GEN',
                    },
                },
            },
            include: {
                memberships: true,
                projects: true,
                _count: {
                    select: {
                        projects: true,
                        memberships: true,
                    },
                },
            },
        });
        return { ...workspace, role: 'OWNER' };
    }
    async findAll(userId) {
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
    async findOne(workspaceId) {
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
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.WORKSPACE_NOT_FOUND, 'Workspace not found.', 404);
        }
        return workspace;
    }
    async update(workspaceId, dto) {
        const updated = await this.prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...(dto.name ? { name: dto.name } : {}),
            },
        });
        return updated;
    }
    async delete(workspaceId) {
        await this.prisma.workspace.delete({
            where: { id: workspaceId },
        });
        return { success: true };
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map