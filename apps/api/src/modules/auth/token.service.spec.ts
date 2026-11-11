import { TokenService } from './token.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    signAsync: jest.fn().mockResolvedValue('mock-access-jwt-token'),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1' }),
  })),
}));

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockJwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let mockPrisma: {
    session: {
      update: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(() => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-access-jwt-token'),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1' }),
    };
    mockPrisma = {
      session: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    tokenService = new TokenService(
      mockJwtService as unknown as ConstructorParameters<typeof TokenService>[0],
      mockPrisma as unknown as PrismaService,
    );
  });

  it('should generate valid token pair', async () => {
    const pair = await tokenService.generateTokenPair('user-1', 'session-1', 'ws-1', 'OWNER');

    expect(pair.accessToken).toBe('mock-access-jwt-token');
    expect(pair.refreshToken).toContain('session-1:');
    expect(pair.expiresIn).toBe(30 * 24 * 60 * 60);
    expect(mockPrisma.session.update).toHaveBeenCalled();
  });

  it('should revoke entire family when revoked session presented (replay attack)', async () => {
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      familyId: 'family-1',
      revokedAt: new Date(), // Already revoked!
      expiresAt: new Date(Date.now() + 100000),
      user: { memberships: [] },
    });

    try {
      await tokenService.rotateRefreshToken('session-1:rawtoken123');
      fail('Expected AppError to be thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.SESSION_REVOKED);
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { familyId: 'family-1' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
    }
  });
});
