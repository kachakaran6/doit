export interface ParsedSearchQuery {
    raw: string;
    labels: string[];
    assignees: string[];
    type?: 'TASK' | 'BUG';
    status?: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
    due?: 'today' | 'overdue' | 'week';
    projectKey?: string;
    freeText: string;
    tokens: string[];
}
export declare function parseSearchQuery(query: string): ParsedSearchQuery;
