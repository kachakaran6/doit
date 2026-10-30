import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('api/v1'),
  DATABASE_URL: z.string().default('postgresql://samyukt:samyukt@localhost:5432/samyukt_dev'),
  JWT_SECRET: z.string().default('super-secret-development-jwt-key-replace-in-prod'),
  JWT_REFRESH_SECRET: z.string().default('super-secret-refresh-key-replace-in-prod'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  REDIS_URL: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
