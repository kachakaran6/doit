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
const crypto = require("node:crypto");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let MembersService = MembersService_1 = class MembersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MembersService_1.name);
    }
    async getMembers(workspaceId) {
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
    async inviteMember(workspaceId, dto) {
        const email = dto.email.toLowerCase();
        const existingMember = await this.prisma.membership.findFirst({
            where: {
                workspaceId,
                OR: [{ invitedEmail: email }, { user: { email } }],
            },
        });
        if (existingMember) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'This user is already a member or has an active pending invitation.', 409, [{ field: 'email', issue: 'already_invited' }]);
        }
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user) {
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
    async acceptInvite(userId, token) {
        const membership = await this.prisma.membership.findUnique({
            where: { inviteToken: token },
            include: { workspace: true },
        });
        if (!membership) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Invalid invitation token.', 404);
        }
        if (membership.inviteExpiresAt && new Date() > membership.inviteExpiresAt) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Invitation has expired.', 400);
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembersService);
//# sourceMappingURL=members.service.js.map