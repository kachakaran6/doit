import { LabelsService } from './labels.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
export declare class LabelsController {
    private readonly labelsService;
    constructor(labelsService: LabelsService);
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
