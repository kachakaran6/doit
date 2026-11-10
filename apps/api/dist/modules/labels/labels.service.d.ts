import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
export declare class LabelsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(workspaceId: string, dto: CreateLabelDto): Promise<{
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        workspaceId: string;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            tasks: number;
        };
    } & {
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        workspaceId: string;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            tasks: number;
        };
    } & {
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        workspaceId: string;
    }>;
    update(id: string, dto: UpdateLabelDto): Promise<{
        name: string;
        color: import(".prisma/client").$Enums.AccentName;
        id: string;
        workspaceId: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
