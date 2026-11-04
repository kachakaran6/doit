import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            locale: string;
            prefs: Prisma.JsonValue;
            createdAt: Date;
        };
        memberships: {
            id: string;
            workspaceId: string;
            workspaceName: string;
            workspaceSlug: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
    updatePrefs(userId: string, prefs: Prisma.InputJsonValue): Promise<{
        id: string;
        prefs: Prisma.JsonValue;
    }>;
}
