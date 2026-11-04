import { TasksService } from './tasks.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { TaskStatus, Priority, TaskType, TaskSource } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(mockPrisma)),
    };
    const mockStorage = { deleteFile: jest.fn(), getSignedUrl: jest.fn(), putFile: jest.fn() } as any;
    service = new TasksService(mockPrisma as unknown as PrismaService, mockStorage);
  });

  describe('create and idempotency', () => {
    it('should create task and increment project task number', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        key: 'SMP',
        workspaceId: 'ws-1',
      });

      mockPrisma.task.findFirst.mockResolvedValue({
        number: 41,
        order: '1000',
      });

      mockPrisma.task.create.mockResolvedValue({
        id: 'task-1',
        number: 42,
        title: 'Fix auth session bug',
        priority: Priority.HIGH,
        type: TaskType.TASK,
        source: TaskSource.MANUAL,
        status: TaskStatus.TODO,
        order: '2000',
        dueAt: null,
        dueHasTime: false,
        createdById: 'user-1',
        assigneeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { key: 'SMP' },
        assignee: null,
        labels: [],
        checklist: [],
        _count: { attachments: 0, comments: 0 },
      });

      const res = await service.create(
        'user-1',
        {
          projectId: 'proj-1',
          title: 'Fix auth session bug',
          priority: 'HIGH',
          type: 'TASK',
          source: 'MANUAL',
          dueHasTime: false,
          labelIds: [],
        },
        'key-123',
      );

      expect(res.isReplay).toBe(false);
      expect((res.task as any).humanId).toBe('SMP-42');
      expect((res.task as any).title).toBe('Fix auth session bug');

      // Now verify idempotency cache returns cached response
      const replayRes = await service.create(
        'user-1',
        {
          projectId: 'proj-1',
          title: 'Fix auth session bug',
          priority: 'HIGH',
          type: 'TASK',
          source: 'MANUAL',
          dueHasTime: false,
          labelIds: [],
        },
        'key-123',
      );

      expect(replayRes.isReplay).toBe(true);
      expect((replayRes.task as any).humanId).toBe('SMP-42');
    });
  });

  describe('status transitions', () => {
    it('should reject invalid transition BLOCKED -> DONE with 422 UNPROCESSABLE', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.BLOCKED,
        project: { workspaceId: 'ws-1', key: 'SMP' },
      });

      try {
        await service.updateStatus('task-1', 'user-1', { status: 'DONE' });
        fail('Expected 422 error');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).httpStatus).toBe(422);
        expect((err as AppError).code).toBe('UNPROCESSABLE');
      }
    });

    it('should allow valid transition IN_PROGRESS -> DONE', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.IN_PROGRESS,
        project: { workspaceId: 'ws-1', key: 'SMP' },
      });

      mockPrisma.task.update.mockResolvedValue({
        id: 'task-1',
        number: 1,
        title: 'Task 1',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        type: TaskType.TASK,
        source: TaskSource.MANUAL,
        order: '1000',
        dueAt: null,
        dueHasTime: false,
        createdById: 'user-1',
        assigneeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { key: 'SMP' },
        assignee: null,
        labels: [],
        checklist: [],
        _count: { attachments: 0, comments: 0 },
      });

      const updated = await service.updateStatus('task-1', 'user-1', { status: 'DONE' });
      expect(updated.status).toBe(TaskStatus.DONE);
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'task.status.changed',
          }),
        }),
      );
    });
  });

  describe('reordering with fractional indexing', () => {
    it('should calculate midpoint between beforeId and afterId', async () => {
      mockPrisma.task.findUnique
        .mockResolvedValueOnce({ id: 'target', order: '1000' }) // target task
        .mockResolvedValueOnce({ id: 'before', order: '1000' }) // before task
        .mockResolvedValueOnce({ id: 'after', order: '2000' }); // after task

      mockPrisma.task.update.mockImplementation(({ data }: any) => ({
        id: 'target',
        order: data.order,
      }));

      const res = await service.reorder('target', {
        beforeId: 'before',
        afterId: 'after',
      });

      expect(res.id).toBe('target');
      expect(Number(res.order)).toBe(1500);
    });
  });
});
