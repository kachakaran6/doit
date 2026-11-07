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
var AttachmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const storage_service_1 = require("../../infra/storage/storage.service");
const queue_service_1 = require("../../infra/queue/queue.service");
const attachments_dto_1 = require("./attachments.dto");
const magic_bytes_1 = require("./magic-bytes");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let AttachmentsService = AttachmentsService_1 = class AttachmentsService {
    constructor(prisma, storage, queue) {
        this.prisma = prisma;
        this.storage = storage;
        this.queue = queue;
        this.logger = new common_1.Logger(AttachmentsService_1.name);
        this.sessions = new Map();
    }
    async initUpload(userId, dto) {
        const maxAllowed = (0, attachments_dto_1.getMaxBytesForMime)(dto.contentType);
        if (dto.sizeBytes > maxAllowed) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.PAYLOAD_TOO_LARGE, `File size (${dto.sizeBytes} bytes) exceeds limit of ${maxAllowed} bytes for ${dto.contentType}.`, 413);
        }
        const uploadId = (0, uuid_1.v4)();
        const ext = dto.contentType.split('/')[1] || 'bin';
        const storageKey = `uploads/${userId}/${uploadId}.${ext}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const presigned = await this.storage.createPresignedPutUrl(storageKey, dto.contentType, 900);
        this.sessions.set(uploadId, {
            uploadId,
            userId,
            contentType: dto.contentType,
            sizeBytes: dto.sizeBytes,
            storageKey,
            expiresAt,
        });
        return {
            uploadId,
            putUrl: presigned.putUrl,
            storageKey,
            expiresAt: expiresAt.toISOString(),
            headers: presigned.headers,
        };
    }
    async directPut(storageKey, buffer, mimeType) {
        return this.storage.putObject(storageKey, buffer, mimeType);
    }
    async completeUpload(uploadId, userId, dto) {
        const session = this.sessions.get(uploadId);
        if (!session) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UPLOAD_NOT_FOUND, 'Upload session not found or expired.', 404);
        }
        if (session.expiresAt.getTime() < Date.now()) {
            this.sessions.delete(uploadId);
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UPLOAD_NOT_FOUND, 'Upload session expired.', 404);
        }
        const buffer = await this.storage.getObject(session.storageKey);
        if (!buffer) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Uploaded file not found in storage.', 404);
        }
        const isValid = (0, magic_bytes_1.validateMagicBytes)(session.contentType, buffer);
        if (!isValid) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, `MIME spoofing detected: file content does not match declared contentType '${session.contentType}'.`, 422, [{ field: 'contentType', issue: 'magic_byte_mismatch' }]);
        }
        const kind = (0, attachments_dto_1.getMimeKind)(session.contentType);
        let finalTaskId = dto.taskId;
        let finalBugId = dto.bugId;
        if (finalBugId && !finalTaskId) {
            const existingTask = await this.prisma.task?.findUnique({ where: { id: finalBugId } });
            if (existingTask) {
                finalTaskId = finalBugId;
                finalBugId = undefined;
            }
        }
        if (finalTaskId && !finalBugId) {
            const existingTask = await this.prisma.task?.findUnique({ where: { id: finalTaskId } });
            if (!existingTask) {
                const existingBug = await this.prisma.bugReport?.findUnique({ where: { id: finalTaskId } });
                if (existingBug) {
                    finalBugId = finalTaskId;
                    finalTaskId = undefined;
                }
            }
        }
        const attachment = await this.prisma.attachment.create({
            data: {
                taskId: finalTaskId || null,
                bugId: finalBugId || null,
                commentId: dto.commentId || null,
                kind,
                storageKey: session.storageKey,
                mimeType: session.contentType,
                sizeBytes: buffer.length,
                width: dto.width || null,
                height: dto.height || null,
                durationMs: dto.durationMs || null,
                thumbKey: kind === 'IMAGE' || kind === 'VIDEO' ? `${session.storageKey}.thumb.jpg` : null,
            },
        });
        if (kind === 'IMAGE' || kind === 'VIDEO') {
            await this.queue.add('generate-thumbnail', {
                attachmentId: attachment.id,
                storageKey: session.storageKey,
                mimeType: session.contentType,
            });
        }
        this.sessions.delete(uploadId);
        const [url, thumbUrl] = await Promise.all([
            this.storage.getSignedUrl(attachment.storageKey, 3600),
            attachment.thumbKey ? this.storage.getSignedUrl(attachment.thumbKey, 3600) : Promise.resolve(null),
        ]);
        return {
            ...attachment,
            url,
            thumbUrl: thumbUrl || url,
        };
    }
    async findOne(id) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id },
        });
        if (!attachment) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.ATTACHMENT_NOT_FOUND, 'Attachment not found.', 404);
        }
        const [url, thumbUrl] = await Promise.all([
            this.storage.getSignedUrl(attachment.storageKey, 3600),
            attachment.thumbKey ? this.storage.getSignedUrl(attachment.thumbKey, 3600) : Promise.resolve(null),
        ]);
        return {
            ...attachment,
            url,
            thumbUrl: thumbUrl || url,
        };
    }
    async delete(id) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id },
        });
        if (!attachment) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.ATTACHMENT_NOT_FOUND, 'Attachment not found.', 404);
        }
        await this.queue.add('delete-storage-object', {
            storageKey: attachment.storageKey,
            thumbKey: attachment.thumbKey,
        });
        await this.prisma.attachment.delete({
            where: { id },
        });
        return { success: true };
    }
    async deleteTaskAttachments(taskId) {
        const attachments = await this.prisma.attachment.findMany({
            where: { taskId },
        });
        for (const att of attachments) {
            await this.queue.add('delete-storage-object', {
                storageKey: att.storageKey,
                thumbKey: att.thumbKey,
            });
        }
        await this.prisma.attachment.deleteMany({
            where: { taskId },
        });
        return { count: attachments.length };
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = AttachmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        queue_service_1.QueueService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map