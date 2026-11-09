import { StickiesService } from './stickies.service';
import { CreateStickyDto, UpdateStickyDto, ReorderStickyDto, ConvertStickyDto } from './stickies.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class StickiesController {
    private readonly stickiesService;
    constructor(stickiesService: StickiesService);
    create(user: AuthUserPayload, projectId: string, dto: CreateStickyDto): Promise<{
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
        order: import("@prisma/client/runtime/library").Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    findAll(projectId: string, pinned?: string): Promise<({
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
        order: import("@prisma/client/runtime/library").Decimal;
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
        order: import("@prisma/client/runtime/library").Decimal;
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
        order: import("@prisma/client/runtime/library").Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    reorder(id: string, dto: ReorderStickyDto): Promise<{
        id: string;
        order: string;
    }>;
    convert(user: AuthUserPayload, id: string, dto: ConvertStickyDto): Promise<{
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
            order: import("@prisma/client/runtime/library").Decimal;
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
            order: import("@prisma/client/runtime/library").Decimal;
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
