import { z } from 'zod';

export const RoleEnum = z.preprocess((v) => {
  if (typeof v === 'string') {
    const upper = v.toUpperCase();
    if (upper === 'MEMBER') return 'TESTER';
    return upper;
  }
  return v;
}, z.enum(['ADMIN', 'TESTER', 'VIEWER']));

export const InviteMemberSchema = z.object({
  email: z.string().email().optional().nullable(),
  role: RoleEnum.default('TESTER'),
  maxUses: z.number().int().min(1).max(1000).default(1),
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: RoleEnum,
});

export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(10, 'Invitation token is required'),
});

export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;
