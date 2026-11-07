import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
export declare class WorkspacesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateWorkspaceDto): Promise<{
        role: string;
        _count: {
            memberships: number;
            projects: number;
        };
        memberships: {
            id: string;
            createdAt: Date;
            workspaceId: string;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
        }[];
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            workspaceId: string;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        ownerId: string;
    }>;
    findAll(userId: string): Promise<{
        role: string;
        _count: {
            memberships: number;
            projects: number;
        };
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            workspaceId: string;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        ownerId: string;
    }[]>;
    findOne(workspaceId: string): Promise<{
        memberships: ({
            user: {
                id: string;
                name: string;
                email: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            workspaceId: string;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
        })[];
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            workspaceId: string;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        ownerId: string;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        ownerId: string;
    }>;
    delete(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
