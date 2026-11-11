import { z } from 'zod';

export const CreateTaskSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  type: z.enum(['TASK', 'BUG']).default('TASK'),
  source: z.enum(['MANUAL', 'VOICE', 'BUG', 'STICKY', 'WIDGET', 'OVERLAY', 'SHARE']).default('MANUAL'),
  dueAt: z.string().datetime().optional(),
  dueHasTime: z.boolean().default(false),
  assigneeId: z
    .preprocess((val) => (val === '' || val === 'unassigned' ? undefined : val), z.string().uuid().nullable().optional()),
  labelIds: z.array(z.string().uuid()).default([]),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  dueHasTime: z.boolean().optional(),
  assigneeId: z
    .preprocess((val) => (val === '' || val === 'unassigned' ? null : val), z.string().uuid().nullable().optional()),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

export const UpdateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE']),
});

export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;

export const ReorderTaskSchema = z.object({
  beforeId: z.string().uuid().optional(),
  afterId: z.string().uuid().optional(),
});

export type ReorderTaskDto = z.infer<typeof ReorderTaskSchema>;

export const AssignTaskSchema = z.object({
  assigneeId: z
    .preprocess((val) => (val === '' || val === 'unassigned' ? null : val), z.string().uuid().nullable()),
});

export type AssignTaskDto = z.infer<typeof AssignTaskSchema>;

export const SetLabelsSchema = z.object({
  labelIds: z.array(z.string().uuid()),
});

export type SetLabelsDto = z.infer<typeof SetLabelsSchema>;

export const CreateChecklistItemSchema = z.object({
  text: z.string().min(1),
});

export type CreateChecklistItemDto = z.infer<typeof CreateChecklistItemSchema>;

export const UpdateChecklistItemSchema = z.object({
  text: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

export type UpdateChecklistItemDto = z.infer<typeof UpdateChecklistItemSchema>;

export const TaskListQuerySchema = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
  priority: z.union([z.string(), z.array(z.string())]).optional(),
  assignee: z.string().optional(), // 'me' | userId | 'none'
  type: z.enum(['TASK', 'BUG']).optional(),
  due: z.enum(['overdue', 'today', 'week', 'none']).optional(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TaskListQueryDto = z.infer<typeof TaskListQuerySchema>;

export const CreateCommentSchema = z.object({
  body: z.string().min(1).max(10000),
  voiceNoteId: z.string().uuid().optional(),
});
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
