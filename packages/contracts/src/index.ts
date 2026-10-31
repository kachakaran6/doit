import { z } from 'zod';

export const PingSchema = z.object({
  status: z.literal('ok'),
  db: z.enum(['up', 'down']).optional(),
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
});

export type Ping = z.infer<typeof PingSchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    traceId: z.string().optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

