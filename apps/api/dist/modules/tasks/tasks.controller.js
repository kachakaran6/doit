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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("./tasks.service");
const tasks_dto_1 = require("./tasks.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async createBug(user, projectId, idempotencyKey, dto) {
        return this.tasksService.create(user.sub, {
            title: dto.title || 'Untitled Bug',
            description: dto.description,
            priority: dto.severity === 'CRITICAL' ? 'URGENT' : dto.severity === 'MAJOR' ? 'HIGH' : 'MEDIUM',
            type: 'BUG',
            source: 'BUG',
            projectId,
            dueHasTime: false,
            labelIds: Array.isArray(dto.labelIds) ? dto.labelIds : [],
        }, idempotencyKey);
    }
    async listBugsByProject(projectId, query) {
        return this.tasksService.findAll({ projectId }, { ...query, type: 'BUG' });
    }
    async findOneBug(id) {
        return this.tasksService.findOne(id);
    }
    async updateBug(user, id, dto) {
        if (dto.status) {
            const taskStatus = dto.status === 'RESOLVED' || dto.status === 'VERIFIED'
                ? 'DONE'
                : dto.status === 'IN_PROGRESS'
                    ? 'IN_PROGRESS'
                    : 'TODO';
            return this.tasksService.updateStatus(id, user.sub, { status: taskStatus });
        }
        return this.tasksService.update(id, user.sub, dto);
    }
    async create(user, projectId, idempotencyKey, dto) {
        return this.tasksService.create(user.sub, { ...dto, projectId }, idempotencyKey);
    }
    async listByProject(projectId, query) {
        return this.tasksService.findAll({ projectId }, query);
    }
    async listByWorkspace(workspaceId, query) {
        return this.tasksService.findAll({ workspaceId }, query);
    }
    async findMyDay(user, workspaceId) {
        return this.tasksService.findMyDay(user.sub, workspaceId);
    }
    async findMyDayQuery(user, workspaceId) {
        return this.tasksService.findMyDay(user.sub, workspaceId);
    }
    async findInbox(workspaceId) {
        return this.tasksService.findInbox(workspaceId);
    }
    async findInboxQuery(workspaceId) {
        return this.tasksService.findInbox(workspaceId);
    }
    async findOne(id) {
        return this.tasksService.findOne(id);
    }
    async update(user, id, dto) {
        return this.tasksService.update(id, user.sub, dto);
    }
    async updateStatus(user, id, dto) {
        return this.tasksService.updateStatus(id, user.sub, dto);
    }
    async reorder(id, dto) {
        return this.tasksService.reorder(id, dto);
    }
    async assign(user, id, dto) {
        return this.tasksService.assign(id, user.sub, dto.assigneeId);
    }
    async setLabels(user, id, dto) {
        return this.tasksService.setLabels(id, user.sub, dto.labelIds);
    }
    async delete(user, id) {
        return this.tasksService.delete(id, user.sub);
    }
    async addChecklistItem(id, dto) {
        return this.tasksService.addChecklistItem(id, dto);
    }
    async updateChecklistItem(itemId, dto) {
        return this.tasksService.updateChecklistItem(itemId, dto);
    }
    async deleteChecklistItem(itemId) {
        return this.tasksService.deleteChecklistItem(itemId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)('projects/:projectId/bugs'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bug in a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "createBug", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/bugs'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List bugs in a project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.TaskListQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "listBugsByProject", null);
__decorate([
    (0, common_1.Get)('bugs/:id'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bug details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOneBug", null);
__decorate([
    (0, common_1.Patch)('bugs/:id'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update bug status or details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "updateBug", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/tasks'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new task in a project (idempotent)' }),
    (0, swagger_1.ApiHeader)({ name: 'idempotency-key', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __param(3, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.CreateTaskSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/tasks'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List tasks in a project with filtering & cursor pagination' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.TaskListQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "listByProject", null);
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/tasks'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tasks in a workspace' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.TaskListQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "listByWorkspace", null);
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/tasks/my-day'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List My Day tasks for current user in workspace' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findMyDay", null);
__decorate([
    (0, common_1.Get)('tasks/my-day'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List My Day tasks by query param workspaceId' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findMyDayQuery", null);
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/tasks/inbox'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List Inbox unassigned tasks in workspace' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findInbox", null);
__decorate([
    (0, common_1.Get)('tasks/inbox'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List Inbox tasks by query param workspaceId' }),
    __param(0, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findInboxQuery", null);
__decorate([
    (0, common_1.Get)('tasks/:id'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full task details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('tasks/:id'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task properties' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.UpdateTaskSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('tasks/:id/status'),
    (0, common_1.Patch)('tasks/:id/status'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task status through validated state machine' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.UpdateStatusSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('tasks/:id/reorder'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder task via fractional indexing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.ReorderTaskSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "reorder", null);
__decorate([
    (0, common_1.Post)('tasks/:id/assign'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign task to user or unassign' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.AssignTaskSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('tasks/:id/labels'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Set task labels' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.SetLabelsSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "setLabels", null);
__decorate([
    (0, common_1.Delete)('tasks/:id'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete task' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('tasks/:id/checklist'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an item to task checklist' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.CreateChecklistItemSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addChecklistItem", null);
__decorate([
    (0, common_1.Patch)('checklist/:itemId'),
    (0, common_1.Patch)('tasks/checklist/:itemId'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a checklist item text or completion status' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(tasks_dto_1.UpdateChecklistItemSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Delete)('checklist/:itemId'),
    (0, common_1.Delete)('tasks/checklist/:itemId'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a checklist item' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "deleteChecklistItem", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map