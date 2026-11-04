"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkspaceSchema = exports.CreateWorkspaceSchema = void 0;
const zod_1 = require("zod");
exports.CreateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Workspace name must be at least 2 characters'),
    slug: zod_1.z
        .string()
        .min(2)
        .max(30)
        .regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens')
        .optional(),
});
exports.UpdateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
});
//# sourceMappingURL=workspaces.dto.js.map