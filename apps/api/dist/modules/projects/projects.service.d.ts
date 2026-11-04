import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(workspaceId: string, dto: CreateProjectDto): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
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
        id: string;
        workspaceId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    })[]>;
    findOne(projectId: string): Promise<{
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
        _count: {
            stickies: number;
            tasks: number;
        };
    } & {
        id: string;
        workspaceId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    update(projectId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        key: string;
        color: import(".prisma/client").$Enums.AccentName;
        archivedAt: Date | null;
    }>;
    delete(projectId: string): Promise<{
        success: boolean;
    }>;
}
