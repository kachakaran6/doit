import { Injectable, Logger } from '@nestjs/common';
import { AttachmentKind } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { QueueService } from '../../infra/queue/queue.service';
import {
  InitUploadDto,
  CompleteUploadDto,
  getMimeKind,
  getMaxBytesForMime,
} from './attachments.dto';
import { validateMagicBytes } from './magic-bytes';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

export interface UploadSession {
  uploadId: string;
  userId: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  expiresAt: Date;
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly sessions = new Map<string, UploadSession>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
  ) {}

  async initUpload(userId: string, dto: InitUploadDto) {
    const maxAllowed = getMaxBytesForMime(dto.contentType);
    if (dto.sizeBytes > maxAllowed) {
      throw new AppError(
        ErrorCode.PAYLOAD_TOO_LARGE,
        `File size (${dto.sizeBytes} bytes) exceeds limit of ${maxAllowed} bytes for ${dto.contentType}.`,
        413,
      );
    }

    const uploadId = uuidv4();
    const ext = dto.contentType.split('/')[1] || 'bin';
    const storageKey = `uploads/${userId}/${uploadId}.${ext}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const presigned = await this.storage.createPresignedPutUrl(
      storageKey,
      dto.contentType,
      900,
    );

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

  async directPut(storageKey: string, buffer: Buffer, mimeType: string) {
    return this.storage.putObject(storageKey, buffer, mimeType);
  }

  async completeUpload(uploadId: string, userId: string, dto: CompleteUploadDto) {
    const session = this.sessions.get(uploadId);
    if (!session) {
      throw new AppError(ErrorCode.UPLOAD_NOT_FOUND, 'Upload session not found or expired.', 404);
    }

    if (session.expiresAt.getTime() < Date.now()) {
      this.sessions.delete(uploadId);
      throw new AppError(ErrorCode.UPLOAD_NOT_FOUND, 'Upload session expired.', 404);
    }

    const buffer = await this.storage.getObject(session.storageKey);
    if (!buffer) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Uploaded file not found in storage.', 404);
    }

    // Sniff magic bytes and reject mismatch with 422 UNPROCESSABLE
    const isValid = validateMagicBytes(session.contentType, buffer);
    if (!isValid) {
      throw new AppError(
        ErrorCode.UNPROCESSABLE,
        `MIME spoofing detected: file content does not match declared contentType '${session.contentType}'.`,
        422,
        [{ field: 'contentType', issue: 'magic_byte_mismatch' }],
      );
    }

    const kind = getMimeKind(session.contentType) as AttachmentKind;

    let finalTaskId = dto.taskId;
    let finalBugId = dto.bugId;

    if (finalBugId && !finalTaskId) {
      const existingTask = await (this.prisma as any).task?.findUnique({ where: { id: finalBugId } });
      if (existingTask) {
        finalTaskId = finalBugId;
        finalBugId = undefined;
      }
    }

    if (finalTaskId && !finalBugId) {
      const existingTask = await (this.prisma as any).task?.findUnique({ where: { id: finalTaskId } });
      if (!existingTask) {
        const existingBug = await (this.prisma as any).bugReport?.findUnique({ where: { id: finalTaskId } });
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

    // Queue thumbnail worker job for image/video
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
      thumbUrl,
    };
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new AppError(ErrorCode.ATTACHMENT_NOT_FOUND, 'Attachment not found.', 404);
    }

    const [url, thumbUrl] = await Promise.all([
      this.storage.getSignedUrl(attachment.storageKey, 3600),
      attachment.thumbKey ? this.storage.getSignedUrl(attachment.thumbKey, 3600) : Promise.resolve(null),
    ]);

    return {
      ...attachment,
      url,
      thumbUrl,
    };
  }

  async delete(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new AppError(ErrorCode.ATTACHMENT_NOT_FOUND, 'Attachment not found.', 404);
    }

    // Queue storage object deletion via worker
    await this.queue.add('delete-storage-object', {
      storageKey: attachment.storageKey,
      thumbKey: attachment.thumbKey,
    });

    await this.prisma.attachment.delete({
      where: { id },
    });

    return { success: true };
  }

  async deleteTaskAttachments(taskId: string) {
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
}
