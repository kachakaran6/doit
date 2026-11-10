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
            workspaceId: string;
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            invitedEmail: string | null;
            inviteToken: string | null;
            inviteExpiresAt: Date | null;
            acceptedAt: Date | null;
        }[];
        _count: {
            memberships: number;
            projects: number;
        };
        projects: {
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            defaultAssigneeId: string | null;
            id: string;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
        }[];
        name: string;
        id: string;
        createdAt: Date;
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
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            defaultAssigneeId: string | null;
            id: string;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
        }[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }[]>;
    findOne(workspaceId: string): Promise<{
        memberships: ({
            user: {
                name: string;
                id: string;
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
            name: string;
            key: string;
            description: string | null;
            color: import(".prisma/client").$Enums.AccentName;
            defaultAssigneeId: string | null;
            id: string;
            archivedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    delete(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
