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
        const project = await this.prisma.project.create({
            data: {
                workspaceId,
                name: dto.name,
                key: dto.key,
                description: dto.description,
                color: dto.color,
            },
        });
        return project;
    }
    async findAll(workspaceId) {
        const projects = await this.prisma.project.findMany({
            where: { workspaceId, archivedAt: null },
            orderBy: { createdAt: 'asc' },
            include: {
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
        const updated = await this.prisma.project.update({
            where: { id: projectId },
            data: {
                ...(dto.name ? { name: dto.name } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.color ? { color: dto.color } : {}),
                ...(dto.archived !== undefined
                    ? { archivedAt: dto.archived ? new Date() : null }
                    : {}),
            },
        });
        return updated;
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