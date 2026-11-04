import { MembersService } from './members.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

describe('MembersService', () => {
  let service: MembersService;
  let mockPrisma: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockPrisma = {
      workspace: {
        findUnique: jest.fn().mockResolvedValue({ id: 'ws-1', name: 'Acme Workspace' }),
      },
      membership: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      workspaceInvitation: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-admin', name: 'Admin User', email: 'admin@acme.com' }),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    mockEmailService = {
      sendInvitationEmail: jest.fn().mockResolvedValue({ delivered: true }),
    };

    service = new MembersService(
      mockPrisma as unknown as PrismaService,
      mockEmailService as unknown as EmailService,
    );
  });

  it('should throw 409 CONFLICT if user already a member of workspace', async () => {
    mockPrisma.membership.findFirst.mockResolvedValue({ id: 'mem-1' });

    try {
      await service.inviteMember('ws-1', 'user-admin', {
        email: 'alice@samyukt.com',
        role: 'TESTER',
        maxUses: 1,
        expiresInDays: 7,
      });
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.CONFLICT);
      expect((err as AppError).httpStatus).toBe(409);
    }
  });

  it('should successfully create an email invitation and send email', async () => {
    mockPrisma.membership.findFirst.mockResolvedValue(null);
    mockPrisma.workspaceInvitation.findFirst.mockResolvedValue(null);
    mockPrisma.workspaceInvitation.create.mockResolvedValue({
      id: 'inv-1',
      workspaceId: 'ws-1',
      email: 'bob@example.com',
      role: 'TESTER',
      status: 'PENDING',
      maxUses: 1,
      usesCount: 0,
      expiresAt: new Date(Date.now() + 86400000 * 7),
    });

    const result = await service.inviteMember('ws-1', 'user-admin', {
      email: 'bob@example.com',
      role: 'TESTER',
      maxUses: 1,
      expiresInDays: 7,
    });

    expect(result.id).toBe('inv-1');
    expect(result.emailSent).toBe(true);
    expect(result.inviteUrl).toContain('/invite/');
    expect(mockEmailService.sendInvitationEmail).toHaveBeenCalled();
  });

  it('should create a shareable link invitation without email or SMTP requirement', async () => {
    mockPrisma.workspaceInvitation.create.mockResolvedValue({
      id: 'inv-link-1',
      workspaceId: 'ws-1',
      email: null,
      role: 'TESTER',
      status: 'PENDING',
      maxUses: 10,
      usesCount: 0,
      expiresAt: new Date(Date.now() + 86400000 * 14),
    });

    const result = await service.inviteMember('ws-1', 'user-admin', {
      role: 'TESTER',
      maxUses: 10,
      expiresInDays: 14,
    });

    expect(result.id).toBe('inv-link-1');
    expect(result.email).toBeNull();
    expect(result.emailSent).toBe(false);
    expect(result.inviteUrl).toBeDefined();
    expect(mockEmailService.sendInvitationEmail).not.toHaveBeenCalled();
  });

  it('should prevent deleting the workspace owner', async () => {
    mockPrisma.membership.findFirst.mockResolvedValue({
      id: 'mem-owner',
      workspaceId: 'ws-1',
      role: 'OWNER',
    });

    try {
      await service.removeMember('ws-1', 'mem-owner');
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.FORBIDDEN);
      expect((err as AppError).httpStatus).toBe(403);
    }
  });

  it('should validate an active invitation token', async () => {
    mockPrisma.workspaceInvitation.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 86400000),
      usesCount: 0,
      maxUses: 1,
      role: 'TESTER',
      email: 'bob@example.com',
      workspace: { id: 'ws-1', name: 'Acme Corp', slug: 'acme' },
      invitedBy: { name: 'Admin Alice' },
    });

    const res = await service.validateToken('a'.repeat(30));
    expect(res.valid).toBe(true);
    expect((res as any).workspace.name).toBe('Acme Corp');
    expect((res as any).role).toBe('TESTER');
  });

  it('should return valid: false for expired invitations', async () => {
    mockPrisma.workspaceInvitation.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'PENDING',
      expiresAt: new Date(Date.now() - 1000),
      usesCount: 0,
      maxUses: 1,
      workspace: { name: 'Acme Corp' },
    });

    const res = await service.validateToken('a'.repeat(30));
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('EXPIRED');
  });

  it('should accept an invitation atomically inside transaction', async () => {
    const expiresAt = new Date(Date.now() + 86400000);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-bob', email: 'bob@example.com' });
    mockPrisma.workspaceInvitation.findUnique.mockResolvedValue({
      id: 'inv-1',
      workspaceId: 'ws-1',
      status: 'PENDING',
      role: 'TESTER',
      email: 'bob@example.com',
      expiresAt,
      usesCount: 0,
      maxUses: 1,
      workspace: { id: 'ws-1', name: 'Acme Corp', slug: 'acme' },
    });
    mockPrisma.membership.findFirst.mockResolvedValue(null);
    mockPrisma.membership.create.mockResolvedValue({ id: 'mem-bob', role: 'TESTER' });

    const result = await service.acceptInvite('user-bob', 'a'.repeat(30));
    expect(result.success).toBe(true);
    expect(result.role).toBe('TESTER');
    expect(mockPrisma.membership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: 'ws-1',
          userId: 'user-bob',
          role: 'TESTER',
        }),
      }),
    );
  });
});
