import { StickiesService } from './stickies.service';
import { CreateStickyDto, UpdateStickyDto, ReorderStickyDto, ConvertStickyDto } from './stickies.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class StickiesController {
    private readonly stickiesService;
    constructor(stickiesService: StickiesService);
    create(user: AuthUserPayload, projectId: string, dto: CreateStickyDto): Promise<{
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
        order: import("@prisma/client/runtime/library").Decimal;
        authorId: string;
        body: string;
        pinned: boolean;
        convertedTaskId: string | null;
    }>;
    findAll(projectId: string, pinned?: string): Promise<({
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
        order: import("@prisma/client/runtime/library").Decimal;
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
        order: import("@prisma/client/runtime/library").Decimal;
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
            order: import("@prisma/client/runtime/library").Decimal;
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
