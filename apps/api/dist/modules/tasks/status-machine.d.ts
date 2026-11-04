import { TaskStatus } from '@prisma/client';
export declare function canTransition(currentStatus: TaskStatus, targetStatus: TaskStatus): boolean;
export declare function validateStatusTransition(currentStatus: TaskStatus, targetStatus: TaskStatus): void;
