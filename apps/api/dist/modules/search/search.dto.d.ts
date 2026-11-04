import { z } from 'zod';
export declare const SearchQuerySchema: z.ZodObject<{
    q: z.ZodDefault<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    workspaceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit: number;
    cursor?: string | undefined;
    workspaceId?: string | undefined;
    types?: string | undefined;
}, {
    cursor?: string | undefined;
    workspaceId?: string | undefined;
    q?: string | undefined;
    limit?: number | undefined;
    types?: string | undefined;
}>;
export type SearchQueryDto = z.infer<typeof SearchQuerySchema>;
export interface SearchResultItem {
    type: 'task' | 'bug' | 'sticky' | 'comment';
    id: string;
    title: string;
    snippet: string;
    score: number;
    projectKey?: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}
