import { z } from 'zod';
export declare const BaseSmtpConfigSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    username: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    password: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    senderName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    secure: z.ZodDefault<z.ZodBoolean>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
}, {
    host: string;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const PartialSmtpConfigSchema: z.ZodObject<{
    host: z.ZodOptional<z.ZodString>;
    port: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    password: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    fromEmail: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    fromAddress: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    fromName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    senderName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    secure: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    host?: string | undefined;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    host?: string | undefined;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const SmtpConfigSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    username: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    password: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    senderName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    secure: z.ZodDefault<z.ZodBoolean>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
}, {
    host: string;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>, {
    fromEmail: string;
    fromName: string;
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromAddress?: string | null | undefined;
    senderName?: string | null | undefined;
}, {
    host: string;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>, {
    fromEmail: string;
    fromName: string;
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromAddress?: string | null | undefined;
    senderName?: string | null | undefined;
}, {
    host: string;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromEmail?: string | null | undefined;
    fromAddress?: string | null | undefined;
    fromName?: string | null | undefined;
    senderName?: string | null | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export type SmtpConfigDto = z.infer<typeof SmtpConfigSchema>;
export declare const SendTestEmailSchema: z.ZodObject<{
    to: z.ZodString;
    smtp: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    to: string;
    smtp?: any;
}, {
    to: string;
    smtp?: any;
}>;
export type SendTestEmailDto = z.infer<typeof SendTestEmailSchema>;
