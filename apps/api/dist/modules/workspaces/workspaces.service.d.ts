import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
export declare class WorkspacesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateWorkspaceDto): Promise<{
        role: string;
        memberships: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            inviteToken: string | null;
            invitedEmail: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
        }[];
        projects: {
            id: string;
            workspaceId: string;
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    findAll(userId: string): Promise<{
        role: string;
        projects: {
            id: string;
            workspaceId: string;
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
            workspaceId: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            inviteToken: string | null;
            invitedEmail: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
        })[];
        projects: {
            id: string;
            workspaceId: string;
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    delete(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
