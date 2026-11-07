import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findOne(projectId: string): Promise<{
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
    update(projectId: string, dto: UpdateProjectDto): Promise<{
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
    delete(projectId: string): Promise<{
        success: boolean;
    }>;
}
