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
    findAll(user: AuthUserPayload): Promise<{
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
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
