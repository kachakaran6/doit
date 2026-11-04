import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
export declare class WorkspacesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateWorkspaceDto): Promise<{
        role: string;
        memberships: {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
            userId: string;
            workspaceId: string;
        }[];
        projects: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            workspaceId: string;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(userId: string): Promise<{
        role: string;
        projects: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            workspaceId: string;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
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
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
            userId: string;
            workspaceId: string;
        })[];
        projects: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            archivedAt: Date | null;
            workspaceId: string;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
