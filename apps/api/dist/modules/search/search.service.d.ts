import { PrismaService } from '../../infra/prisma/prisma.service';
import { SearchQueryDto, SearchResultItem } from './search.dto';
import { ParsedSearchQuery } from './search-parser';
export declare function highlightSnippet(text: string, terms: string[], maxLen?: number): string;
export declare class SearchService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    search(userId: string, dto: SearchQueryDto, workspaceId?: string): Promise<{
        results: SearchResultItem[];
        meta: {
            total: number;
            parsedQuery: ParsedSearchQuery;
        };
    }>;
}
