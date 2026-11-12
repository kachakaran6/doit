import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceMemberGuard, RequestWithWorkspace } from './workspace-member.guard';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';

describe('WorkspaceMemberGuard', () => {
  let guard: WorkspaceMemberGuard;
  let reflector: Reflector;
  let mockPrisma: {
    membership: { findUnique: jest.Mock };
    project: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    reflector = new Reflector();
    mockPrisma = {
      membership: { findUnique: jest.fn() },
      project: { findUnique: jest.fn() },
    };
    guard = new WorkspaceMemberGuard(reflector, mockPrisma as unknown as PrismaService);
  });

  it('should throw 403 NOT_WORKSPACE_MEMBER when user is not a member', async () => {
    mockPrisma.membership.findUnique.mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            user: { sub: 'user-1' },
            params: { workspaceId: 'ws-1' },
            baseUrl: '/workspaces',
          }) as unknown as RequestWithWorkspace,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(context);
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.NOT_WORKSPACE_MEMBER);
      expect((err as AppError).httpStatus).toBe(403);
    }
  });

  it('should allow access when member has required role', async () => {
    mockPrisma.membership.findUnique.mockResolvedValue({
      id: 'mem-1',
      workspaceId: 'ws-1',
      userId: 'user-1',
      role: 'ADMIN',
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['OWNER', 'ADMIN']);

    const request = {
      user: { sub: 'user-1' },
      params: { workspaceId: 'ws-1' },
      baseUrl: '/workspaces',
    } as unknown as RequestWithWorkspace;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
    expect(request.memberRole).toBe('ADMIN');
  });

  it('should throw 403 FORBIDDEN when member has insufficient role', async () => {
    mockPrisma.membership.findUnique.mockResolvedValue({
      id: 'mem-1',
      workspaceId: 'ws-1',
      userId: 'user-1',
      role: 'TESTER',
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['OWNER', 'ADMIN']);

    const context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            user: { sub: 'user-1' },
            params: { workspaceId: 'ws-1' },
            baseUrl: '/workspaces',
          }) as unknown as RequestWithWorkspace,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(context);
      fail('Expected AppError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.FORBIDDEN);
      expect((err as AppError).httpStatus).toBe(403);
    }
  });

  it('should throw 403 FORBIDDEN when x-workspace-id header does not match project workspace', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      workspaceId: 'ws-workspace-A',
      archivedAt: null,
    });

    const context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            user: { sub: 'user-1' },
            params: { projectId: 'proj-1' },
            headers: { 'x-workspace-id': 'ws-workspace-B' },
          }) as unknown as RequestWithWorkspace,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(context);
      fail('Expected AppError for cross-workspace access');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.FORBIDDEN);
      expect((err as AppError).httpStatus).toBe(403);
    }
  });

  it('should throw 404 PROJECT_NOT_FOUND when project is archived', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'proj-archived',
      workspaceId: 'ws-1',
      archivedAt: new Date(),
    });

    const context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            user: { sub: 'user-1' },
            params: { projectId: 'proj-archived' },
            headers: {},
          }) as unknown as RequestWithWorkspace,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(context);
      fail('Expected AppError for archived project');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.PROJECT_NOT_FOUND);
      expect((err as AppError).httpStatus).toBe(404);
    }
  });
});
