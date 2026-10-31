import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';
import { AuthUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Missing or malformed Authorization header.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Missing Bearer token.', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUserPayload>(token, {
        secret: process.env.JWT_SECRET || 'super-secret-development-jwt-key-replace-in-prod',
      });

      // Validate access token against session in database (revoked session stops working immediately)
      if (payload.sid) {
        const session = await this.prisma.session.findUnique({
          where: { id: payload.sid },
          select: { revokedAt: true },
        });
        if (!session || session.revokedAt) {
          throw new AppError(ErrorCode.SESSION_REVOKED, 'Session has been revoked.', 401);
        }
      }

      (request as Request & { user: AuthUserPayload }).user = payload;
      return true;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Access token is invalid or expired.', 401);
    }
  }
}
