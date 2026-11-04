export interface QueueJob<T = unknown> {
    id: string;
    name: string;
    data: T;
    createdAt: Date;
}
export declare class QueueService {
    private readonly logger;
    private readonly inMemoryJobs;
    constructor();
    add<T>(name: string, data: T): Promise<QueueJob<T>>;
    isHealthy(): Promise<boolean>;
}
