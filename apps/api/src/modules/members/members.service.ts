import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { InviteMemberDto, UpdateMemberRoleDto } from './members.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMembers(workspaceId: string) {
    const members = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members;
  }

  async inviteMember(workspaceId: string, dto: InviteMemberDto) {
    const email = dto.email.toLowerCase();

    // Check if user is already a member
    const existingMember = await this.prisma.membership.findFirst({
      where: {
        workspaceId,
        OR: [{ invitedEmail: email }, { user: { email } }],
      },
    });

    if (existingMember) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'This user is already a member or has an active pending invitation.',
        409,
        [{ field: 'email', issue: 'already_invited' }],
      );
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day invite

    // Find if user already has an account
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Create active or invited membership
      const membership = await this.prisma.membership.create({
        data: {
          workspaceId,
          userId: user.id,
          role: dto.role,
          invitedEmail: email,
          inviteToken: token,
          inviteExpiresAt: expiresAt,
        },
      });
      this.logger.log(`Invite link generated for ${email}: token=${token}`);
      return { id: membership.id, email, token, expiresAt };
    }

    // For non-registered user, create a temporary invite placeholder
    const tempUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash: '',
        name: email.split('@')[0] || 'Invited User',
      },
    });

    const membership = await this.prisma.membership.create({
      data: {
        workspaceId,
        userId: tempUser.id,
        role: dto.role,
        invitedEmail: email,
        inviteToken: token,
        inviteExpiresAt: expiresAt,
      },
    });

    this.logger.log(`Invite link generated for new user ${email}: token=${token}`);
    return { id: membership.id, email, token, expiresAt };
  }

  async acceptInvite(userId: string, token: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { inviteToken: token },
      include: { workspace: true },
    });

    if (!membership) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Invalid invitation token.', 404);
    }

    if (membership.inviteExpiresAt && new Date() > membership.inviteExpiresAt) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Invitation has expired.', 400);
    }

    // Bind membership to the accepting user
    const updated = await this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        userId,
        acceptedAt: new Date(),
        inviteToken: null,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      success: true,
      workspace: updated.workspace,
      role: updated.role,
    };
  }

  async updateRole(workspaceId: string, memberId: string, dto: UpdateMemberRoleDto) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!membership) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Membership not found.', 404);
    }

    if (membership.role === 'OWNER') {
      throw new AppError(ErrorCode.FORBIDDEN, 'Cannot modify the workspace owner role.', 403);
    }

    const updated = await this.prisma.membership.update({
      where: { id: memberId },
      data: { role: dto.role },
    });

    return updated;
  }

  async removeMember(workspaceId: string, memberId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!membership) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Membership not found.', 404);
    }

    if (membership.role === 'OWNER') {
      throw new AppError(ErrorCode.FORBIDDEN, 'Cannot remove the workspace owner.', 403);
    }

    await this.prisma.membership.delete({
      where: { id: memberId },
    });

    return { success: true };
  }
}
