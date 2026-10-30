import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
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
] as const;

export const MAX_SIZE_BYTES: Record<string, number> = {
  image: 12 * 1024 * 1024, // 12 MB
  video: 120 * 1024 * 1024, // 120 MB
  audio: 25 * 1024 * 1024, // 25 MB
  file: 25 * 1024 * 1024, // 25 MB
};

export function getMimeKind(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'FILE';
}

export function getMaxBytesForMime(mimeType: string): number {
  const kind = getMimeKind(mimeType).toLowerCase();
  return MAX_SIZE_BYTES[kind] || MAX_SIZE_BYTES.file;
}

export const InitUploadSchema = z
  .object({
    contentType: z.enum(ALLOWED_MIME_TYPES, {
      errorMap: () => ({
        message: 'Unsupported content type. Supported: jpeg, png, webp, heic, mp4, quicktime, m4a, wav, aac, pdf.',
      }),
    }),
    sizeBytes: z.number().int().positive('File size must be positive'),
    purpose: z.enum(['TASK', 'BUG', 'COMMENT', 'VOICE']).default('TASK'),
  })
  .refine(
    (data) => {
      const maxAllowed = getMaxBytesForMime(data.contentType);
      return data.sizeBytes <= maxAllowed;
    },
    (data) => ({
      message: `File size exceeds allowed maximum of ${Math.round(
        getMaxBytesForMime(data.contentType) / (1024 * 1024),
      )} MB for ${data.contentType}.`,
      path: ['sizeBytes'],
    }),
  );

export type InitUploadDto = z.infer<typeof InitUploadSchema>;

export const CompleteUploadSchema = z
  .object({
    taskId: z.string().uuid().optional(),
    bugId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
    durationMs: z.number().int().optional(),
  })
  .refine(
    (data) => {
      const targets = [data.taskId, data.bugId, data.commentId].filter(Boolean);
      return targets.length === 1;
    },
    {
      message: 'Attachment must attach to exactly one of taskId, bugId, or commentId.',
      path: ['taskId'],
    },
  );

export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;
