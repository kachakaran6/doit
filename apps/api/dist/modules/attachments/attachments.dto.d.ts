import { z } from 'zod';
export declare const ALLOWED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime", "audio/m4a", "audio/mp4", "audio/wav", "audio/aac", "application/pdf"];
export declare const MAX_SIZE_BYTES: Record<string, number>;
export declare function getMimeKind(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
export declare function getMaxBytesForMime(mimeType: string): number;
export declare const InitUploadSchema: z.ZodEffects<z.ZodObject<{
    contentType: z.ZodEnum<["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime", "audio/m4a", "audio/mp4", "audio/wav", "audio/aac", "application/pdf"]>;
    sizeBytes: z.ZodNumber;
    purpose: z.ZodDefault<z.ZodEnum<["TASK", "BUG", "COMMENT", "VOICE"]>>;
}, "strip", z.ZodTypeAny, {
    sizeBytes: number;
    contentType: "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "video/mp4" | "video/quicktime" | "audio/m4a" | "audio/mp4" | "audio/wav" | "audio/aac" | "application/pdf";
    purpose: "TASK" | "BUG" | "VOICE" | "COMMENT";
}, {
    sizeBytes: number;
    contentType: "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "video/mp4" | "video/quicktime" | "audio/m4a" | "audio/mp4" | "audio/wav" | "audio/aac" | "application/pdf";
    purpose?: "TASK" | "BUG" | "VOICE" | "COMMENT" | undefined;
}>, {
    sizeBytes: number;
    contentType: "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "video/mp4" | "video/quicktime" | "audio/m4a" | "audio/mp4" | "audio/wav" | "audio/aac" | "application/pdf";
    purpose: "TASK" | "BUG" | "VOICE" | "COMMENT";
}, {
    sizeBytes: number;
    contentType: "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "video/mp4" | "video/quicktime" | "audio/m4a" | "audio/mp4" | "audio/wav" | "audio/aac" | "application/pdf";
    purpose?: "TASK" | "BUG" | "VOICE" | "COMMENT" | undefined;
}>;
export type InitUploadDto = z.infer<typeof InitUploadSchema>;
export declare const CompleteUploadSchema: z.ZodEffects<z.ZodObject<{
    taskId: z.ZodOptional<z.ZodString>;
    bugId: z.ZodOptional<z.ZodString>;
    commentId: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    taskId?: string | undefined;
    bugId?: string | undefined;
    commentId?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    durationMs?: number | undefined;
}, {
    taskId?: string | undefined;
    bugId?: string | undefined;
    commentId?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    durationMs?: number | undefined;
}>, {
    taskId?: string | undefined;
    bugId?: string | undefined;
    commentId?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    durationMs?: number | undefined;
}, {
    taskId?: string | undefined;
    bugId?: string | undefined;
    commentId?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    durationMs?: number | undefined;
}>;
export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;
