import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateStickyDto, UpdateStickyDto, ReorderStickyDto, ConvertStickyDto } from './stickies.dto';
export declare class StickiesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(projectId: string, userId: string, dto: CreateStickyDto): Promise<{
        project: {
            name: string;
            key: string;
            id: string;
        };
        author: {
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    findAll(projectId: string, pinned?: boolean): Promise<({
        project: {
            name: string;
            key: string;
            id: string;
        };
        author: {
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        project: {
            name: string;
            key: string;
            id: string;
        };
        author: {
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    update(id: string, dto: UpdateStickyDto): Promise<{
        project: {
            name: string;
            key: string;
            id: string;
        };
        author: {
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        projectId: string;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    reorder(id: string, dto: ReorderStickyDto): Promise<{
        id: string;
        order: string;
    }>;
    convert(id: string, userId: string, dto: ConvertStickyDto): Promise<{
        task: {
            number: number;
            status: import(".prisma/client").$Enums.TaskStatus;
            type: import(".prisma/client").$Enums.TaskType;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            source: import(".prisma/client").$Enums.TaskSource;
            dueAt: Date | null;
            dueHasTime: boolean;
            assigneeId: string | null;
            order: Prisma.Decimal;
            createdById: string;
            completedAt: Date | null;
            convertedFromStickyId: string | null;
        };
        sticky: {
            color: import(".prisma/client").$Enums.AccentName;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            order: Prisma.Decimal;
            authorId: string;
            body: string;
            pinned: boolean;
            convertedTaskId: string | null;
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
