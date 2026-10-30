import { z } from 'zod';

export const VoiceLanguageEnum = z.enum(['en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN', 'auto']);

export const CreateVoiceNoteSchema = z.object({
  language: VoiceLanguageEnum.default('en-IN'),
  durationMs: z
    .number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be positive')
    .max(300000, 'Audio duration cannot exceed 5 minutes (300,000 ms)'),
});

export type CreateVoiceNoteDto = z.infer<typeof CreateVoiceNoteSchema>;

export const UpdateVoiceTextSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export type UpdateVoiceTextDto = z.infer<typeof UpdateVoiceTextSchema>;

export const AttachVoiceSchema = z
  .object({
    taskId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      const targets = [data.taskId, data.commentId].filter(Boolean);
      return targets.length === 1;
    },
    {
      message: 'VoiceNote must attach to exactly one of taskId or commentId.',
      path: ['taskId'],
    },
  );

export type AttachVoiceDto = z.infer<typeof AttachVoiceSchema>;
