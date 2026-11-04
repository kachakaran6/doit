"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    key: zod_1.z
        .string()
        .min(2)
        .max(5)
        .regex(/^[A-Z0-9]+$/, 'Key must be 2-5 uppercase alphanumeric characters')
        .transform((k) => k.toUpperCase()),
    description: zod_1.z.string().optional(),
    color: zod_1.z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']).default('INDIGO'),
});
exports.UpdateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    color: zod_1.z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']).optional(),
    archived: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=projects.dto.js.map