import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { QueueService } from './queue/queue.service';
import { RealtimeGateway } from './realtime/realtime.gateway';

@Global()
@Module({
  providers: [PrismaService, StorageService, QueueService, RealtimeGateway],
  exports: [PrismaService, StorageService, QueueService, RealtimeGateway],
})
export class InfraModule {}
