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
    findAll(user: AuthUserPayload): Promise<{
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
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
