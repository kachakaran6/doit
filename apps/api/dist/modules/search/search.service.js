"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
exports.highlightSnippet = highlightSnippet;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const search_parser_1 = require("./search-parser");
function highlightSnippet(text, terms, maxLen = 140) {
    if (!text)
        return '';
    const cleanTerms = terms.filter((t) => t.trim().length > 0);
    if (cleanTerms.length === 0) {
        return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
    }
    const lowerText = text.toLowerCase();
    let firstIdx = -1;
    for (const term of cleanTerms) {
        const idx = lowerText.indexOf(term.toLowerCase());
        if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
            firstIdx = idx;
        }
    }
    let start = 0;
    if (firstIdx > 30) {
        start = firstIdx - 30;
    }
    let snippet = text.substring(start, start + maxLen);
    if (start > 0)
        snippet = '...' + snippet;
    if (start + maxLen < text.length)
        snippet = snippet + '...';
    for (const term of cleanTerms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
    }
    return snippet;
}
let SearchService = SearchService_1 = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async search(userId, dto, workspaceId) {
        const parsed = (0, search_parser_1.parseSearchQuery)(dto.q || '');
        const activeWorkspaceId = dto.workspaceId || workspaceId;
        const requestedTypes = dto.types
            ? dto.types.split(',').map((t) => t.trim().toLowerCase())
            : ['task', 'bug', 'sticky', 'comment'];
        const searchTerms = parsed.tokens.filter(Boolean);
        const searchRegex = searchTerms.length > 0 ? searchTerms.join('|') : null;
        const results = [];
        if (requestedTypes.includes('task') || requestedTypes.includes('bug')) {
            const taskWhere = {
                deletedAt: null,
            };
            const projectFilter = {};
            if (activeWorkspaceId) {
                projectFilter.workspaceId = activeWorkspaceId;
            }
            if (parsed.projectKey) {
                projectFilter.key = parsed.projectKey;
            }
            if (Object.keys(projectFilter).length > 0) {
                taskWhere.project = projectFilter;
            }
            if (parsed.type) {
                taskWhere.type = parsed.type;
            }
            else if (!requestedTypes.includes('task') && requestedTypes.includes('bug')) {
                taskWhere.type = client_1.TaskType.BUG;
            }
            else if (requestedTypes.includes('task') && !requestedTypes.includes('bug')) {
                taskWhere.type = client_1.TaskType.TASK;
            }
            if (parsed.status) {
                taskWhere.status = parsed.status;
            }
            if (parsed.labels.length > 0) {
                taskWhere.labels = {
                    some: {
                        label: {
                            name: { in: parsed.labels, mode: 'insensitive' },
                        },
                    },
                };
            }
            if (parsed.assignees.length > 0) {
                const hasMe = parsed.assignees.includes('me');
                if (hasMe) {
                    taskWhere.assigneeId = userId;
                }
                else {
                    taskWhere.assignee = {
                        name: { in: parsed.assignees, mode: 'insensitive' },
                    };
                }
            }
            if (parsed.due) {
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                if (parsed.due === 'today') {
                    taskWhere.dueAt = { gte: startOfDay, lte: endOfDay };
                }
                else if (parsed.due === 'overdue') {
                    taskWhere.dueAt = { lt: startOfDay };
                    taskWhere.status = { not: client_1.TaskStatus.DONE };
                }
                else if (parsed.due === 'week') {
                    const nextWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
                    taskWhere.dueAt = { gte: startOfDay, lte: nextWeek };
                }
            }
            if (parsed.freeText) {
                taskWhere.OR = [
                    { title: { contains: parsed.freeText, mode: 'insensitive' } },
                    { description: { contains: parsed.freeText, mode: 'insensitive' } },
                    {
                        bug: {
                            OR: [
                                { actual: { contains: parsed.freeText, mode: 'insensitive' } },
                                { expected: { contains: parsed.freeText, mode: 'insensitive' } },
                            ],
                        },
                    },
                ];
            }
            const tasks = await this.prisma.task.findMany({
                where: taskWhere,
                take: dto.limit * 2,
                include: {
                    project: { select: { key: true } },
                    bug: true,
                },
                orderBy: { updatedAt: 'desc' },
            });
            for (const t of tasks) {
                const isBug = t.type === client_1.TaskType.BUG;
                const resultType = isBug ? 'bug' : 'task';
                const freeTextLower = parsed.freeText.toLowerCase();
                const titleLower = t.title.toLowerCase();
                let score = 100;
                if (parsed.freeText) {
                    if (titleLower === freeTextLower) {
                        score = 1000;
                    }
                    else if (titleLower.startsWith(freeTextLower)) {
                        score = 800;
                    }
                    else if (titleLower.includes(freeTextLower)) {
                        score = 500;
                    }
                    else if (t.bug &&
                        (t.bug.actual?.toLowerCase().includes(freeTextLower) ||
                            t.bug.expected?.toLowerCase().includes(freeTextLower))) {
                        score = 300;
                    }
                    else if (t.description?.toLowerCase().includes(freeTextLower)) {
                        score = 200;
                    }
                }
                const rawSnippetText = t.description ||
                    (t.bug ? `Actual: ${t.bug.actual ?? ''} | Expected: ${t.bug.expected ?? ''}` : t.title);
                const snippet = highlightSnippet(rawSnippetText, searchTerms);
                results.push({
                    type: resultType,
                    id: t.id,
                    title: `${t.project.key}-${t.number}: ${t.title}`,
                    snippet,
                    score,
                    projectKey: t.project.key,
                    updatedAt: t.updatedAt.toISOString(),
                    metadata: {
                        status: t.status,
                        priority: t.priority,
                        number: t.number,
                        severity: t.bug?.severity,
                    },
                });
            }
        }
        if (requestedTypes.includes('sticky') && !parsed.type && !parsed.status) {
            const stickyWhere = {
                deletedAt: null,
            };
            const stickyProjectFilter = {};
            if (activeWorkspaceId) {
                stickyProjectFilter.workspaceId = activeWorkspaceId;
            }
            if (parsed.projectKey) {
                stickyProjectFilter.key = parsed.projectKey;
            }
            if (Object.keys(stickyProjectFilter).length > 0) {
                stickyWhere.project = stickyProjectFilter;
            }
            if (parsed.freeText) {
                stickyWhere.body = { contains: parsed.freeText, mode: 'insensitive' };
            }
            const stickies = await this.prisma.sticky.findMany({
                where: stickyWhere,
                take: dto.limit,
                include: {
                    project: { select: { key: true } },
                },
                orderBy: { updatedAt: 'desc' },
            });
            for (const s of stickies) {
                results.push({
                    type: 'sticky',
                    id: s.id,
                    title: `Sticky in ${s.project.key}`,
                    snippet: highlightSnippet(s.body, searchTerms),
                    score: 150,
                    projectKey: s.project.key,
                    updatedAt: s.updatedAt.toISOString(),
                    metadata: { color: s.color, pinned: s.pinned },
                });
            }
        }
        if (requestedTypes.includes('comment') && !parsed.type && !parsed.status) {
            const commentWhere = {
                deletedAt: null,
            };
            const commentProjectFilter = {};
            if (activeWorkspaceId) {
                commentProjectFilter.workspaceId = activeWorkspaceId;
            }
            if (parsed.projectKey) {
                commentProjectFilter.key = parsed.projectKey;
            }
            if (Object.keys(commentProjectFilter).length > 0) {
                commentWhere.task = {
                    project: commentProjectFilter,
                };
            }
            if (parsed.freeText) {
                commentWhere.body = { contains: parsed.freeText, mode: 'insensitive' };
            }
            const comments = await this.prisma.comment.findMany({
                where: commentWhere,
                take: dto.limit,
                include: {
                    task: {
                        include: { project: { select: { key: true } } },
                    },
                    author: { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
            });
            for (const c of comments) {
                results.push({
                    type: 'comment',
                    id: c.id,
                    title: `Comment on ${c.task.project.key}-${c.task.number} by ${c.author.name}`,
                    snippet: highlightSnippet(c.body, searchTerms),
                    score: 100,
                    projectKey: c.task.project.key,
                    updatedAt: c.updatedAt.toISOString(),
                });
            }
        }
        results.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        const paginated = results.slice(0, dto.limit);
        return {
            results: paginated,
            meta: {
                total: results.length,
                parsedQuery: parsed,
            },
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map