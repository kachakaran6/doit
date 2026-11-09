import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        id: string;
        workspaceId: string;
        name: string;
        key: string;
        description: string | null;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            tasks: number;
            stickies: number;
        };
    } & {
        id: string;
        workspaceId: string;
        name: string;
        key: string;
        description: string | null;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
        _count: {
            tasks: number;
            stickies: number;
        };
    } & {
        id: string;
        workspaceId: string;
        name: string;
        key: string;
        description: string | null;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        id: string;
        workspaceId: string;
        name: string;
        key: string;
        description: string | null;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
