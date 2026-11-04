import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
export declare class LabelsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(workspaceId: string, dto: CreateLabelDto): Promise<{
        id: string;
        workspaceId: string;
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            tasks: number;
        };
    } & {
        id: string;
        workspaceId: string;
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            tasks: number;
        };
    } & {
        id: string;
        workspaceId: string;
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    update(id: string, dto: UpdateLabelDto): Promise<{
        id: string;
        workspaceId: string;
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
