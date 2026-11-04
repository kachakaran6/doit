import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findOne(projectId: string): Promise<{
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
    update(projectId: string, dto: UpdateProjectDto): Promise<{
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
    delete(projectId: string): Promise<{
        success: boolean;
    }>;
}
