"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLabelSchema = exports.CreateLabelSchema = exports.AccentEnum = void 0;
const zod_1 = require("zod");
exports.AccentEnum = zod_1.z.enum(['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET']);
exports.CreateLabelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Label name is required').max(30),
    color: exports.AccentEnum.default('INDIGO'),
});
exports.UpdateLabelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(30).optional(),
    color: exports.AccentEnum.optional(),
});
//# sourceMappingURL=labels.dto.js.map