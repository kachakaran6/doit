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
    findOne(taskId: string): Promise<{
        checklist: {
            id: string;
            taskId: string;
            order: Prisma.Decimal;
            text: string;
            done: boolean;
        }[];
        attachments: ({
            url: string;
            thumbUrl: string | null;
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
            id: string;
            taskId: string;
            appVersion: string | null;
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
                id: string;
                name: string;
            };
        } & {
            id: string;
            workspaceId: string;
            createdAt: Date;
            action: string;
            meta: Prisma.JsonValue;
            taskId: string | null;
            actorId: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(taskId: string, userId: string, dto: UpdateTaskDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    updateStatus(taskId: string, userId: string, dto: UpdateStatusDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    reorder(taskId: string, dto: ReorderTaskDto): Promise<{
        id: string;
        order: string;
    }>;
    assign(taskId: string, userId: string, assigneeId: string | null): Promise<import("./tasks.mapper").TaskListItemMapped>;
    setLabels(taskId: string, userId: string, labelIds: string[]): Promise<import("./tasks.mapper").TaskListItemMapped>;
    delete(taskId: string, userId: string): Promise<{
        success: boolean;
    }>;
    addChecklistItem(taskId: string, dto: CreateChecklistItemDto): Promise<{
        id: string;
        taskId: string;
        order: Prisma.Decimal;
        text: string;
        done: boolean;
    }>;
    updateChecklistItem(itemId: string, dto: UpdateChecklistItemDto): Promise<{
        id: string;
        taskId: string;
        order: Prisma.Decimal;
        text: string;
        done: boolean;
    }>;
    deleteChecklistItem(itemId: string): Promise<{
        success: boolean;
    }>;
}
