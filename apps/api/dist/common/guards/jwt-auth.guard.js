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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const public_decorator_1 = require("../decorators/public.decorator");
const app_error_1 = require("../errors/app.error");
const error_code_enum_1 = require("../errors/error-code.enum");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, jwtService, prisma) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Missing or malformed Authorization header.', 401);
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Missing Bearer token.', 401);
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'super-secret-development-jwt-key-replace-in-prod',
            });
            if (payload.sid) {
                const session = await this.prisma.session.findUnique({
                    where: { id: payload.sid },
                    select: { revokedAt: true },
                });
                if (!session || session.revokedAt) {
                    throw new app_error_1.AppError(error_code_enum_1.ErrorCode.SESSION_REVOKED, 'Session has been revoked.', 401);
                }
            }
            request.user = payload;
            return true;
        }
        catch (err) {
            if (err instanceof app_error_1.AppError)
                throw err;
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TOKEN_EXPIRED, 'Access token is invalid or expired.', 401);
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map