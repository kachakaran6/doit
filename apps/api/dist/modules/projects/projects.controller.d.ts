import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            tasks: number;
            stickies: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            tasks: number;
            stickies: number;
        };
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        workspaceId: string;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
