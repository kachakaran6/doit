import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(2),
  key: z
    .string()
    .min(2)
    .max(5)
    .regex(/^[A-Z0-9]+$/, 'Key must be 2-5 uppercase alphanumeric characters')
    .transform((k) => k.toUpperCase()),
  description: z.string().optional(),
  color: z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']).default('INDIGO'),
  defaultAssigneeId: z
    .preprocess((val) => (val === '' || val === 'unassigned' ? null : val), z.string().uuid().nullable().optional()),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  color: z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']).optional(),
  defaultAssigneeId: z
    .preprocess((val) => (val === '' || val === 'unassigned' ? null : val), z.string().uuid().nullable().optional()),
  archived: z.boolean().optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
