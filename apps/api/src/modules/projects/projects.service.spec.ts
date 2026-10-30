import { ProjectsService } from './projects.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockPrisma: {
    project: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new ProjectsService(mockPrisma as unknown as PrismaService);
  });

  it('should detect project key collisions and throw 409 CONFLICT', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      key: 'MOB',
      workspaceId: 'ws-1',
    });

    try {
      await service.create('ws-1', {
        name: 'Mobile Duplicate',
        key: 'MOB',
        color: 'INDIGO',
      });
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.CONFLICT);
      expect((err as AppError).httpStatus).toBe(409);
    }
  });

  it('should successfully create project with valid key', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    mockPrisma.project.create.mockResolvedValue({
      id: 'proj-new',
      name: 'Mobile New',
      key: 'SMP',
      color: 'INDIGO',
    });

    const project = await service.create('ws-1', {
      name: 'Mobile New',
      key: 'SMP',
      color: 'INDIGO',
    });

    expect(project.id).toBe('proj-new');
    expect(mockPrisma.project.create).toHaveBeenCalled();
  });
});
