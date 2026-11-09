import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, ReorderTaskDto, AssignTaskDto, SetLabelsDto, CreateChecklistItemDto, UpdateChecklistItemDto, TaskListQueryDto, CreateCommentDto } from './tasks.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    createBug(user: AuthUserPayload, projectId: string, idempotencyKey: string | undefined, dto: any): Promise<{
        task: unknown;
        isReplay: boolean;
    }>;
    listBugsByProject(projectId: string, query: TaskListQueryDto): Promise<import("../../common/pagination/cursor-page").CursorPageResult<import("./tasks.mapper").TaskListItemMapped>>;
    findOneBug(id: string): Promise<{
        checklist: {
            id: string;
            order: import("@prisma/client/runtime/library").Decimal;
            taskId: string;
            text: string;
            done: boolean;
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
            id: string;
            expected: string | null;
            taskId: string;
            sessionId: string | null;
            reporterId: string | null;
            severity: import(".prisma/client").$Enums.Severity;
            steps: import("@prisma/client/runtime/library").JsonValue;
            actual: string | null;
            frequency: string | null;
            deviceModel: string | null;
            osVersion: string | null;
            appUnderTest: string | null;
            appVersion: string | null;
            buildNumber: string | null;
            capturedAt: Date;
            autoContext: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        activity: ({
            actor: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            workspaceId: string;
            taskId: string | null;
            actorId: string;
            action: string;
            meta: import("@prisma/client/runtime/library").JsonValue;
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
    updateBug(user: AuthUserPayload, id: string, dto: any): Promise<import("./tasks.mapper").TaskListItemMapped>;
    create(user: AuthUserPayload, projectId: string, idempotencyKey: string | undefined, dto: CreateTaskDto): Promise<{
        task: unknown;
        isReplay: boolean;
    }>;
    listByProject(projectId: string, query: TaskListQueryDto): Promise<import("../../common/pagination/cursor-page").CursorPageResult<import("./tasks.mapper").TaskListItemMapped>>;
    listByWorkspace(workspaceId: string, query: TaskListQueryDto): Promise<import("../../common/pagination/cursor-page").CursorPageResult<import("./tasks.mapper").TaskListItemMapped>>;
    findMyDay(user: AuthUserPayload, workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    findMyDayQuery(user: AuthUserPayload, workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    findInbox(workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    findInboxQuery(workspaceId: string): Promise<import("./tasks.mapper").TaskListItemMapped[]>;
    findOne(id: string): Promise<{
        checklist: {
            id: string;
            order: import("@prisma/client/runtime/library").Decimal;
            taskId: string;
            text: string;
            done: boolean;
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
            id: string;
            expected: string | null;
            taskId: string;
            sessionId: string | null;
            reporterId: string | null;
            severity: import(".prisma/client").$Enums.Severity;
            steps: import("@prisma/client/runtime/library").JsonValue;
            actual: string | null;
            frequency: string | null;
            deviceModel: string | null;
            osVersion: string | null;
            appUnderTest: string | null;
            appVersion: string | null;
            buildNumber: string | null;
            capturedAt: Date;
            autoContext: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        activity: ({
            actor: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            workspaceId: string;
            taskId: string | null;
            actorId: string;
            action: string;
            meta: import("@prisma/client/runtime/library").JsonValue;
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
    update(user: AuthUserPayload, id: string, dto: UpdateTaskDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    updateStatusPatch(user: AuthUserPayload, id: string, dto: UpdateStatusDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    updateStatus(user: AuthUserPayload, id: string, dto: UpdateStatusDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    reorder(id: string, dto: ReorderTaskDto): Promise<{
        id: string;
        order: string;
    }>;
    assign(user: AuthUserPayload, id: string, dto: AssignTaskDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    setLabels(user: AuthUserPayload, id: string, dto: SetLabelsDto): Promise<import("./tasks.mapper").TaskListItemMapped>;
    delete(user: AuthUserPayload, id: string): Promise<{
        success: boolean;
    }>;
    addChecklistItem(id: string, dto: CreateChecklistItemDto): Promise<{
        id: string;
        order: import("@prisma/client/runtime/library").Decimal;
        taskId: string;
        text: string;
        done: boolean;
    }>;
    updateChecklistItem(itemId: string, dto: UpdateChecklistItemDto): Promise<{
        id: string;
        order: import("@prisma/client/runtime/library").Decimal;
        taskId: string;
        text: string;
        done: boolean;
    }>;
    deleteChecklistItem(itemId: string): Promise<{
        success: boolean;
    }>;
    getComments(id: string): Promise<({
        author: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        body: string;
        voiceNoteId: string | null;
    })[]>;
    addComment(user: AuthUserPayload, id: string, dto: CreateCommentDto): Promise<{
        author: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        body: string;
        voiceNoteId: string | null;
    }>;
    deleteComment(user: AuthUserPayload, commentId: string): Promise<{
        success: boolean;
    }>;
}
