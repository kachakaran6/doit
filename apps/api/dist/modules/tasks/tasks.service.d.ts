import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, ReorderTaskDto, CreateChecklistItemDto, UpdateChecklistItemDto, TaskListQueryDto } from './tasks.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly storage;
    private readonly logger;
    private readonly idempotencyCache;
    constructor(prisma: PrismaService, storage: StorageService);
    create(userId: string, dto: CreateTaskDto, idempotencyKey?: string): Promise<{
        task: unknown;
        isReplay: boolean;
    }>;
    findAll(scope: string | {
        workspaceId?: string;
        projectId?: string;
    }, query: TaskListQueryDto): Promise<import("../../common/pagination/cursor-page").CursorPageResult<import("./tasks.mapper").TaskListItemMapped>>;
    findMyDay(userId: string, workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    findInbox(workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    private resolveTaskId;
    findOne(rawTaskId: string): Promise<{
        checklist: {
            id: string;
            text: string;
            done: boolean;
            order: Prisma.Decimal;
            taskId: string;
        }[];
        attachments: ({
            url: string;
            thumbUrl: string;
            id: string;
            createdAt: Date;
            taskId: string | null;
            bugId: string | null;
            commentId: string | null;
            kind: import(".prisma/client").$Enums.AttachmentKind;
            storageKey: string;
            mimeType: string;
            sizeBytes: number;
            width: number | null;
            height: number | null;
            durationMs: number | null;
            thumbKey: string | null;
        } | {
            url: null;
            thumbUrl: null;
            id: string;
            createdAt: Date;
            taskId: string | null;
            bugId: string | null;
            commentId: string | null;
            kind: import(".prisma/client").$Enums.AttachmentKind;
            storageKey: string;
            mimeType: string;
            sizeBytes: number;
            width: number | null;
            height: number | null;
            durationMs: number | null;
            thumbKey: string | null;
        })[];
        bug: {
            expected: string | null;
            appVersion: string | null;
            id: string;
            taskId: string;
            sessionId: string | null;
            reporterId: string | null;
            severity: import(".prisma/client").$Enums.Severity;
            steps: Prisma.JsonValue;
            actual: string | null;
            frequency: string | null;
            deviceModel: string | null;
            osVersion: string | null;
            appUnderTest: string | null;
            buildNumber: string | null;
            capturedAt: Date;
            autoContext: Prisma.JsonValue;
        } | null;
        activity: ({
            actor: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            workspaceId: string;
            taskId: string | null;
            actorId: string;
            action: string;
            meta: Prisma.JsonValue;
        })[];
        id: string;
        humanId: string;
        projectId: string;
        type: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueAt: Date | null;
        dueHasTime: boolean;
        order: string;
        source: string;
        assignee: {
            id: string;
            name: string;
            avatarUrl: string | null;
        } | null;
        labels: {
            id: string;
            name: string;
            color: string;
        }[];
        checklistProgress: {
            done: number;
            total: number;
        };
        attachmentCount: number;
        commentCount: number;
        severity?: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(rawTaskId: string, userId: string, dto: UpdateTaskDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    updateStatus(rawTaskId: string, userId: string, dto: UpdateStatusDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    reorder(taskId: string, dto: ReorderTaskDto): Promise<{
        id: string;
        order: string;
    }>;
    assign(rawTaskId: string, userId: string, rawAssigneeId: string | null): Promise<import("./tasks.mapper").TaskListItemMapped>;
    setLabels(taskId: string, userId: string, labelIds: string[]): Promise<import("./tasks.mapper").TaskListItemMapped>;
    delete(taskId: string, userId: string): Promise<{
        success: boolean;
    }>;
    addChecklistItem(taskId: string, dto: CreateChecklistItemDto): Promise<{
        id: string;
        text: string;
        done: boolean;
        order: Prisma.Decimal;
        taskId: string;
    }>;
    updateChecklistItem(itemId: string, dto: UpdateChecklistItemDto): Promise<{
        id: string;
        text: string;
        done: boolean;
        order: Prisma.Decimal;
        taskId: string;
    }>;
    deleteChecklistItem(itemId: string): Promise<{
        success: boolean;
    }>;
    getComments(taskId: string): Promise<({
        author: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        body: string;
        voiceNoteId: string | null;
        taskId: string;
        authorId: string;
    })[]>;
    createComment(taskId: string, userId: string, dto: {
        body: string;
        voiceNoteId?: string;
    }): Promise<{
        author: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        body: string;
        voiceNoteId: string | null;
        taskId: string;
        authorId: string;
    }>;
    deleteComment(commentId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
