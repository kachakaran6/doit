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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
const email_dto_1 = require("./email.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async getSettings() {
        return this.emailService.getPublicConfig();
    }
    async saveSettings(dto) {
        return this.emailService.saveConfig(dto);
    }
    async testConnection(body) {
        const parsed = body && Object.keys(body).length > 0 ? email_dto_1.SmtpConfigSchema.partial().parse(body) : undefined;
        return this.emailService.testConnection(parsed);
    }
    async sendTest(dto) {
        return this.emailService.sendTestEmail(dto.to, dto.smtp);
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current public SMTP settings (passwords masked)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Save or update SMTP configuration' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(email_dto_1.SmtpConfigSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "saveSettings", null);
__decorate([
    (0, common_1.Post)('test-connection'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Test connection to SMTP server' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('send-test'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Send test email via SMTP' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(email_dto_1.SendTestEmailSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTest", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('Email & SMTP'),
    (0, common_1.Controller)('admin/smtp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map