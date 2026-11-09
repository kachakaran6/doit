"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTestEmailSchema = exports.SmtpConfigSchema = exports.PartialSmtpConfigSchema = exports.BaseSmtpConfigSchema = void 0;
const zod_1 = require("zod");
exports.BaseSmtpConfigSchema = zod_1.z.object({
    host: zod_1.z.string().min(1, 'Host is required'),
    port: zod_1.z.coerce.number().int().min(1).max(65535).default(587),
    username: zod_1.z.string().optional().nullable(),
    password: zod_1.z.string().optional().nullable(),
    fromEmail: zod_1.z.string().optional().nullable(),
    fromAddress: zod_1.z.string().optional().nullable(),
    fromName: zod_1.z.string().optional().nullable(),
    senderName: zod_1.z.string().optional().nullable(),
    secure: zod_1.z.boolean().default(false),
    enabled: zod_1.z.boolean().default(true),
});
exports.PartialSmtpConfigSchema = exports.BaseSmtpConfigSchema.partial();
exports.SmtpConfigSchema = exports.BaseSmtpConfigSchema.transform((val) => {
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
exports.SendTestEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email('Valid recipient email is required'),
    smtp: zod_1.z.any().optional().nullable(),
});
//# sourceMappingURL=email.dto.js.map