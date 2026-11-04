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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("node:crypto");
const argon2 = require("argon2");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let TokenService = class TokenService {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async generateTokenPair(userId, sessionId, workspaceId, role) {
        const accessExpiresIn = 15 * 60;
        const payload = {
            sub: userId,
            sid: sessionId,
            wsid: workspaceId,
            role: role ?? 'TESTER',
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: accessExpiresIn,
            secret: process.env.JWT_SECRET || 'super-secret-development-jwt-key-replace-in-prod',
        });
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const refreshHash = await argon2.hash(rawRefreshToken, {
            type: argon2.argon2id,
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                refreshHash,
                expiresAt,
                lastSeenAt: new Date(),
            },
        });
        return {
            accessToken,
            refreshToken: `${sessionId}:${rawRefreshToken}`,
            expiresIn: accessExpiresIn,
        };
    }
    async rotateRefreshToken(tokenComposite) {
        const parts = tokenComposite.split(':');
        if (parts.length !== 2) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Malformed refresh token.', 401);
        }
        const [sessionId, rawToken] = parts;
        if (!sessionId || !rawToken) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Invalid refresh token structure.', 401);
        }
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    include: {
                        memberships: true,
                    },
                },
            },
        });
        if (!session) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.SESSION_REVOKED, 'Session does not exist or expired.', 401);
        }
        if (session.revokedAt) {
            await this.prisma.session.updateMany({
                where: { familyId: session.familyId },
                data: { revokedAt: new Date() },
            });
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.SESSION_REVOKED, 'Session revoked due to token reuse.', 401);
        }
        if (new Date() > session.expiresAt) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Refresh token has expired.', 401);
        }
        const isValid = await argon2.verify(session.refreshHash, rawToken);
        if (!isValid) {
            await this.prisma.session.updateMany({
                where: { familyId: session.familyId },
                data: { revokedAt: new Date() },
            });
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.SESSION_REVOKED, 'Invalid refresh token presented. Session family revoked.', 401);
        }
        const membership = session.user.memberships[0];
        return this.generateTokenPair(session.userId, session.id, membership?.workspaceId, membership?.role);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map