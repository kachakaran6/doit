import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { InviteMemberDto, UpdateMemberRoleDto } from './members.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import {
  generateInvitationToken,
  hashInvitationToken,
} from '../../common/utils/crypto.util';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private getAppBaseUrl(clientOrigin?: string): string {
    if (clientOrigin) {
      try {
        const parsed = new URL(clientOrigin);
        return `${parsed.protocol}//${parsed.host}`;
      } catch {
        // ignore invalid URL
      }
    }
    return process.env.APP_URL || 'https://doit-web.samyukt.pro';
  }

  async getMembers(workspaceId: string) {
    return this.prisma.membership.findMany({
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
  }

  async getInvitations(workspaceId: string) {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    // Dynamically mark expired status if past expiration and still PENDING
    return invitations.map((inv) => {
      let currentStatus = inv.status;
      if (currentStatus === 'PENDING' && inv.expiresAt < now) {
        currentStatus = 'EXPIRED';
      }
      return {
        id: inv.id,
        workspaceId: inv.workspaceId,
        email: inv.email,
        role: inv.role,
        status: currentStatus,
        maxUses: inv.maxUses,
        usesCount: inv.usesCount,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        revokedAt: inv.revokedAt,
        createdAt: inv.createdAt,
        invitedBy: inv.invitedBy,
      };
    });
  }

  async inviteMember(
    workspaceId: string,
    invitedById: string,
    dto: InviteMemberDto,
    clientOrigin?: string,
  ) {
    const email = dto.email ? dto.email.trim().toLowerCase() : null;

    // Check workspace existence & fetch details
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Workspace not found.', 404);
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: invitedById },
    });

    if (email) {
      // Check if user is already an active member of this workspace
      const existingMember = await this.prisma.membership.findFirst({
        where: {
          workspaceId,
          user: { email },
        },
      });

      if (existingMember) {
        throw new AppError(
          ErrorCode.CONFLICT,
          'This user is already a member of this workspace.',
          409,
          [{ field: 'email', issue: 'already_member' }],
        );
      }

      // Check if there is already an active pending invitation for this email
      const existingInvite = await this.prisma.workspaceInvitation.findFirst({
        where: {
          workspaceId,
          email,
          status: 'PENDING',
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        throw new AppError(
          ErrorCode.CONFLICT,
          'A pending invitation already exists for this email address.',
          409,
          [{ field: 'email', issue: 'already_invited' }],
        );
      }
    }

    // Generate cryptographic token and hash
    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);

    const expiresInDays = dto.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const maxUses = email ? 1 : dto.maxUses || 1;

    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        tokenHash,
        role: dto.role,
        invitedById,
        status: 'PENDING',
        maxUses,
        usesCount: 0,
        expiresAt,
      },
    });

    const inviteUrl = `${this.getAppBaseUrl(clientOrigin)}/invite/${rawToken}`;
    let emailSent = false;
    let emailError: string | undefined;

    if (email) {
      const emailResult = await this.emailService.sendInvitationEmail(email, {
        inviterName: inviter?.name || 'A teammate',
        workspaceName: workspace.name,
        role: dto.role,
        inviteUrl,
        expiresAt,
      });

      emailSent = emailResult.delivered;
      if (!emailResult.delivered) {
        emailError = emailResult.reason;
      }
    }

    this.logger.log(
      `Invitation created for workspace ${workspace.name} (id: ${invitation.id}, email: ${email || 'link-only'}, emailSent: ${emailSent})`,
    );

    return {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      maxUses: invitation.maxUses,
      usesCount: invitation.usesCount,
      expiresAt: invitation.expiresAt,
      token: rawToken,
      inviteUrl,
      emailSent,
      emailError,
    };
  }

  async revokeInvitation(workspaceId: string, invitationId: string) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { id: invitationId, workspaceId },
    });

    if (!invitation) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Invitation not found.', 404);
    }

    if (invitation.status === 'REVOKED') {
      return { success: true, message: 'Invitation was already revoked' };
    }

    await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Invitation ${invitationId} revoked for workspace ${workspaceId}`);
    return { success: true };
  }

  async resendInvitation(
    workspaceId: string,
    invitationId: string,
    actorId: string,
    clientOrigin?: string,
  ) {
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { id: invitationId, workspaceId },
      include: { workspace: true },
    });

    if (!invitation) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Invitation not found.', 404);
    }

    if (!invitation.email) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        'Cannot resend email for a shareable link invitation without an email address.',
        400,
      );
    }

    if (invitation.status === 'REVOKED') {
      throw new AppError(
        ErrorCode.CONFLICT,
        'Cannot resend a revoked invitation. Please generate a new invitation.',
        400,
      );
    }

    // Generate fresh token and extend expiration
    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        tokenHash,
        expiresAt,
        status: 'PENDING',
      },
    });

    const inviter = await this.prisma.user.findUnique({
      where: { id: actorId },
    });

    const inviteUrl = `${this.getAppBaseUrl(clientOrigin)}/invite/${rawToken}`;
    const emailResult = await this.emailService.sendInvitationEmail(
      invitation.email,
      {
        inviterName: inviter?.name || 'A teammate',
        workspaceName: invitation.workspace.name,
        role: invitation.role,
        inviteUrl,
        expiresAt,
      },
    );

    return {
      success: true,
      emailSent: emailResult.delivered,
      emailError: emailResult.reason,
      inviteUrl,
      token: rawToken,
    };
  }

  /**
   * Public endpoint to validate an invitation token before accepting.
   */
  async validateToken(token: string) {
    if (!token || token.trim().length < 10) {
      return { valid: false, reason: 'INVALID_TOKEN' };
    }

    const tokenHash = hashInvitationToken(token);
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { tokenHash },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (invitation.status === 'REVOKED') {
      return { valid: false, reason: 'REVOKED', workspaceName: invitation.workspace.name };
    }

    if (new Date() > invitation.expiresAt) {
      return { valid: false, reason: 'EXPIRED', workspaceName: invitation.workspace.name };
    }

    if (invitation.usesCount >= invitation.maxUses) {
      return { valid: false, reason: 'MAX_USES_REACHED', workspaceName: invitation.workspace.name };
    }

    return {
      valid: true,
      workspace: invitation.workspace,
      role: invitation.role,
      invitedBy: invitation.invitedBy?.name || 'A team administrator',
      emailRestricted: Boolean(invitation.email),
      allowedEmail: invitation.email,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Accepts invitation inside an atomic database transaction.
   */
  async acceptInvite(userId: string, token: string) {
    if (!token || token.trim().length < 10) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Invalid invitation token.', 400);
    }

    const tokenHash = hashInvitationToken(token);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 'User not found.', 401);
    }

    return this.prisma.$transaction(async (tx) => {
      // Find invitation by token hash
      const invitation = await tx.workspaceInvitation.findUnique({
        where: { tokenHash },
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

      if (!invitation) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Invalid invitation token.', 404);
      }

      if (invitation.status === 'REVOKED') {
        throw new AppError(ErrorCode.FORBIDDEN, 'This invitation has been revoked.', 400);
      }

      if (new Date() > invitation.expiresAt) {
        throw new AppError(ErrorCode.TOKEN_EXPIRED, 'This invitation has expired.', 400);
      }

      if (invitation.usesCount >= invitation.maxUses) {
        throw new AppError(
          ErrorCode.CONFLICT,
          'This invitation link has reached its maximum number of uses.',
          400,
        );
      }

      // Check email restriction if invitation was restricted to a specific email
      if (invitation.email) {
        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
          throw new AppError(
            ErrorCode.FORBIDDEN,
            `This invitation is restricted to ${invitation.email}. You are logged in as ${user.email}.`,
            403,
          );
        }
      }

      // Check if user is already a member
      const existingMembership = await tx.membership.findFirst({
        where: {
          workspaceId: invitation.workspaceId,
          userId: user.id,
        },
      });

      if (existingMembership) {
        throw new AppError(
          ErrorCode.CONFLICT,
          'You are already a member of this workspace.',
          409,
        );
      }

      // Create membership
      const membership = await tx.membership.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: user.id,
          role: invitation.role,
          acceptedAt: new Date(),
        },
      });

      // Increment usage count and update status
      const nextUses = invitation.usesCount + 1;
      const isFullyUsed = nextUses >= invitation.maxUses;

      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: {
          usesCount: nextUses,
          status: isFullyUsed ? 'ACCEPTED' : 'PENDING',
          acceptedAt: new Date(),
        },
      });

      // Record activity
      await tx.activityLog.create({
        data: {
          workspaceId: invitation.workspaceId,
          actorId: user.id,
          action: 'member.joined',
          meta: {
            role: invitation.role,
            invitationId: invitation.id,
          },
        },
      });

      this.logger.log(
        `User ${user.email} successfully accepted invitation to workspace ${invitation.workspace.name} with role ${invitation.role}`,
      );

      return {
        success: true,
        workspace: invitation.workspace,
        role: membership.role,
      };
    });
  }

  async updateRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
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
