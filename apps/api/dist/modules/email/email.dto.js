"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTestEmailSchema = exports.SmtpConfigSchema = void 0;
const zod_1 = require("zod");
exports.SmtpConfigSchema = zod_1.z.object({
    host: zod_1.z.string().min(1, 'Host is required'),
    port: zod_1.z.number().int().min(1).max(65535).default(587),
    username: zod_1.z.string().optional().nullable(),
    password: zod_1.z.string().optional().nullable(),
    fromEmail: zod_1.z.string().email('Valid from email is required'),
    fromName: zod_1.z.string().min(1).default('DoIt'),
    secure: zod_1.z.boolean().default(false),
    enabled: zod_1.z.boolean().default(true),
});
exports.SendTestEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email('Valid recipient email is required'),
    smtp: exports.SmtpConfigSchema.optional(),
});
//# sourceMappingURL=email.dto.js.map