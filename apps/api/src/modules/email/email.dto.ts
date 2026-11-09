import { z } from 'zod';

export const BaseSmtpConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535).default(587),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  fromEmail: z.string().optional().nullable(),
  fromAddress: z.string().optional().nullable(),
  fromName: z.string().optional().nullable(),
  senderName: z.string().optional().nullable(),
  secure: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export const PartialSmtpConfigSchema = BaseSmtpConfigSchema.partial();

export const SmtpConfigSchema = BaseSmtpConfigSchema.transform((val) => {
  const fromEmail = (val.fromEmail || val.fromAddress || '').trim();
  const fromName = (val.fromName || val.senderName || 'DoIt').trim();
  return {
    ...val,
    fromEmail,
    fromName: fromName || 'DoIt',
  };
}).refine((val) => Boolean(val.fromEmail && val.fromEmail.includes('@')), {
  message: 'Valid from email is required',
  path: ['fromEmail'],
});

export type SmtpConfigDto = z.infer<typeof SmtpConfigSchema>;

export const SendTestEmailSchema = z.object({
  to: z.string().email('Valid recipient email is required'),
  smtp: z.any().optional().nullable(),
});

export type SendTestEmailDto = z.infer<typeof SendTestEmailSchema>;

