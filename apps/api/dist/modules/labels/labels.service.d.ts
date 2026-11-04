import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
export declare class LabelsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(workspaceId: string, dto: CreateLabelDto): Promise<{
        name: string;
        id: string;
        workspaceId: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    findAll(workspaceId: string): Promise<({
        _count: {
            tasks: number;
        };
    } & {
        name: string;
        id: string;
        workspaceId: string;
        color: import(".prisma/client").$Enums.AccentName;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            tasks: number;
        };
    } & {
        name: string;
        id: string;
        workspaceId: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    update(id: string, dto: UpdateLabelDto): Promise<{
        name: string;
        id: string;
        workspaceId: string;
        color: import(".prisma/client").$Enums.AccentName;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
