import { z } from 'zod';

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TESTER', 'VIEWER']).default('TESTER'),
});

export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'TESTER', 'VIEWER']),
});

export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(8),
});

export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;
