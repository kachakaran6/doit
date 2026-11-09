"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInviteSchema = exports.UpdateMemberRoleSchema = exports.InviteMemberSchema = exports.RoleEnum = void 0;
const zod_1 = require("zod");
exports.RoleEnum = zod_1.z.preprocess((v) => {
    if (typeof v === 'string') {
        const upper = v.toUpperCase();
        if (upper === 'MEMBER')
            return 'TESTER';
        return upper;
    }
    return v;
}, zod_1.z.enum(['ADMIN', 'TESTER', 'VIEWER']));
exports.InviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional().nullable(),
    role: exports.RoleEnum.default('TESTER'),
    maxUses: zod_1.z.number().int().min(1).max(1000).default(1),
    expiresInDays: zod_1.z.number().int().min(1).max(90).default(7),
});
exports.UpdateMemberRoleSchema = zod_1.z.object({
    role: exports.RoleEnum,
});
exports.AcceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(10, 'Invitation token is required'),
});
//# sourceMappingURL=members.dto.js.map