import { SearchService, highlightSnippet } from './search.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { TaskType, TaskStatus, Priority } from '@prisma/client';

describe('SearchService', () => {
  let service: SearchService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      task: {
        findMany: jest.fn(),
      },
      sticky: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      comment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new SearchService(mockPrisma as unknown as PrismaService);
  });

  describe('highlightSnippet', () => {
    it('should wrap matched terms in <mark> tags', () => {
      const text = 'Login button is unresponsive on slow 3G networks';
      const snippet = highlightSnippet(text, ['login']);
      expect(snippet).toContain('<mark>Login</mark>');
    });

    it('should wrap multiple terms in <mark> tags', () => {
      const text = 'Checkout crash occurs when coupon is applied';
      const snippet = highlightSnippet(text, ['crash', 'coupon']);
      expect(snippet).toContain('<mark>crash</mark>');
      expect(snippet).toContain('<mark>coupon</mark>');
    });
  });

  describe('search execution & operator filtering', () => {
    it('should filter query "login is:bug #crash" for bugs labelled crash with login text', async () => {
      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: 'bug-1',
          number: 10,
          title: 'Login crash on launch',
          description: 'Login screen terminates',
          type: TaskType.BUG,
          status: TaskStatus.TODO,
          priority: Priority.HIGH,
          updatedAt: new Date('2026-10-30T10:00:00Z'),
          project: { key: 'SMP' },
          bug: {
            actual: 'App closes immediately on Login',
            expected: 'Login screen renders',
            severity: 'CRITICAL',
          },
        },
      ]);

      const res = await service.search('user-1', {
        q: 'login is:bug #crash',
        limit: 20,
      });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: TaskType.BUG,
            labels: {
              some: {
                label: {
                  name: { in: ['crash'], mode: 'insensitive' },
                },
              },
            },
          }),
        }),
      );

      expect(res.results.length).toBe(1);
      expect(res.results[0].type).toBe('bug');
      expect(res.results[0].snippet).toContain('<mark>Login</mark>');
    });
  });

  describe('relevance ranking', () => {
    it('should rank exact title match higher than description match', async () => {
      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: 'task-desc',
          number: 1,
          title: 'General overview',
          description: 'Mention of auth inside description',
          type: TaskType.TASK,
          status: TaskStatus.TODO,
          priority: Priority.LOW,
          updatedAt: new Date('2026-10-30T10:00:00Z'),
          project: { key: 'SMP' },
          bug: null,
        },
        {
          id: 'task-exact',
          number: 2,
          title: 'auth',
          description: 'Short task',
          type: TaskType.TASK,
          status: TaskStatus.TODO,
          priority: Priority.HIGH,
          updatedAt: new Date('2026-10-30T09:00:00Z'),
          project: { key: 'SMP' },
          bug: null,
        },
      ]);

      const res = await service.search('user-1', {
        q: 'auth',
        limit: 20,
      });

      expect(res.results[0].id).toBe('task-exact');
      expect(res.results[0].score).toBe(1000); // Exact match
      expect(res.results[1].id).toBe('task-desc');
      expect(res.results[1].score).toBe(200); // Description match
    });
  });
});
