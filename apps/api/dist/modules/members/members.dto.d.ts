import { z } from 'zod';
export declare const RoleEnum: z.ZodEffects<z.ZodEnum<["ADMIN", "TESTER", "VIEWER"]>, "ADMIN" | "TESTER" | "VIEWER", unknown>;
export declare const InviteMemberSchema: z.ZodObject<{
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    role: z.ZodDefault<z.ZodEffects<z.ZodEnum<["ADMIN", "TESTER", "VIEWER"]>, "ADMIN" | "TESTER" | "VIEWER", unknown>>;
    maxUses: z.ZodDefault<z.ZodNumber>;
    expiresInDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    role: "ADMIN" | "TESTER" | "VIEWER";
    maxUses: number;
    expiresInDays: number;
    email?: string | null | undefined;
}, {
    email?: string | null | undefined;
    role?: unknown;
    maxUses?: number | undefined;
    expiresInDays?: number | undefined;
}>;
export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;
export declare const UpdateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEffects<z.ZodEnum<["ADMIN", "TESTER", "VIEWER"]>, "ADMIN" | "TESTER" | "VIEWER", unknown>;
}, "strip", z.ZodTypeAny, {
    role: "ADMIN" | "TESTER" | "VIEWER";
}, {
    role?: unknown;
}>;
export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;
export declare const AcceptInviteSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;
