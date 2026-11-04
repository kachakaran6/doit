import { z } from 'zod';
export declare const CreateWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug?: string | undefined;
}, {
    name: string;
    slug?: string | undefined;
}>;
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;
export declare const UpdateWorkspaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
}, {
    name?: string | undefined;
}>;
export type UpdateWorkspaceDto = z.infer<typeof UpdateWorkspaceSchema>;
