import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../infra/prisma/prisma.service';
import { StorageService } from '../infra/storage/storage.service';
import { QueueService } from '../infra/queue/queue.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockPrisma = { isHealthy: jest.fn().mockResolvedValue(true) };
  const mockStorage = { isHealthy: jest.fn().mockResolvedValue(true) };
  const mockQueue = { isHealthy: jest.fn().mockResolvedValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
        { provide: QueueService, useValue: mockQueue },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status ok', () => {
    const res = controller.getHealth();
    expect(res.status).toBe('ok');
    expect(res.version).toBe('0.1.0');
    expect(typeof res.uptime).toBe('number');
  });

  it('should return readiness with all components up', async () => {
    const ready = await controller.getReadiness();
    expect(ready).toEqual({
      db: 'up',
      storage: 'up',
      queue: 'up',
    });
  });
});
