"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MembersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
const crypto_util_1 = require("../../common/utils/crypto.util");
let MembersService = MembersService_1 = class MembersService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(MembersService_1.name);
    }
    getAppBaseUrl() {
        return process.env.APP_URL || 'https://doit.kachakaran.tech';
    }
    async getMembers(workspaceId) {
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
    async getInvitations(workspaceId) {
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
    async inviteMember(workspaceId, invitedById, dto) {
        const email = dto.email ? dto.email.trim().toLowerCase() : null;
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Workspace not found.', 404);
        }
        const inviter = await this.prisma.user.findUnique({
            where: { id: invitedById },
        });
        if (email) {
            const existingMember = await this.prisma.membership.findFirst({
                where: {
                    workspaceId,
                    user: { email },
                },
            });
            if (existingMember) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'This user is already a member of this workspace.', 409, [{ field: 'email', issue: 'already_member' }]);
            }
            const existingInvite = await this.prisma.workspaceInvitation.findFirst({
                where: {
                    workspaceId,
                    email,
                    status: 'PENDING',
                    expiresAt: { gt: new Date() },
                },
            });
            if (existingInvite) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'A pending invitation already exists for this email address.', 409, [{ field: 'email', issue: 'already_invited' }]);
            }
        }
        const rawToken = (0, crypto_util_1.generateInvitationToken)();
        const tokenHash = (0, crypto_util_1.hashInvitationToken)(rawToken);
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
        const inviteUrl = `${this.getAppBaseUrl()}/invite/${rawToken}`;
        let emailSent = false;
        let emailError;
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
        this.logger.log(`Invitation created for workspace ${workspace.name} (id: ${invitation.id}, email: ${email || 'link-only'}, emailSent: ${emailSent})`);
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
    async revokeInvitation(workspaceId, invitationId) {
        const invitation = await this.prisma.workspaceInvitation.findFirst({
            where: { id: invitationId, workspaceId },
        });
        if (!invitation) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Invitation not found.', 404);
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
    async resendInvitation(workspaceId, invitationId, actorId) {
        const invitation = await this.prisma.workspaceInvitation.findFirst({
            where: { id: invitationId, workspaceId },
            include: { workspace: true },
        });
        if (!invitation) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Invitation not found.', 404);
        }
        if (!invitation.email) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Cannot resend email for a shareable link invitation without an email address.', 400);
        }
        if (invitation.status === 'REVOKED') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'Cannot resend a revoked invitation. Please generate a new invitation.', 400);
        }
        const rawToken = (0, crypto_util_1.generateInvitationToken)();
        const tokenHash = (0, crypto_util_1.hashInvitationToken)(rawToken);
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
        const inviteUrl = `${this.getAppBaseUrl()}/invite/${rawToken}`;
        const emailResult = await this.emailService.sendInvitationEmail(invitation.email, {
            inviterName: inviter?.name || 'A teammate',
            workspaceName: invitation.workspace.name,
            role: invitation.role,
            inviteUrl,
            expiresAt,
        });
        return {
            success: true,
            emailSent: emailResult.delivered,
            emailError: emailResult.reason,
            inviteUrl,
            token: rawToken,
        };
    }
    async validateToken(token) {
        if (!token || token.trim().length < 10) {
            return { valid: false, reason: 'INVALID_TOKEN' };
        }
        const tokenHash = (0, crypto_util_1.hashInvitationToken)(token);
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
    async acceptInvite(userId, token) {
        if (!token || token.trim().length < 10) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Invalid invitation token.', 400);
        }
        const tokenHash = (0, crypto_util_1.hashInvitationToken)(token);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.USER_NOT_FOUND, 'User not found.', 401);
        }
        return this.prisma.$transaction(async (tx) => {
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
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Invalid invitation token.', 404);
            }
            if (invitation.status === 'REVOKED') {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, 'This invitation has been revoked.', 400);
            }
            if (new Date() > invitation.expiresAt) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'This invitation has expired.', 400);
            }
            if (invitation.usesCount >= invitation.maxUses) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'This invitation link has reached its maximum number of uses.', 400);
            }
            if (invitation.email) {
                if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
                    throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, `This invitation is restricted to ${invitation.email}. You are logged in as ${user.email}.`, 403);
                }
            }
            const existingMembership = await tx.membership.findFirst({
                where: {
                    workspaceId: invitation.workspaceId,
                    userId: user.id,
                },
            });
            if (existingMembership) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'You are already a member of this workspace.', 409);
            }
            const membership = await tx.membership.create({
                data: {
                    workspaceId: invitation.workspaceId,
                    userId: user.id,
                    role: invitation.role,
                    acceptedAt: new Date(),
                },
            });
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
            this.logger.log(`User ${user.email} successfully accepted invitation to workspace ${invitation.workspace.name} with role ${invitation.role}`);
            return {
                success: true,
                workspace: invitation.workspace,
                role: membership.role,
            };
        });
    }
    async updateRole(workspaceId, memberId, dto) {
        const membership = await this.prisma.membership.findFirst({
            where: { id: memberId, workspaceId },
        });
        if (!membership) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Membership not found.', 404);
        }
        if (membership.role === 'OWNER') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, 'Cannot modify the workspace owner role.', 403);
        }
        const updated = await this.prisma.membership.update({
            where: { id: memberId },
            data: { role: dto.role },
        });
        return updated;
    }
    async removeMember(workspaceId, memberId) {
        const membership = await this.prisma.membership.findFirst({
            where: { id: memberId, workspaceId },
        });
        if (!membership) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Membership not found.', 404);
        }
        if (membership.role === 'OWNER') {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.FORBIDDEN, 'Cannot remove the workspace owner.', 403);
        }
        await this.prisma.membership.delete({
            where: { id: memberId },
        });
        return { success: true };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = MembersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], MembersService);
//# sourceMappingURL=members.service.js.map