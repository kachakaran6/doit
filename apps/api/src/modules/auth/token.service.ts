import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokenPair(
    userId: string,
    sessionId: string,
    workspaceId?: string,
    role?: string,
  ): Promise<TokenPair> {
    const accessExpiresIn = 30 * 24 * 60 * 60; // 30 days long-lived mobile session

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

    // 32-byte secure random hex refresh token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const refreshHash = await argon2.hash(rawRefreshToken, {
      type: argon2.argon2id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180); // 180 days (6 months) persistent session

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

  async rotateRefreshToken(tokenComposite: string): Promise<TokenPair> {
    const parts = tokenComposite.split(':');
    if (parts.length !== 2) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Malformed refresh token.', 401);
    }

    const [sessionId, rawToken] = parts;
    if (!sessionId || !rawToken) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Invalid refresh token structure.', 401);
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
      throw new AppError(ErrorCode.SESSION_REVOKED, 'Session does not exist or expired.', 401);
    }

    if (session.revokedAt) {
      // Replay attack detected: token presented for an already revoked session
      // Revoke all sessions belonging to the same family
      await this.prisma.session.updateMany({
        where: { familyId: session.familyId },
        data: { revokedAt: new Date() },
      });
      throw new AppError(ErrorCode.SESSION_REVOKED, 'Session revoked due to token reuse.', 401);
    }

    if (new Date() > session.expiresAt) {
      throw new AppError(ErrorCode.TOKEN_EXPIRED, 'Refresh token has expired.', 401);
    }

    const isValid = await argon2.verify(session.refreshHash, rawToken);
    if (!isValid) {
      // Check for in-flight concurrency race: if session was rotated in the last 60 seconds, issue tokens gracefully
      const isRecentRotation = session.lastSeenAt && (Date.now() - session.lastSeenAt.getTime() < 60000);
      if (isRecentRotation) {
        const membership = session.user.memberships[0];
        return this.generateTokenPair(session.userId, session.id, membership?.workspaceId, membership?.role);
      }

      // Token mismatch / token replay: revoke entire family immediately
      await this.prisma.session.updateMany({
        where: { familyId: session.familyId },
        data: { revokedAt: new Date() },
      });
      throw new AppError(ErrorCode.SESSION_REVOKED, 'Invalid refresh token presented. Session family revoked.', 401);
    }

    const membership = session.user.memberships[0];
    return this.generateTokenPair(session.userId, session.id, membership?.workspaceId, membership?.role);
  }
}
