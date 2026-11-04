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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: import(".prisma/client").$Enums.AccentName;
        projectId: string;
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
            type: import(".prisma/client").$Enums.TaskType;
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            source: import(".prisma/client").$Enums.TaskSource;
            description: string | null;
            projectId: string;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueAt: Date | null;
            dueHasTime: boolean;
            order: import("@prisma/client/runtime/library").Decimal;
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
