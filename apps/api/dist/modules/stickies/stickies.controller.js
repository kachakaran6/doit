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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stickies_service_1 = require("./stickies.service");
const stickies_dto_1 = require("./stickies.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StickiesController = class StickiesController {
    constructor(stickiesService) {
        this.stickiesService = stickiesService;
    }
    async create(user, projectId, dto) {
        return this.stickiesService.create(projectId, user.sub, dto);
    }
    async findAll(projectId, pinned) {
        const isPinned = pinned !== undefined ? pinned === 'true' : undefined;
        return this.stickiesService.findAll(projectId, isPinned);
    }
    async findOne(id) {
        return this.stickiesService.findOne(id);
    }
    async update(id, dto) {
        return this.stickiesService.update(id, dto);
    }
    async reorder(id, dto) {
        return this.stickiesService.reorder(id, dto);
    }
    async convert(user, id, dto) {
        return this.stickiesService.convert(id, user.sub, dto);
    }
    async delete(id) {
        return this.stickiesService.delete(id);
    }
};
exports.StickiesController = StickiesController;
__decorate([
    (0, common_1.Post)('projects/:projectId/stickies'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a sticky in project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(stickies_dto_1.CreateStickySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/stickies'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List stickies in project (supports ?pinned=true)' }),
    (0, swagger_1.ApiQuery)({ name: 'pinned', required: false, type: Boolean }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('pinned')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stickies/:id'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sticky by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('stickies/:id'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sticky body, color, or pinned status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(stickies_dto_1.UpdateStickySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('stickies/:id/reorder'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder sticky with fractional indexing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(stickies_dto_1.ReorderStickySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Post)('stickies/:id/convert'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert sticky to task (atomic, links both ways)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(stickies_dto_1.ConvertStickySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "convert", null);
__decorate([
    (0, common_1.Delete)('stickies/:id'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete sticky (keeps converted task intact)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StickiesController.prototype, "delete", null);
exports.StickiesController = StickiesController = __decorate([
    (0, swagger_1.ApiTags)('Stickies'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stickies_service_1.StickiesService])
], StickiesController);
//# sourceMappingURL=stickies.controller.js.map