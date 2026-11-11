import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        defaultAssignee: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        defaultAssigneeId: string | null;
        archivedAt: Date | null;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            stickies: number;
            tasks: number;
        };
        defaultAssignee: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        defaultAssigneeId: string | null;
        archivedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            stickies: number;
            tasks: number;
        };
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        defaultAssignee: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        defaultAssigneeId: string | null;
        archivedAt: Date | null;
    }>;
    getProjectMembers(id: string): Promise<{
        projectId: string;
        projectName: string;
        defaultAssigneeId: string | null;
        defaultAssignee: {
            email: string;
            name: string;
            id: string;
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
    update(id: string, dto: UpdateProjectDto): Promise<{
        defaultAssignee: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        defaultAssigneeId: string | null;
        archivedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
