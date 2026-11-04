"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQuerySchema = void 0;
const zod_1 = require("zod");
exports.SearchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().default(''),
    types: zod_1.z.string().optional(),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    workspaceId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=search.dto.js.map