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
var LabelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let LabelsService = LabelsService_1 = class LabelsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LabelsService_1.name);
    }
    async create(workspaceId, dto) {
        const existing = await this.prisma.label.findFirst({
            where: {
                workspaceId,
                name: { equals: dto.name.trim(), mode: 'insensitive' },
            },
        });
        if (existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, `Label '${dto.name}' already exists in this workspace (case-insensitive duplicate).`, 409);
        }
        const label = await this.prisma.label.create({
            data: {
                workspaceId,
                name: dto.name.trim(),
                color: dto.color || client_1.AccentName.INDIGO,
            },
        });
        return label;
    }
    async findAll(workspaceId) {
        return this.prisma.label.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });
    }
    async findOne(id) {
        const label = await this.prisma.label.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });
        if (!label) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
        }
        return label;
    }
    async update(id, dto) {
        const existing = await this.prisma.label.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
        }
        if (dto.name && dto.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
            const duplicate = await this.prisma.label.findFirst({
                where: {
                    workspaceId: existing.workspaceId,
                    name: { equals: dto.name.trim(), mode: 'insensitive' },
                    id: { not: id },
                },
            });
            if (duplicate) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, `Label '${dto.name}' already exists in this workspace.`, 409);
            }
        }
        const updated = await this.prisma.label.update({
            where: { id },
            data: {
                ...(dto.name ? { name: dto.name.trim() } : {}),
                ...(dto.color ? { color: dto.color } : {}),
            },
        });
        return updated;
    }
    async delete(id) {
        const existing = await this.prisma.label.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.LABEL_NOT_FOUND, 'Label not found.', 404);
        }
        await this.prisma.label.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.LabelsService = LabelsService;
exports.LabelsService = LabelsService = LabelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LabelsService);
//# sourceMappingURL=labels.service.js.map