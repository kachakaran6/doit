import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    create(user: AuthUserPayload, dto: CreateWorkspaceDto): Promise<{
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
    findAll(user: AuthUserPayload): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        ownerId: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
