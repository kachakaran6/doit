import { z } from 'zod';
export declare const CreateTaskSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    type: z.ZodDefault<z.ZodEnum<["TASK", "BUG"]>>;
    source: z.ZodDefault<z.ZodEnum<["MANUAL", "VOICE", "BUG", "STICKY", "WIDGET", "OVERLAY", "SHARE"]>>;
    dueAt: z.ZodOptional<z.ZodString>;
    dueHasTime: z.ZodDefault<z.ZodBoolean>;
    assigneeId: z.ZodOptional<z.ZodString>;
    labelIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "TASK" | "BUG";
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueHasTime: boolean;
    source: "BUG" | "MANUAL" | "VOICE" | "STICKY" | "WIDGET" | "OVERLAY" | "SHARE";
    labelIds: string[];
    description?: string | undefined;
    projectId?: string | undefined;
    dueAt?: string | undefined;
    assigneeId?: string | undefined;
}, {
    title: string;
    type?: "TASK" | "BUG" | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueAt?: string | undefined;
    dueHasTime?: boolean | undefined;
    source?: "BUG" | "MANUAL" | "VOICE" | "STICKY" | "WIDGET" | "OVERLAY" | "SHARE" | undefined;
    assigneeId?: string | undefined;
    labelIds?: string[] | undefined;
}>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export declare const UpdateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    dueAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueHasTime: z.ZodOptional<z.ZodBoolean>;
    assigneeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueAt?: string | null | undefined;
    dueHasTime?: boolean | undefined;
    assigneeId?: string | null | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueAt?: string | null | undefined;
    dueHasTime?: boolean | undefined;
    assigneeId?: string | null | undefined;
}>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export declare const UpdateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]>;
}, "strip", z.ZodTypeAny, {
    status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
}, {
    status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
}>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export declare const ReorderTaskSchema: z.ZodObject<{
    beforeId: z.ZodOptional<z.ZodString>;
    afterId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    beforeId?: string | undefined;
    afterId?: string | undefined;
}, {
    beforeId?: string | undefined;
    afterId?: string | undefined;
}>;
export type ReorderTaskDto = z.infer<typeof ReorderTaskSchema>;
export declare const AssignTaskSchema: z.ZodObject<{
    assigneeId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assigneeId: string | null;
}, {
    assigneeId: string | null;
}>;
export type AssignTaskDto = z.infer<typeof AssignTaskSchema>;
export declare const SetLabelsSchema: z.ZodObject<{
    labelIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    labelIds: string[];
}, {
    labelIds: string[];
}>;
export type SetLabelsDto = z.infer<typeof SetLabelsSchema>;
export declare const CreateChecklistItemSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export type CreateChecklistItemDto = z.infer<typeof CreateChecklistItemSchema>;
export declare const UpdateChecklistItemSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    done: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    done?: boolean | undefined;
}, {
    text?: string | undefined;
    done?: boolean | undefined;
}>;
export type UpdateChecklistItemDto = z.infer<typeof UpdateChecklistItemSchema>;
export declare const TaskListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    priority: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    assignee: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["TASK", "BUG"]>>;
    due: z.ZodOptional<z.ZodEnum<["overdue", "today", "week", "none"]>>;
    q: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    type?: "TASK" | "BUG" | undefined;
    status?: string | string[] | undefined;
    cursor?: string | undefined;
    priority?: string | string[] | undefined;
    assignee?: string | undefined;
    due?: "week" | "overdue" | "today" | "none" | undefined;
    q?: string | undefined;
}, {
    type?: "TASK" | "BUG" | undefined;
    status?: string | string[] | undefined;
    cursor?: string | undefined;
    priority?: string | string[] | undefined;
    assignee?: string | undefined;
    due?: "week" | "overdue" | "today" | "none" | undefined;
    q?: string | undefined;
    limit?: number | undefined;
}>;
export type TaskListQueryDto = z.infer<typeof TaskListQuerySchema>;
