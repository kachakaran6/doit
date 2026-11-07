import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { QueueService } from '../../infra/queue/queue.service';
import { InitUploadDto, CompleteUploadDto } from './attachments.dto';
export interface UploadSession {
    uploadId: string;
    userId: string;
    contentType: string;
    sizeBytes: number;
    storageKey: string;
    expiresAt: Date;
}
export declare class AttachmentsService {
    private readonly prisma;
    private readonly storage;
    private readonly queue;
    private readonly logger;
    private readonly sessions;
    constructor(prisma: PrismaService, storage: StorageService, queue: QueueService);
    initUpload(userId: string, dto: InitUploadDto): Promise<{
        uploadId: string;
        putUrl: string;
        storageKey: string;
        expiresAt: string;
        headers: Record<string, string>;
    }>;
    directPut(storageKey: string, buffer: Buffer, mimeType: string): Promise<string>;
    completeUpload(uploadId: string, userId: string, dto: CompleteUploadDto): Promise<{
        url: string;
        thumbUrl: string;
        id: string;
        createdAt: Date;
        taskId: string | null;
        bugId: string | null;
        commentId: string | null;
        kind: import(".prisma/client").$Enums.AttachmentKind;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        width: number | null;
        height: number | null;
        durationMs: number | null;
        thumbKey: string | null;
    }>;
    findOne(id: string): Promise<{
        url: string;
        thumbUrl: string;
        id: string;
        createdAt: Date;
        taskId: string | null;
        bugId: string | null;
        commentId: string | null;
        kind: import(".prisma/client").$Enums.AttachmentKind;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        width: number | null;
        height: number | null;
        durationMs: number | null;
        thumbKey: string | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    deleteTaskAttachments(taskId: string): Promise<{
        count: number;
    }>;
}
