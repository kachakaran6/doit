import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateStickyDto, UpdateStickyDto, ReorderStickyDto, ConvertStickyDto } from './stickies.dto';
export declare class StickiesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(projectId: string, userId: string, dto: CreateStickyDto): Promise<{
        project: {
            id: string;
            name: string;
            key: string;
        };
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: Prisma.Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
    }>;
    findAll(projectId: string, pinned?: boolean): Promise<({
        project: {
            id: string;
            name: string;
            key: string;
        };
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: Prisma.Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
    })[]>;
    findOne(id: string): Promise<{
        project: {
            id: string;
            name: string;
            key: string;
        };
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: Prisma.Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
    }>;
    update(id: string, dto: UpdateStickyDto): Promise<{
        project: {
            id: string;
            name: string;
            key: string;
        };
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: Prisma.Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
    }>;
    reorder(id: string, dto: ReorderStickyDto): Promise<{
        id: string;
        order: string;
    }>;
    convert(id: string, userId: string, dto: ConvertStickyDto): Promise<{
        task: {
            number: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TaskType;
            status: import(".prisma/client").$Enums.TaskStatus;
            deletedAt: Date | null;
            description: string | null;
            projectId: string;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueAt: Date | null;
            dueHasTime: boolean;
            order: Prisma.Decimal;
            source: import(".prisma/client").$Enums.TaskSource;
            createdById: string;
            assigneeId: string | null;
            completedAt: Date | null;
            convertedFromStickyId: string | null;
        };
        sticky: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            color: import(".prisma/client").$Enums.AccentName;
            projectId: string;
            order: Prisma.Decimal;
            body: string;
            pinned: boolean;
            convertedTaskId: string | null;
            authorId: string;
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
