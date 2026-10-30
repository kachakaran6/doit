import { StickiesService } from './stickies.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { CreateStickySchema } from './stickies.dto';
import { AccentName } from '@prisma/client';

describe('StickiesService', () => {
  let service: StickiesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
      },
      sticky: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (arg) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        return arg(mockPrisma);
      }),
    };
    service = new StickiesService(mockPrisma as unknown as PrismaService);
  });

  describe('validation', () => {
    it('should reject body over 5000 chars with zod validation', () => {
      const longBody = 'a'.repeat(5001);
      const res = CreateStickySchema.safeParse({
        body: longBody,
        color: 'AMBER',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('5000');
      }
    });

    it('should accept valid body under 5000 chars', () => {
      const validBody = 'Short reminder note';
      const res = CreateStickySchema.safeParse({
        body: validBody,
        color: 'AMBER',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('convert to task', () => {
    it('should create task, link both ways atomically, and reject 2nd convert with 409', async () => {
      mockPrisma.sticky.findUnique.mockResolvedValue({
        id: 'sticky-1',
        projectId: 'proj-1',
        body: 'Important feature notes\nSecond line',
        color: AccentName.AMBER,
        convertedTaskId: null,
        project: { workspaceId: 'ws-1' },
      });

      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        workspaceId: 'ws-1',
      });

      mockPrisma.task.findFirst.mockResolvedValue({
        number: 5,
        order: '1000',
      });

      mockPrisma.task.create.mockResolvedValue({
        id: 'task-new-1',
        number: 6,
        title: 'Important feature notes',
        description: 'Important feature notes\nSecond line',
        convertedFromStickyId: 'sticky-1',
      });

      mockPrisma.sticky.update.mockResolvedValue({
        id: 'sticky-1',
        convertedTaskId: 'task-new-1',
      });

      const res = await service.convert('sticky-1', 'user-1', {});
      expect(res.task.id).toBe('task-new-1');
      expect(res.sticky.convertedTaskId).toBe('task-new-1');
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            convertedFromStickyId: 'sticky-1',
            source: 'STICKY',
          }),
        }),
      );

      // Verify second convert attempt throws 409 CONFLICT with existing task id in details
      mockPrisma.sticky.findUnique.mockResolvedValue({
        id: 'sticky-1',
        projectId: 'proj-1',
        body: 'Important feature notes',
        convertedTaskId: 'task-new-1',
        project: { workspaceId: 'ws-1' },
      });

      try {
        await service.convert('sticky-1', 'user-1', {});
        fail('Expected 409 conflict');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.httpStatus).toBe(409);
        expect(appErr.code).toBe('CONFLICT');
        expect(appErr.details).toEqual([
          { field: 'convertedTaskId', issue: 'task-new-1' },
        ]);
      }
    });
  });

  describe('delete', () => {
    it('should delete sticky and update task convertedFromStickyId to null in a transaction', async () => {
      mockPrisma.sticky.findUnique.mockResolvedValue({
        id: 'sticky-1',
      });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.sticky.delete.mockResolvedValue({ id: 'sticky-1' });

      const res = await service.delete('sticky-1');
      expect(res.success).toBe(true);
      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
        where: { convertedFromStickyId: 'sticky-1' },
        data: { convertedFromStickyId: null },
      });
      expect(mockPrisma.sticky.delete).toHaveBeenCalledWith({
        where: { id: 'sticky-1' },
      });
    });
  });

  describe('reordering with fractional indexing', () => {
    it('should compute stable midpoint between before and after', async () => {
      mockPrisma.sticky.findUnique
        .mockResolvedValueOnce({ id: 'target', order: '1000' })
        .mockResolvedValueOnce({ id: 'before', order: '1000' })
        .mockResolvedValueOnce({ id: 'after', order: '3000' });

      mockPrisma.sticky.update.mockImplementation(({ data }: any) => ({
        id: 'target',
        order: data.order,
      }));

      const res = await service.reorder('target', {
        beforeId: 'before',
        afterId: 'after',
      });

      expect(res.id).toBe('target');
      expect(Number(res.order)).toBe(2000);
    });
  });
});
