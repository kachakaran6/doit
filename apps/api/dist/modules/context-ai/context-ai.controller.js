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
exports.ContextAiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const context_ai_service_1 = require("./context-ai.service");
const ContextSchema = zod_1.z.object({
    markdown: zod_1.z.string(),
    version: zod_1.z.number().int().nonnegative().optional(),
});
const PrefsSchema = zod_1.z.object({
    workspaceId: zod_1.z.string().uuid(),
    defaultProjectId: zod_1.z.string().uuid().nullable().optional(),
    defaultLabelIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    rememberLastProject: zod_1.z.boolean().optional(),
    showProjectSelector: zod_1.z.boolean().optional(),
    labelsExpanded: zod_1.z.boolean().optional(),
    lastProjectId: zod_1.z.string().uuid().nullable().optional(),
});
const CredentialSchema = zod_1.z.object({
    apiKey: zod_1.z.string().min(8).optional(),
    model: zod_1.z.string().min(1, 'Model is required'),
    enabled: zod_1.z.boolean().optional(),
});
const GenerateSchema = zod_1.z.object({
    selectedAttachmentIds: zod_1.z.array(zod_1.z.string().uuid()).max(6).optional(),
    force: zod_1.z.boolean().optional(),
    useTemplate: zod_1.z.boolean().optional(),
    idempotencyKey: zod_1.z.string().min(8).max(80).optional(),
});
const UpdatePromptSchema = zod_1.z.object({
    promptMarkdown: zod_1.z.string().min(1),
});
let ContextAiController = class ContextAiController {
    constructor(service) {
        this.service = service;
    }
    getContext(user, projectId) {
        return this.service.getContext(user.sub, projectId);
    }
    putContext(user, projectId, body) {
        return this.service.putContext(user.sub, projectId, body.markdown, body.version);
    }
    getPrefs(user, workspaceId) {
        return this.service.getCapturePrefs(user.sub, workspaceId);
    }
    putPrefs(user, body) {
        return this.service.putCapturePrefs(user.sub, body);
    }
    listProviders(user) {
        return this.service.listCredentials(user.sub);
    }
    saveProvider(user, provider, body) {
        return this.service.saveCredential(user.sub, provider, body);
    }
    testProvider(user, provider) {
        return this.service.testCredential(user.sub, provider);
    }
    deleteProvider(user, provider) {
        return this.service.deleteCredential(user.sub, provider);
    }
    listPrompts(user, taskId) {
        return this.service.listPrompts(user.sub, taskId);
    }
    generate(user, taskId, body) {
        return this.service.generate(user.sub, taskId, body);
    }
    updatePrompt(user, promptId, body) {
        return this.service.updatePrompt(user.sub, promptId, body.promptMarkdown);
    }
    regenerate(user, promptId, body) {
        return this.service.regenerate(user.sub, promptId, body);
    }
};
exports.ContextAiController = ContextAiController;
__decorate([
    (0, common_1.Get)('projects/:projectId/context'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Markdown project context' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "getContext", null);
__decorate([
    (0, common_1.Put)('projects/:projectId/context'),
    (0, swagger_1.ApiOperation)({ summary: 'Save Markdown project context' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ContextSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "putContext", null);
__decorate([
    (0, common_1.Get)('me/quick-capture-preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick capture defaults for a workspace' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "getPrefs", null);
__decorate([
    (0, common_1.Put)('me/quick-capture-preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Save quick capture defaults' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(PrefsSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "putPrefs", null);
__decorate([
    (0, common_1.Get)('me/ai-providers'),
    (0, swagger_1.ApiOperation)({ summary: 'List personal AI providers without secrets' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "listProviders", null);
__decorate([
    (0, common_1.Put)('me/ai-providers/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Save a personal AI provider key' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('provider')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(CredentialSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "saveProvider", null);
__decorate([
    (0, common_1.Post)('me/ai-providers/:provider/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test a saved AI provider key' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "testProvider", null);
__decorate([
    (0, common_1.Delete)('me/ai-providers/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a personal AI provider key' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "deleteProvider", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/solution-prompts'),
    (0, swagger_1.ApiOperation)({ summary: 'List solution prompts for a task' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "listPrompts", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/solution-prompts/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Assemble or generate a solution prompt' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(GenerateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "generate", null);
__decorate([
    (0, common_1.Patch)('solution-prompts/:promptId'),
    (0, swagger_1.ApiOperation)({ summary: 'Save a manual edit of a solution prompt' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('promptId')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(UpdatePromptSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "updatePrompt", null);
__decorate([
    (0, common_1.Post)('solution-prompts/:promptId/regenerate'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate a solution prompt from the current task' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('promptId')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(GenerateSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", void 0)
], ContextAiController.prototype, "regenerate", null);
exports.ContextAiController = ContextAiController = __decorate([
    (0, swagger_1.ApiTags)('Context and AI'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    __metadata("design:paramtypes", [context_ai_service_1.ContextAiService])
], ContextAiController);
//# sourceMappingURL=context-ai.controller.js.map