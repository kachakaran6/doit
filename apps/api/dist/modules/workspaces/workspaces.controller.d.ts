import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    create(user: AuthUserPayload, dto: CreateWorkspaceDto): Promise<{
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
    findAll(user: AuthUserPayload): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
