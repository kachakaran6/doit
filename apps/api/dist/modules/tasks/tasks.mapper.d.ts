export interface TaskListItemMapped {
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
    attachments?: any[];
    createdAt: Date;
    updatedAt: Date;
}
export interface RawTaskModel {
    id: string;
    projectId: string;
    number: number;
    type: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueAt: Date | null;
    dueHasTime: boolean;
    order: unknown;
    source: string;
    createdAt: Date;
    updatedAt: Date;
    project?: {
        key: string;
    };
    assignee?: {
        id: string;
        name: string;
        avatarUrl: string | null;
    } | null;
    checklist?: {
        id: string;
        done: boolean;
    }[];
    labels?: {
        label: {
            id: string;
            name: string;
            color: string;
        };
    }[];
    _count?: {
        attachments: number;
        comments: number;
    };
    attachments?: unknown[];
    comments?: unknown[];
}
export declare function mapTaskListItem(task: RawTaskModel, projectKey?: string): TaskListItemMapped;
