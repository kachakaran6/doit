import { Injectable, Logger } from '@nestjs/common';

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  createdAt: Date;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly inMemoryJobs = new Map<string, QueueJob>();

  constructor() {
    if (!process.env.REDIS_URL) {
      this.logger.log('Redis URL not provided; running queue in in-memory mode for local development.');
    }
  }

  async add<T>(name: string, data: T): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      data,
      createdAt: new Date(),
    };
    this.inMemoryJobs.set(job.id, job as QueueJob);
    this.logger.log(`Enqueued job [${job.name}] with id: ${job.id}`);
    return job;
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }
}
