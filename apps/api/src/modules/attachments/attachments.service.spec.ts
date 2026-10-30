import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { QueueService } from '../../infra/queue/queue.service';
import { AppError } from '../../common/errors/app.error';
import { InitUploadSchema } from './attachments.dto';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let mockPrisma: any;
  let mockStorage: any;
  let mockQueue: any;

  beforeEach(() => {
    mockPrisma = {
      attachment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    mockStorage = {
      putObject: jest.fn(),
      getObject: jest.fn(),
      getSignedUrl: jest.fn().mockImplementation((key) => `https://signed.url/${key}`),
      createPresignedPutUrl: jest.fn().mockResolvedValue({
        putUrl: 'https://put.url/upload',
        headers: { 'content-type': 'image/png' },
      }),
      deleteObject: jest.fn().mockResolvedValue(true),
    };
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };
    service = new AttachmentsService(
      mockPrisma as unknown as PrismaService,
      mockStorage as unknown as StorageService,
      mockQueue as unknown as QueueService,
    );
  });

  describe('size validation', () => {
    it('should reject 13 MB image with 413 PAYLOAD_TOO_LARGE before any bytes move', async () => {
      const thirteenMb = 13 * 1024 * 1024;

      // Check Zod schema rejection
      const schemaCheck = InitUploadSchema.safeParse({
        contentType: 'image/png',
        sizeBytes: thirteenMb,
        purpose: 'TASK',
      });
      expect(schemaCheck.success).toBe(false);

      // Check Service method rejection
      try {
        await service.initUpload('user-1', {
          contentType: 'image/png',
          sizeBytes: thirteenMb,
          purpose: 'TASK',
        });
        fail('Expected 413 error');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.httpStatus).toBe(413);
        expect(appErr.code).toBe('PAYLOAD_TOO_LARGE');
      }
    });

    it('should allow image within limit (e.g. 5 MB)', async () => {
      const fiveMb = 5 * 1024 * 1024;
      const res = await service.initUpload('user-1', {
        contentType: 'image/png',
        sizeBytes: fiveMb,
        purpose: 'TASK',
      });

      expect(res.uploadId).toBeDefined();
      expect(res.putUrl).toBe('https://put.url/upload');
    });
  });

  describe('magic byte sniffing and spoofing detection', () => {
    it('should reject a .png that is actually a PDF with 422 UNPROCESSABLE', async () => {
      // 1. Init upload as PNG
      const initRes = await service.initUpload('user-1', {
        contentType: 'image/png',
        sizeBytes: 1024,
        purpose: 'TASK',
      });

      // 2. Storage returns PDF magic bytes (%PDF)
      const pdfBuffer = Buffer.from('%PDF-1.4 mock content');
      mockStorage.getObject.mockResolvedValue(pdfBuffer);

      // 3. Complete upload should fail
      try {
        await service.completeUpload(initRes.uploadId, 'user-1', {
          taskId: 'a0000000-0000-0000-0000-000000000001',
        });
        fail('Expected 422 error');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.httpStatus).toBe(422);
        expect(appErr.code).toBe('UNPROCESSABLE');
      }
    });

    it('should accept valid PNG with genuine magic bytes and queue thumbnail', async () => {
      const initRes = await service.initUpload('user-1', {
        contentType: 'image/png',
        sizeBytes: 1024,
        purpose: 'TASK',
      });

      // Genuine PNG header [137, 80, 78, 71, 13, 10, 26, 10]
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      mockStorage.getObject.mockResolvedValue(pngBuffer);

      mockPrisma.attachment.create.mockResolvedValue({
        id: 'att-1',
        taskId: 'a0000000-0000-0000-0000-000000000001',
        kind: 'IMAGE',
        storageKey: initRes.storageKey,
        mimeType: 'image/png',
        sizeBytes: pngBuffer.length,
        thumbKey: `${initRes.storageKey}.thumb.jpg`,
      });

      const completed = await service.completeUpload(initRes.uploadId, 'user-1', {
        taskId: 'a0000000-0000-0000-0000-000000000001',
      });

      expect(completed.id).toBe('att-1');
      expect(completed.thumbUrl).toBeDefined();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'generate-thumbnail',
        expect.objectContaining({
          attachmentId: 'att-1',
          storageKey: initRes.storageKey,
        }),
      );
    });
  });

  describe('task attachments deletion', () => {
    it('should queue background deletion of all storage objects when task is deleted', async () => {
      mockPrisma.attachment.findMany.mockResolvedValue([
        { id: 'att-1', storageKey: 'uploads/att1.png', thumbKey: 'uploads/att1.png.thumb.jpg' },
        { id: 'att-2', storageKey: 'uploads/att2.mp4', thumbKey: 'uploads/att2.mp4.thumb.jpg' },
      ]);
      mockPrisma.attachment.deleteMany.mockResolvedValue({ count: 2 });

      const res = await service.deleteTaskAttachments('task-1');
      expect(res.count).toBe(2);
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'delete-storage-object',
        expect.objectContaining({
          storageKey: 'uploads/att1.png',
        }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'delete-storage-object',
        expect.objectContaining({
          storageKey: 'uploads/att2.mp4',
        }),
      );
    });
  });
});
