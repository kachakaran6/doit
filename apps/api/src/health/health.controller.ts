import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';
import { PrismaService } from '../infra/prisma/prisma.service';
import { StorageService } from '../infra/storage/storage.service';
import { QueueService } from '../infra/queue/queue.service';

export const PingSchema = z.object({
  status: z.literal('ok'),
  db: z.enum(['up', 'down']).optional(),
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
});

export type Ping = z.infer<typeof PingSchema>;

export interface ReadinessResponse {
  db: 'up' | 'down';
  storage: 'up' | 'down';
  queue: 'up' | 'down';
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness health check verifying database' })
  @ApiResponse({ status: 200, description: 'Service is healthy and database is connected' })
  async getHealth(): Promise<Ping> {
    const isDbUp = await this.prisma.isHealthy();
    if (!isDbUp) {
      throw new Error('Database unreachable');
    }

    const payload = {
      status: 'ok' as const,
      db: 'up' as const,
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    return PingSchema.parse(payload);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe checking db, storage, and queue' })
  @ApiResponse({ status: 200, description: 'Component readiness status' })
  async getReadiness(): Promise<ReadinessResponse> {
    const [dbHealthy, storageHealthy, queueHealthy] = await Promise.all([
      this.prisma.isHealthy().catch(() => false),
      this.storage.isHealthy().catch(() => false),
      this.queue.isHealthy().catch(() => false),
    ]);

    return {
      db: dbHealthy ? 'up' : 'down',
      storage: storageHealthy ? 'up' : 'down',
      queue: queueHealthy ? 'up' : 'down',
    };
  }
}
