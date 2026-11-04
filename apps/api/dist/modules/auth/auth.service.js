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
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, passwordService, tokenService) {
        this.prisma = prisma;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
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
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (user) {
            this.logger.log(`[Mail Mock] Password reset link dispatched for: ${user.email}`);
        }
        return { sent: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService,
        token_service_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map