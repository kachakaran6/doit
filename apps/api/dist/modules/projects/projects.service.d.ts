import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        defaultAssignee: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
    } & {
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
    }>;
    findAll(workspaceId: string): Promise<({
        defaultAssignee: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
        _count: {
            tasks: number;
            stickies: number;
        };
    } & {
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
    })[]>;
    findOne(projectId: string): Promise<{
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        defaultAssignee: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
        _count: {
            tasks: number;
            stickies: number;
        };
    } & {
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
    }>;
    update(projectId: string, dto: UpdateProjectDto): Promise<{
        defaultAssignee: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
    } & {
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
    }>;
    getProjectMembers(projectId: string): Promise<{
        projectId: string;
        projectName: string;
        defaultAssigneeId: string | null;
        defaultAssignee: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
        members: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
    delete(projectId: string): Promise<{
        success: boolean;
    }>;
}
