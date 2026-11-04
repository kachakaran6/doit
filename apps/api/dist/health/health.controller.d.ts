import { z } from 'zod';
import { PrismaService } from '../infra/prisma/prisma.service';
import { StorageService } from '../infra/storage/storage.service';
import { QueueService } from '../infra/queue/queue.service';
export declare const PingSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    db: z.ZodOptional<z.ZodEnum<["up", "down"]>>;
    version: z.ZodString;
    uptime: z.ZodNumber;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ok";
    version: string;
    uptime: number;
    timestamp: string;
    db?: "up" | "down" | undefined;
}, {
    status: "ok";
    version: string;
    uptime: number;
    timestamp: string;
    db?: "up" | "down" | undefined;
}>;
export type Ping = z.infer<typeof PingSchema>;
export interface ReadinessResponse {
    db: 'up' | 'down';
    storage: 'up' | 'down';
    queue: 'up' | 'down';
}
export declare class HealthController {
    private readonly prisma;
    private readonly storage;
    private readonly queue;
    constructor(prisma: PrismaService, storage: StorageService, queue: QueueService);
    getHealth(): Promise<Ping>;
    getReadiness(): Promise<ReadinessResponse>;
}
