import { z } from 'zod';

export const AccentEnum = z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']);

export const CreateLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(30),
  color: AccentEnum.default('INDIGO'),
});

export type CreateLabelDto = z.infer<typeof CreateLabelSchema>;

export const UpdateLabelSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  color: AccentEnum.optional(),
});

export type UpdateLabelDto = z.infer<typeof UpdateLabelSchema>;
