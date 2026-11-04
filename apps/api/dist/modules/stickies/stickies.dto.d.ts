import { z } from 'zod';
export declare const AccentEnum: z.ZodEffects<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>, "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET", unknown>;
export declare const CreateStickySchema: z.ZodEffects<z.ZodObject<{
    body: z.ZodString;
    color: z.ZodDefault<z.ZodEffects<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>, "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET", unknown>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    body: string;
    color: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET";
    pinned?: boolean | undefined;
    isPinned?: boolean | undefined;
}, {
    body: string;
    color?: unknown;
    pinned?: boolean | undefined;
    isPinned?: boolean | undefined;
}>, {
    body: string;
    color: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET";
    pinned: boolean;
}, {
    body: string;
    color?: unknown;
    pinned?: boolean | undefined;
    isPinned?: boolean | undefined;
}>;
export type CreateStickyDto = z.infer<typeof CreateStickySchema>;
export declare const UpdateStickySchema: z.ZodObject<{
    body: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodEffects<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>, "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET", unknown>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    body?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
    pinned?: boolean | undefined;
}, {
    body?: string | undefined;
    color?: unknown;
    pinned?: boolean | undefined;
}>;
export type UpdateStickyDto = z.infer<typeof UpdateStickySchema>;
export declare const ReorderStickySchema: z.ZodObject<{
    beforeId: z.ZodOptional<z.ZodString>;
    afterId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    beforeId?: string | undefined;
    afterId?: string | undefined;
}, {
    beforeId?: string | undefined;
    afterId?: string | undefined;
}>;
export type ReorderStickyDto = z.infer<typeof ReorderStickySchema>;
export declare const ConvertStickySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId?: string | undefined;
    title?: string | undefined;
}, {
    projectId?: string | undefined;
    title?: string | undefined;
}>;
export type ConvertStickyDto = z.infer<typeof ConvertStickySchema>;
