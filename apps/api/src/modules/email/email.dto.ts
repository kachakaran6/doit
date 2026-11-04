import { z } from 'zod';

export const SmtpConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535).default(587),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  fromEmail: z.string().email('Valid from email is required'),
  fromName: z.string().min(1).default('DoIt'),
  secure: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export type SmtpConfigDto = z.infer<typeof SmtpConfigSchema>;

export const SendTestEmailSchema = z.object({
  to: z.string().email('Valid recipient email is required'),
  smtp: SmtpConfigSchema.optional(),
});

export type SendTestEmailDto = z.infer<typeof SendTestEmailSchema>;
