"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertStickySchema = exports.ReorderStickySchema = exports.UpdateStickySchema = exports.CreateStickySchema = exports.AccentEnum = void 0;
const zod_1 = require("zod");
exports.AccentEnum = zod_1.z.preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), zod_1.z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']));
exports.CreateStickySchema = zod_1.z
    .object({
    body: zod_1.z.string().trim().min(1, 'Body is required').max(5000, 'Body cannot exceed 5000 characters'),
    color: exports.AccentEnum.default('AMBER'),
    pinned: zod_1.z.boolean().optional(),
    isPinned: zod_1.z.boolean().optional(),
})
    .transform((data) => ({
    body: data.body,
    color: data.color,
    pinned: data.pinned ?? data.isPinned ?? false,
}));
exports.UpdateStickySchema = zod_1.z.object({
    body: zod_1.z.string().trim().min(1, 'Body is required').max(5000, 'Body cannot exceed 5000 characters').optional(),
    color: exports.AccentEnum.optional(),
    pinned: zod_1.z.boolean().optional(),
});
exports.ReorderStickySchema = zod_1.z.object({
    beforeId: zod_1.z.string().uuid().optional(),
    afterId: zod_1.z.string().uuid().optional(),
});
exports.ConvertStickySchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().optional(),
});
//# sourceMappingURL=stickies.dto.js.map