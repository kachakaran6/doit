"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2).optional(),
    fullName: zod_1.z.string().min(2).optional(),
})
    .transform((val) => ({
    email: val.email.toLowerCase(),
    password: val.password,
    name: val.name || val.fullName || 'User',
}));
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(1),
    deviceName: zod_1.z.string().optional(),
    deviceId: zod_1.z.string().optional(),
    platform: zod_1.z.enum(['ios', 'android', 'web']).optional(),
    appVersion: zod_1.z.string().optional(),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(16),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().trim().email().optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
});
//# sourceMappingURL=auth.dto.js.map