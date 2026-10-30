import { z } from 'zod';

export const AccentEnum = z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']);

export const CreateStickySchema = z.object({
  body: z.string().trim().min(1, 'Body is required').max(5000, 'Body cannot exceed 5000 characters'),
  color: AccentEnum.default('AMBER'),
  pinned: z.boolean().default(false),
});

export type CreateStickyDto = z.infer<typeof CreateStickySchema>;

export const UpdateStickySchema = z.object({
  body: z.string().trim().min(1, 'Body is required').max(5000, 'Body cannot exceed 5000 characters').optional(),
  color: AccentEnum.optional(),
  pinned: z.boolean().optional(),
});

export type UpdateStickyDto = z.infer<typeof UpdateStickySchema>;

export const ReorderStickySchema = z.object({
  beforeId: z.string().uuid().optional(),
  afterId: z.string().uuid().optional(),
});

export type ReorderStickyDto = z.infer<typeof ReorderStickySchema>;

export const ConvertStickySchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().optional(),
});

export type ConvertStickyDto = z.infer<typeof ConvertStickySchema>;
