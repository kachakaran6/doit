"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchQuery = parseSearchQuery;
function parseSearchQuery(query) {
    const result = {
        raw: query,
        labels: [],
        assignees: [],
        freeText: '',
        tokens: [],
    };
    if (!query || typeof query !== 'string') {
        return result;
    }
    const rawTokens = query.trim().split(/\s+/).filter(Boolean);
    const freeTextParts = [];
    for (const token of rawTokens) {
        if (token.startsWith('#') && token.length > 1) {
            const label = token.substring(1).trim();
            if (label) {
                result.labels.push(label);
                continue;
            }
        }
        if (token.startsWith('@') && token.length > 1) {
            const assignee = token.substring(1).trim();
            if (assignee) {
                result.assignees.push(assignee);
                continue;
            }
        }
        if (token.toLowerCase().startsWith('is:')) {
            const val = token.substring(3).toLowerCase();
            if (val === 'bug') {
                result.type = 'BUG';
                continue;
            }
            else if (val === 'task') {
                result.type = 'TASK';
                continue;
            }
            else if (val === 'done') {
                result.status = 'DONE';
                continue;
            }
            else if (val === 'todo') {
                result.status = 'TODO';
                continue;
            }
            else if (val === 'blocked') {
                result.status = 'BLOCKED';
                continue;
            }
            else if (val === 'in_progress' || val === 'in-progress') {
                result.status = 'IN_PROGRESS';
                continue;
            }
        }
        if (token.toLowerCase().startsWith('due:')) {
            const val = token.substring(4).toLowerCase();
            if (val === 'today' || val === 'overdue' || val === 'week') {
                result.due = val;
                continue;
            }
        }
        if (token.toLowerCase().startsWith('project:')) {
            const val = token.substring(8).trim().toUpperCase();
            if (val) {
                result.projectKey = val;
                continue;
            }
        }
        freeTextParts.push(token);
    }
    result.freeText = freeTextParts.join(' ');
    result.tokens = freeTextParts;
    return result;
}
//# sourceMappingURL=search-parser.js.map