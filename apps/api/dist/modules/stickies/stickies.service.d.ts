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
        color: import(".prisma/client").$Enums.AccentName;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        deletedAt: Date | null;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
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
        color: import(".prisma/client").$Enums.AccentName;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        deletedAt: Date | null;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
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
        color: import(".prisma/client").$Enums.AccentName;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        deletedAt: Date | null;
        order: Prisma.Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
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
        color: import(".prisma/client").$Enums.AccentName;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        deletedAt: Date | null;
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
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.TaskType;
            status: import(".prisma/client").$Enums.TaskStatus;
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
            color: import(".prisma/client").$Enums.AccentName;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            deletedAt: Date | null;
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
