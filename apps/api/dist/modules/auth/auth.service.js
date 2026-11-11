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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const email_service_1 = require("../email/email.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, passwordService, tokenService, emailService, jwtService) {
        this.prisma = prisma;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.CONFLICT, 'An account with this email already exists.', 409);
        }
        const passwordHash = await this.passwordService.hash(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                name: dto.name,
            },
        });
        const slug = `ws-${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
        const workspace = await this.prisma.workspace.create({
            data: {
                name: `${dto.name}'s Workspace`,
                slug,
                ownerId: user.id,
            },
        });
        await this.prisma.membership.create({
            data: {
                workspaceId: workspace.id,
                userId: user.id,
                role: 'OWNER',
            },
        });
        const familyId = (0, uuid_1.v4)();
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                familyId,
                refreshHash: '',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        const tokens = await this.tokenService.generateTokenPair(user.id, session.id, workspace.id, 'OWNER');
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                locale: user.locale,
            },
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: {
                memberships: {
                    include: {
                        workspace: true,
                    },
                },
            },
        });
        if (!user) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password.', 401);
        }
        const valid = await this.passwordService.verify(user.passwordHash, dto.password);
        if (!valid) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password.', 401);
        }
        const familyId = (0, uuid_1.v4)();
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                familyId,
                refreshHash: '',
                deviceName: dto.deviceName,
                deviceId: dto.deviceId,
                platform: dto.platform,
                appVersion: dto.appVersion,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        const primaryMembership = user.memberships[0];
        const tokens = await this.tokenService.generateTokenPair(user.id, session.id, primaryMembership?.workspaceId, primaryMembership?.role);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                locale: user.locale,
            },
        };
    }
    async refresh(refreshToken) {
        return this.tokenService.rotateRefreshToken(refreshToken);
    }
    async logout(sessionId) {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }
    async logoutAll(userId) {
        await this.prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async getSessions(userId) {
        const sessions = await this.prisma.session.findMany({
            where: { userId, revokedAt: null },
            orderBy: { lastSeenAt: 'desc' },
            select: {
                id: true,
                deviceName: true,
                deviceId: true,
                platform: true,
                appVersion: true,
                lastSeenAt: true,
                createdAt: true,
            },
        });
        return sessions;
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.session.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Session not found.', 404);
        }
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }
    async forgotPassword(email) {
        const cleanEmail = email?.trim().toLowerCase();
        if (!cleanEmail) {
            return { sent: false, message: 'Email address is required.' };
        }
        const user = await this.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (user) {
            try {
                const resetToken = await this.jwtService.signAsync({
                    sub: user.id,
                    email: user.email,
                    type: 'password_reset',
                }, {
                    expiresIn: '1h',
                    secret: process.env.JWT_SECRET || 'super-secret-development-jwt-key-replace-in-prod',
                });
                const baseUrl = process.env.FRONTEND_URL ||
                    process.env.APP_URL ||
                    'https://doit.kachakaran.tech';
                const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;
                const result = await this.emailService.sendPasswordResetEmail(user.email, {
                    userName: user.name || user.email.split('@')[0],
                    resetUrl,
                    expiresInMinutes: 60,
                });
                this.logger.log(`[Password Reset] Dispatched email to ${user.email} (delivered: ${result.delivered})`);
            }
            catch (err) {
                this.logger.error(`[Password Reset] Failed to send email to ${user.email}: ${err.message}`);
            }
        }
        return {
            sent: true,
            message: 'If an account exists with this email address, password reset instructions have been sent.',
        };
    }
    async resetPassword(email, newPassword, token) {
        const cleanEmail = email?.trim().toLowerCase();
        if (!cleanEmail) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Email is required.', 400);
        }
        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: process.env.JWT_SECRET || 'super-secret-development-jwt-key-replace-in-prod',
                });
                if (payload.type !== 'password_reset' || payload.email?.toLowerCase() !== cleanEmail) {
                    throw new app_error_1.AppError(error_code_enum_1.ErrorCode.INVALID_CREDENTIALS, 'Invalid or expired password reset token.', 401);
                }
            }
            catch (err) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Invalid or expired password reset token. Please request a new link.', 401);
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (!user) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Account with this email does not exist.', 404);
        }
        const passwordHash = await this.passwordService.hash(newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
        await this.prisma.session.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        this.logger.log(`Password reset successfully for user: ${user.email}`);
        return {
            success: true,
            message: 'Password has been reset successfully. Please sign in with your new password.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService,
        token_service_1.TokenService,
        email_service_1.EmailService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map