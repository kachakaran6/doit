import { z } from 'zod';
export declare const SmtpConfigSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    username: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    password: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fromEmail: z.ZodString;
    fromName: z.ZodDefault<z.ZodString>;
    secure: z.ZodDefault<z.ZodBoolean>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    fromEmail: string;
    fromName: string;
    secure: boolean;
    enabled: boolean;
    username?: string | null | undefined;
    password?: string | null | undefined;
}, {
    host: string;
    fromEmail: string;
    port?: number | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    fromName?: string | undefined;
    secure?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export type SmtpConfigDto = z.infer<typeof SmtpConfigSchema>;
export declare const SendTestEmailSchema: z.ZodObject<{
    to: z.ZodString;
    smtp: z.ZodOptional<z.ZodObject<{
        host: z.ZodString;
        port: z.ZodDefault<z.ZodNumber>;
        username: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        password: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fromEmail: z.ZodString;
        fromName: z.ZodDefault<z.ZodString>;
        secure: z.ZodDefault<z.ZodBoolean>;
        enabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        host: string;
        port: number;
        fromEmail: string;
        fromName: string;
        secure: boolean;
        enabled: boolean;
        username?: string | null | undefined;
        password?: string | null | undefined;
    }, {
        host: string;
        fromEmail: string;
        port?: number | undefined;
        username?: string | null | undefined;
        password?: string | null | undefined;
        fromName?: string | undefined;
        secure?: boolean | undefined;
        enabled?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    to: string;
    smtp?: {
        host: string;
        port: number;
        fromEmail: string;
        fromName: string;
        secure: boolean;
        enabled: boolean;
        username?: string | null | undefined;
        password?: string | null | undefined;
    } | undefined;
}, {
    to: string;
    smtp?: {
        host: string;
        fromEmail: string;
        port?: number | undefined;
        username?: string | null | undefined;
        password?: string | null | undefined;
        fromName?: string | undefined;
        secure?: boolean | undefined;
        enabled?: boolean | undefined;
    } | undefined;
}>;
export type SendTestEmailDto = z.infer<typeof SendTestEmailSchema>;
