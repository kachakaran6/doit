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
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
            createdAt: Date;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        projects: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
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
            workspaceId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }[]>;
    findOne(workspaceId: string): Promise<{
        memberships: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            workspaceId: string;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
            createdAt: Date;
        })[];
        projects: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            key: string;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    delete(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
