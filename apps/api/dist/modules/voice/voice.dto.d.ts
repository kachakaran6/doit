import { z } from 'zod';
export declare const VoiceLanguageEnum: z.ZodEnum<["en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "auto"]>;
export declare const CreateVoiceNoteSchema: z.ZodObject<{
    language: z.ZodDefault<z.ZodEnum<["en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "auto"]>>;
    durationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    language: "en-IN" | "hi-IN" | "mr-IN" | "ta-IN" | "te-IN" | "auto";
    durationMs: number;
}, {
    durationMs: number;
    language?: "en-IN" | "hi-IN" | "mr-IN" | "ta-IN" | "te-IN" | "auto" | undefined;
}>;
export type CreateVoiceNoteDto = z.infer<typeof CreateVoiceNoteSchema>;
export declare const UpdateVoiceTextSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export type UpdateVoiceTextDto = z.infer<typeof UpdateVoiceTextSchema>;
export declare const AttachVoiceSchema: z.ZodEffects<z.ZodObject<{
    taskId: z.ZodOptional<z.ZodString>;
    commentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    taskId?: string | undefined;
    commentId?: string | undefined;
}, {
    taskId?: string | undefined;
    commentId?: string | undefined;
}>, {
    taskId?: string | undefined;
    commentId?: string | undefined;
}, {
    taskId?: string | undefined;
    commentId?: string | undefined;
}>;
export type AttachVoiceDto = z.infer<typeof AttachVoiceSchema>;
