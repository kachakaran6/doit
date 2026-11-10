import { z } from 'zod';
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    key: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodDefault<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>>;
    defaultAssigneeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    key: string;
    color: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET";
    description?: string | undefined;
    defaultAssigneeId?: string | null | undefined;
}, {
    name: string;
    key: string;
    description?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
    defaultAssigneeId?: string | null | undefined;
}>;
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export declare const UpdateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>>;
    defaultAssigneeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    archived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
    defaultAssigneeId?: string | null | undefined;
    archived?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
    defaultAssigneeId?: string | null | undefined;
    archived?: boolean | undefined;
}>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
