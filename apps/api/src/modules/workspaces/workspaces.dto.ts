import { z } from 'zod';

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens')
    .optional(),
});

export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
});

export type UpdateWorkspaceDto = z.infer<typeof UpdateWorkspaceSchema>;
