"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteUploadSchema = exports.InitUploadSchema = exports.MAX_SIZE_BYTES = exports.ALLOWED_MIME_TYPES = void 0;
exports.getMimeKind = getMimeKind;
exports.getMaxBytesForMime = getMaxBytesForMime;
const zod_1 = require("zod");
exports.ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'audio/m4a',
    'audio/mp4',
    'audio/wav',
    'audio/aac',
    'application/pdf',
];
exports.MAX_SIZE_BYTES = {
    image: 12 * 1024 * 1024,
    video: 120 * 1024 * 1024,
    audio: 25 * 1024 * 1024,
    file: 25 * 1024 * 1024,
};
function getMimeKind(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'IMAGE';
    if (mimeType.startsWith('video/'))
        return 'VIDEO';
    if (mimeType.startsWith('audio/'))
        return 'AUDIO';
    return 'FILE';
}
function getMaxBytesForMime(mimeType) {
    const kind = getMimeKind(mimeType).toLowerCase();
    return exports.MAX_SIZE_BYTES[kind] || exports.MAX_SIZE_BYTES.file;
}
exports.InitUploadSchema = zod_1.z
    .object({
    contentType: zod_1.z.enum(exports.ALLOWED_MIME_TYPES, {
        errorMap: () => ({
            message: 'Unsupported content type. Supported: jpeg, png, webp, heic, mp4, quicktime, m4a, wav, aac, pdf.',
        }),
    }),
    sizeBytes: zod_1.z.number().int().positive('File size must be positive'),
    purpose: zod_1.z.enum(['TASK', 'BUG', 'COMMENT', 'VOICE']).default('TASK'),
})
    .refine((data) => {
    const maxAllowed = getMaxBytesForMime(data.contentType);
    return data.sizeBytes <= maxAllowed;
}, (data) => ({
    message: `File size exceeds allowed maximum of ${Math.round(getMaxBytesForMime(data.contentType) / (1024 * 1024))} MB for ${data.contentType}.`,
    path: ['sizeBytes'],
}));
exports.CompleteUploadSchema = zod_1.z
    .object({
    taskId: zod_1.z.string().uuid().optional(),
    bugId: zod_1.z.string().uuid().optional(),
    commentId: zod_1.z.string().uuid().optional(),
    width: zod_1.z.number().int().optional(),
    height: zod_1.z.number().int().optional(),
    durationMs: zod_1.z.number().int().optional(),
})
    .refine((data) => {
    const targets = [data.taskId, data.bugId, data.commentId].filter(Boolean);
    return targets.length === 1;
}, {
    message: 'Attachment must attach to exactly one of taskId, bugId, or commentId.',
    path: ['taskId'],
});
//# sourceMappingURL=attachments.dto.js.map