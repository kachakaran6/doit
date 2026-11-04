"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskListQuerySchema = exports.UpdateChecklistItemSchema = exports.CreateChecklistItemSchema = exports.SetLabelsSchema = exports.AssignTaskSchema = exports.ReorderTaskSchema = exports.UpdateStatusSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = void 0;
const zod_1 = require("zod");
exports.CreateTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, 'Task title is required'),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    type: zod_1.z.enum(['TASK', 'BUG']).default('TASK'),
    source: zod_1.z.enum(['MANUAL', 'VOICE', 'BUG', 'STICKY', 'WIDGET', 'OVERLAY', 'SHARE']).default('MANUAL'),
    dueAt: zod_1.z.string().datetime().optional(),
    dueHasTime: zod_1.z.boolean().default(false),
    assigneeId: zod_1.z.string().uuid().optional(),
    labelIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
});
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueAt: zod_1.z.string().datetime().nullable().optional(),
    dueHasTime: zod_1.z.boolean().optional(),
    assigneeId: zod_1.z.string().uuid().nullable().optional(),
});
exports.UpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE']),
});
exports.ReorderTaskSchema = zod_1.z.object({
    beforeId: zod_1.z.string().uuid().optional(),
    afterId: zod_1.z.string().uuid().optional(),
});
exports.AssignTaskSchema = zod_1.z.object({
    assigneeId: zod_1.z.string().uuid().nullable(),
});
exports.SetLabelsSchema = zod_1.z.object({
    labelIds: zod_1.z.array(zod_1.z.string().uuid()),
});
exports.CreateChecklistItemSchema = zod_1.z.object({
    text: zod_1.z.string().min(1),
});
exports.UpdateChecklistItemSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).optional(),
    done: zod_1.z.boolean().optional(),
});
exports.TaskListQuerySchema = zod_1.z.object({
    status: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    priority: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    assignee: zod_1.z.string().optional(),
    type: zod_1.z.enum(['TASK', 'BUG']).optional(),
    due: zod_1.z.enum(['overdue', 'today', 'week', 'none']).optional(),
    q: zod_1.z.string().optional(),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
//# sourceMappingURL=tasks.dto.js.map