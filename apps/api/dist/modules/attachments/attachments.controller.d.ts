import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { AttachmentsService } from './attachments.service';
import { InitUploadDto, CompleteUploadDto } from './attachments.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    initUpload(user: AuthUserPayload, dto: InitUploadDto): Promise<{
        uploadId: string;
        putUrl: string;
        storageKey: string;
        expiresAt: string;
        headers: Record<string, string>;
    }>;
    directPut(key: string, contentType: string, req: RawBodyRequest<Request>): Promise<string>;
    completeUpload(user: AuthUserPayload, uploadId: string, dto: CompleteUploadDto): Promise<{
        url: string;
        thumbUrl: string | null;
        sizeBytes: number;
        taskId: string | null;
        bugId: string | null;
        commentId: string | null;
        width: number | null;
        height: number | null;
        durationMs: number | null;
        id: string;
        kind: import(".prisma/client").$Enums.AttachmentKind;
        storageKey: string;
        mimeType: string;
        thumbKey: string | null;
        createdAt: Date;
    }>;
    findOne(id: string): Promise<{
        url: string;
        thumbUrl: string | null;
        sizeBytes: number;
        taskId: string | null;
        bugId: string | null;
        commentId: string | null;
        width: number | null;
        height: number | null;
        durationMs: number | null;
        id: string;
        kind: import(".prisma/client").$Enums.AttachmentKind;
        storageKey: string;
        mimeType: string;
        thumbKey: string | null;
        createdAt: Date;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
