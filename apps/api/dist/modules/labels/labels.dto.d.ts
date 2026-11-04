import { z } from 'zod';
export declare const AccentEnum: z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>;
export declare const CreateLabelSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodDefault<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    color: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET";
}, {
    name: string;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
}>;
export type CreateLabelDto = z.infer<typeof CreateLabelSchema>;
export declare const UpdateLabelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodEnum<["INDIGO", "TEAL", "AMBER", "ROSE", "VIOLET"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
}, {
    name?: string | undefined;
    color?: "INDIGO" | "TEAL" | "AMBER" | "ROSE" | "VIOLET" | undefined;
}>;
export type UpdateLabelDto = z.infer<typeof UpdateLabelSchema>;
