import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        locale: true,
        prefs: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 'User not found.', 404);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        locale: user.locale,
        prefs: user.prefs,
        createdAt: user.createdAt,
      },
      memberships: user.memberships.map((m) => ({
        id: m.id,
        workspaceId: m.workspace.id,
        workspaceName: m.workspace.name,
        workspaceSlug: m.workspace.slug,
        role: m.role,
      })),
    };
  }

  async updatePrefs(userId: string, prefs: Prisma.InputJsonValue) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { prefs },
      select: {
        id: true,
        prefs: true,
      },
    });
    return updated;
  }
}
