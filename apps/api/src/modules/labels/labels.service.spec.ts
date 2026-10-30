import { LabelsService } from './labels.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { AccentName } from '@prisma/client';

describe('LabelsService', () => {
  let service: LabelsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      label: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new LabelsService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should throw 409 CONFLICT when creating a label with existing name in different case', async () => {
      mockPrisma.label.findFirst.mockResolvedValue({
        id: 'label-1',
        workspaceId: 'ws-1',
        name: 'Urgent',
        color: AccentName.ROSE,
      });

      try {
        await service.create('ws-1', {
          name: 'uRgEnT',
          color: 'ROSE',
        });
        fail('Expected 409 conflict');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).httpStatus).toBe(409);
        expect((err as AppError).code).toBe('CONFLICT');
      }
    });

    it('should create a label if no duplicate exists', async () => {
      mockPrisma.label.findFirst.mockResolvedValue(null);
      mockPrisma.label.create.mockResolvedValue({
        id: 'label-new',
        workspaceId: 'ws-1',
        name: 'Frontend',
        color: AccentName.TEAL,
      });

      const label = await service.create('ws-1', {
        name: 'Frontend',
        color: 'TEAL',
      });

      expect(label.id).toBe('label-new');
      expect(mockPrisma.label.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws-1',
          name: 'Frontend',
          color: AccentName.TEAL,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete the label and cascade detaching from tasks in one statement', async () => {
      mockPrisma.label.findUnique.mockResolvedValue({
        id: 'label-1',
        workspaceId: 'ws-1',
        name: 'Frontend',
      });
      mockPrisma.label.delete.mockResolvedValue({ id: 'label-1' });

      const res = await service.delete('label-1');
      expect(res.success).toBe(true);
      expect(mockPrisma.label.delete).toHaveBeenCalledWith({
        where: { id: 'label-1' },
      });
    });
  });
});
