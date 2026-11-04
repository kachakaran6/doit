import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            stickies: number;
            tasks: number;
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        _count: {
            stickies: number;
            tasks: number;
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
