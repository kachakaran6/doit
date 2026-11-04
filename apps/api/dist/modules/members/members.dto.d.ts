import { z } from 'zod';
export declare const InviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["ADMIN", "TESTER", "VIEWER"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "TESTER" | "ADMIN" | "VIEWER";
}, {
    email: string;
    role?: "TESTER" | "ADMIN" | "VIEWER" | undefined;
}>;
export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;
export declare const UpdateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["ADMIN", "TESTER", "VIEWER"]>;
}, "strip", z.ZodTypeAny, {
    role: "TESTER" | "ADMIN" | "VIEWER";
}, {
    role: "TESTER" | "ADMIN" | "VIEWER";
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
