"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.EnvSchema = zod_1.z
    .object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    API_PREFIX: zod_1.z.string().default('api/v1'),
    PUBLIC_BASE_URL: zod_1.z.string().optional(),
    DATABASE_URL: zod_1.z.string().default('postgresql://doit:doit@localhost:5432/doit'),
    JWT_SECRET: zod_1.z.string().default('super-secret-development-jwt-key-replace-in-prod-minimum32'),
    JWT_REFRESH_SECRET: zod_1.z.string().default('super-secret-refresh-key-replace-in-prod-minimum32'),
    JWT_ACCESS_TTL: zod_1.z.string().default('15m'),
    REFRESH_TTL_DAYS: zod_1.z.coerce.number().default(30),
    COOKIE_SECRET: zod_1.z.string().optional(),
    STORAGE_DRIVER: zod_1.z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    S3_ENDPOINT: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().default('auto'),
    S3_BUCKET: zod_1.z.string().default('doit-uploads'),
    S3_ACCESS_KEY_ID: zod_1.z.string().optional(),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    S3_FORCE_PATH_STYLE: zod_1.z.coerce.boolean().default(true),
    MAX_IMAGE_MB: zod_1.z.coerce.number().default(10),
    MAX_AUDIO_MB: zod_1.z.coerce.number().default(20),
    ATTACHMENT_RETENTION_DAYS: zod_1.z.coerce.number().default(180),
    CORS_ORIGINS: zod_1.z.string().optional(),
    TRUST_PROXY: zod_1.z.coerce.number().default(1),
    MIN_APP_VERSION: zod_1.z.string().default('0.1.0'),
    REDIS_URL: zod_1.z.string().optional(),
    APP_URL: zod_1.z.string().default('https://doit.kachakaran.tech'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USERNAME: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM_EMAIL: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().optional(),
    SMTP_FROM_NAME: zod_1.z.string().default('DoIt'),
    SMTP_SECURE: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
        if (!data.JWT_SECRET ||
            data.JWT_SECRET.length < 32 ||
            data.JWT_SECRET.includes('CHANGE_ME') ||
            data.JWT_SECRET.includes('super-secret')) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['JWT_SECRET'],
                message: 'In production, JWT_SECRET must be a cryptographically secure string of at least 32 characters.',
            });
        }
        if (!data.JWT_REFRESH_SECRET ||
            data.JWT_REFRESH_SECRET.length < 32 ||
            data.JWT_REFRESH_SECRET.includes('CHANGE_ME') ||
            data.JWT_REFRESH_SECRET.includes('super-secret')) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['JWT_REFRESH_SECRET'],
                message: 'In production, JWT_REFRESH_SECRET must be a cryptographically secure string of at least 32 characters.',
            });
        }
        if (!data.DATABASE_URL || data.DATABASE_URL.includes('CHANGE_ME')) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['DATABASE_URL'],
                message: 'In production, DATABASE_URL must not contain default placeholders.',
            });
        }
        if (data.STORAGE_DRIVER === 's3') {
            if (!data.S3_ACCESS_KEY_ID || data.S3_ACCESS_KEY_ID.includes('CHANGE_ME')) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['S3_ACCESS_KEY_ID'],
                    message: 'In production with STORAGE_DRIVER=s3, S3_ACCESS_KEY_ID must be provided.',
                });
            }
            if (!data.S3_SECRET_ACCESS_KEY || data.S3_SECRET_ACCESS_KEY.includes('CHANGE_ME')) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['S3_SECRET_ACCESS_KEY'],
                    message: 'In production with STORAGE_DRIVER=s3, S3_SECRET_ACCESS_KEY must be provided.',
                });
            }
        }
    }
});
function validateEnv(config) {
    const result = exports.EnvSchema.safeParse(config);
    if (!result.success) {
        const formatted = result.error.format();
        throw new Error(`Environment validation failed:\n${JSON.stringify(formatted, null, 2)}`);
    }
    return result.data;
}
//# sourceMappingURL=env.schema.js.map