import { z } from 'zod';
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    fullName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
    fullName?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
    fullName?: string | undefined;
}>, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name?: string | undefined;
    fullName?: string | undefined;
}>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    deviceName: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodEnum<["ios", "android", "web"]>>;
    appVersion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    deviceName?: string | undefined;
    deviceId?: string | undefined;
    platform?: "ios" | "android" | "web" | undefined;
    appVersion?: string | undefined;
}, {
    email: string;
    password: string;
    deviceName?: string | undefined;
    deviceId?: string | undefined;
    platform?: "ios" | "android" | "web" | undefined;
    appVersion?: string | undefined;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    password?: string | undefined;
    token?: string | undefined;
    newPassword?: string | undefined;
}, {
    email?: string | undefined;
    password?: string | undefined;
    token?: string | undefined;
    newPassword?: string | undefined;
}>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
