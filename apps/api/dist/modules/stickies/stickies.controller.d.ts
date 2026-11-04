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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: import("@prisma/client/runtime/library").Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
        order: import("@prisma/client/runtime/library").Decimal;
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
        order: import("@prisma/client/runtime/library").Decimal;
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
        order: import("@prisma/client/runtime/library").Decimal;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
        authorId: string;
    }>;
    reorder(id: string, dto: ReorderStickyDto): Promise<{
        id: string;
        order: string;
    }>;
    convert(user: AuthUserPayload, id: string, dto: ConvertStickyDto): Promise<{
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
            order: import("@prisma/client/runtime/library").Decimal;
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
            order: import("@prisma/client/runtime/library").Decimal;
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
