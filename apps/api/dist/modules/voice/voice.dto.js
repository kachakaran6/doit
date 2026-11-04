"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachVoiceSchema = exports.UpdateVoiceTextSchema = exports.CreateVoiceNoteSchema = exports.VoiceLanguageEnum = void 0;
const zod_1 = require("zod");
exports.VoiceLanguageEnum = zod_1.z.enum(['en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN', 'auto']);
exports.CreateVoiceNoteSchema = zod_1.z.object({
    language: exports.VoiceLanguageEnum.default('en-IN'),
    durationMs: zod_1.z.coerce
        .number()
        .int('Duration must be an integer')
        .min(1, 'Duration must be positive')
        .max(300000, 'Audio duration cannot exceed 5 minutes (300,000 ms)'),
});
exports.UpdateVoiceTextSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text is required'),
});
exports.AttachVoiceSchema = zod_1.z
    .object({
    taskId: zod_1.z.string().uuid().optional(),
    commentId: zod_1.z.string().uuid().optional(),
})
    .refine((data) => {
    const targets = [data.taskId, data.commentId].filter(Boolean);
    return targets.length === 1;
}, {
    message: 'VoiceNote must attach to exactly one of taskId or commentId.',
    path: ['taskId'],
});
//# sourceMappingURL=voice.dto.js.map