"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInviteSchema = exports.UpdateMemberRoleSchema = exports.InviteMemberSchema = void 0;
const zod_1 = require("zod");
exports.InviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['ADMIN', 'TESTER', 'VIEWER']).default('TESTER'),
});
exports.UpdateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'TESTER', 'VIEWER']),
});
exports.AcceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(8),
});
//# sourceMappingURL=members.dto.js.map