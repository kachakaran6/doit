import { SearchService } from './search.service';
import { SearchQueryDto } from './search.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(user: AuthUserPayload, query: SearchQueryDto): Promise<{
        results: import("./search.dto").SearchResultItem[];
        meta: {
            total: number;
            parsedQuery: import("./search-parser").ParsedSearchQuery;
        };
    }>;
}
