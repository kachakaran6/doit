import { MembersService } from './members.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

describe('MembersService', () => {
  let service: MembersService;
  let mockPrisma: {
    membership: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      membership: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    service = new MembersService(mockPrisma as unknown as PrismaService);
  });

  it('should throw 409 CONFLICT if user already invited or member', async () => {
    mockPrisma.membership.findFirst.mockResolvedValue({ id: 'mem-1' });

    try {
      await service.inviteMember('ws-1', {
        email: 'alice@samyukt.com',
        role: 'TESTER',
      });
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.CONFLICT);
      expect((err as AppError).httpStatus).toBe(409);
    }
  });

  it('should prevent deleting the workspace owner', async () => {
    mockPrisma.membership.findFirst.mockResolvedValue({
      id: 'mem-owner',
      workspaceId: 'ws-1',
      role: 'OWNER',
    });

    try {
      await service.removeMember('ws-1', 'mem-owner');
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.FORBIDDEN);
      expect((err as AppError).httpStatus).toBe(403);
    }
  });
});
