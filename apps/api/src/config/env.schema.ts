import { z } from 'zod';

export const EnvSchema = z
  .object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    API_PREFIX: z.string().default('api/v1'),
    PUBLIC_BASE_URL: z.string().optional(),
    DATABASE_URL: z.string().default('postgresql://doit:doit@localhost:5432/doit'),
    JWT_SECRET: z.string().default('super-secret-development-jwt-key-replace-in-prod-minimum32'),
    JWT_REFRESH_SECRET: z.string().default('super-secret-refresh-key-replace-in-prod-minimum32'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    REFRESH_TTL_DAYS: z.coerce.number().default(30),
    COOKIE_SECRET: z.string().optional(),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: z.string().default('./uploads'),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    S3_BUCKET: z.string().default('doit-uploads'),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
    MAX_IMAGE_MB: z.coerce.number().default(10),
    MAX_AUDIO_MB: z.coerce.number().default(20),
    ATTACHMENT_RETENTION_DAYS: z.coerce.number().default(180),
    CORS_ORIGINS: z.string().optional(),
    TRUST_PROXY: z.coerce.number().default(1),
    MIN_APP_VERSION: z.string().default('0.1.0'),
    REDIS_URL: z.string().optional(),
    APP_URL: z.string().default('https://doit.kachakaran.tech'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USERNAME: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM_EMAIL: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    SMTP_FROM_NAME: z.string().default('DoIt'),
    SMTP_SECURE: z.string().optional(),
    AI_CREDENTIALS_KEY: z.string().optional(),
    AI_GENERATION_ENABLED: z.string().optional(),
    AI_CONTEXT_MAX_CHARS: z.coerce.number().default(32000),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      // 1. Validate JWT_SECRET
      if (
        !data.JWT_SECRET ||
        data.JWT_SECRET.length < 32 ||
        data.JWT_SECRET.includes('CHANGE_ME') ||
        data.JWT_SECRET.includes('super-secret')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'In production, JWT_SECRET must be a cryptographically secure string of at least 32 characters.',
        });
      }

      // 2. Validate JWT_REFRESH_SECRET
      if (
        !data.JWT_REFRESH_SECRET ||
        data.JWT_REFRESH_SECRET.length < 32 ||
        data.JWT_REFRESH_SECRET.includes('CHANGE_ME') ||
        data.JWT_REFRESH_SECRET.includes('super-secret')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message:
            'In production, JWT_REFRESH_SECRET must be a cryptographically secure string of at least 32 characters.',
        });
      }

      // 3. Validate DATABASE_URL
      if (!data.DATABASE_URL || data.DATABASE_URL.includes('CHANGE_ME')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'In production, DATABASE_URL must not contain default placeholders.',
        });
      }

      // 4. Validate S3 settings if driver is S3
      if (data.STORAGE_DRIVER === 's3') {
        if (!data.S3_ACCESS_KEY_ID || data.S3_ACCESS_KEY_ID.includes('CHANGE_ME')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_ACCESS_KEY_ID'],
            message: 'In production with STORAGE_DRIVER=s3, S3_ACCESS_KEY_ID must be provided.',
          });
        }
        if (!data.S3_SECRET_ACCESS_KEY || data.S3_SECRET_ACCESS_KEY.includes('CHANGE_ME')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_SECRET_ACCESS_KEY'],
            message: 'In production with STORAGE_DRIVER=s3, S3_SECRET_ACCESS_KEY must be provided.',
          });
        }
      }
    }
  });

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation failed:\n${JSON.stringify(formatted, null, 2)}`);
  }
  return result.data;
}
