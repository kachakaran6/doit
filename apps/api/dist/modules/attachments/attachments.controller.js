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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attachments_service_1 = require("./attachments.service");
const attachments_dto_1 = require("./attachments.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AttachmentsController = class AttachmentsController {
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    async initUpload(user, dto) {
        return this.attachmentsService.initUpload(user.sub, dto);
    }
    async directPut(key, contentType, req) {
        let rawBuffer;
        if (req.rawBody && req.rawBody.length > 0) {
            rawBuffer = req.rawBody;
        }
        else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
            rawBuffer = req.body;
        }
        else if (Buffer.isBuffer(req.body)) {
            rawBuffer = req.body;
        }
        else {
            rawBuffer = await new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                req.on('end', () => resolve(Buffer.concat(chunks)));
                req.on('error', reject);
            });
        }
        return this.attachmentsService.directPut(decodeURIComponent(key), rawBuffer, contentType || 'application/octet-stream');
    }
    async completeUpload(user, uploadId, dto) {
        return this.attachmentsService.completeUpload(uploadId, user.sub, dto);
    }
    async findOne(id) {
        return this.attachmentsService.findOne(id);
    }
    async delete(id) {
        return this.attachmentsService.delete(id);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Post)('uploads/init'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate 3-step resumable upload (returns presigned PUT URL valid 15m)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(attachments_dto_1.InitUploadSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "initUpload", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Put)('uploads/raw/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Direct PUT endpoint for local dev driver' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Headers)('content-type')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "directPut", null);
__decorate([
    (0, common_1.Post)('uploads/:id/complete'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete upload: sniff magic bytes, verify existence, write row, queue thumbnail' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(attachments_dto_1.CompleteUploadSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)('attachments/:id'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attachment details and short-lived signed URLs' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)('attachments/:id'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete attachment and queue background storage deletion' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "delete", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, swagger_1.ApiTags)('Uploads & Attachments'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map