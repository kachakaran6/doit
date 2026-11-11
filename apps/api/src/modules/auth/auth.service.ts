import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService, TokenPair } from './token.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

export interface AuthSuccessResult extends TokenPair {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    locale: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSuccessResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, 'An account with this email already exists.', 409);
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
      },
    });

    // Create default workspace for new user
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

    // Create session
    const familyId = uuidv4();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        familyId,
        refreshHash: '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      session.id,
      workspace.id,
      'OWNER',
    );

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

  async login(dto: LoginDto): Promise<AuthSuccessResult> {
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
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password.', 401);
    }

    const valid = await this.passwordService.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password.', 401);
    }

    const familyId = uuidv4();
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
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      session.id,
      primaryMembership?.workspaceId,
      primaryMembership?.role,
    );

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

  async refresh(refreshToken: string): Promise<TokenPair> {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getSessions(userId: string) {
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

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Session not found.', 404);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      this.logger.log(`[Mail Mock] Password reset link dispatched for: ${user.email}`);
    }

    // Always return success to prevent email enumeration
    return { sent: true };
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Email is required.', 400);
    }
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Account with this email does not exist.', 404);
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke previous sessions on password change
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
}
