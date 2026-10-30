import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TaskType, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SearchQueryDto, SearchResultItem } from './search.dto';
import { parseSearchQuery, ParsedSearchQuery } from './search-parser';

export function highlightSnippet(text: string, terms: string[], maxLen = 140): string {
  if (!text) return '';
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
  if (start > 0) snippet = '...' + snippet;
  if (start + maxLen < text.length) snippet = snippet + '...';

  for (const term of cleanTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
  }

  return snippet;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, dto: SearchQueryDto, workspaceId?: string) {
    const parsed = parseSearchQuery(dto.q || '');
    const activeWorkspaceId = dto.workspaceId || workspaceId;
    const requestedTypes = dto.types
      ? dto.types.split(',').map((t) => t.trim().toLowerCase())
      : ['task', 'bug', 'sticky', 'comment'];

    const searchTerms = parsed.tokens.filter(Boolean);
    const searchRegex = searchTerms.length > 0 ? searchTerms.join('|') : null;

    const results: SearchResultItem[] = [];

    // 1. Search Tasks (and Bugs)
    if (requestedTypes.includes('task') || requestedTypes.includes('bug')) {
      const taskWhere: Prisma.TaskWhereInput = {
        deletedAt: null,
      };

      const projectFilter: Prisma.ProjectWhereInput = {};
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
        taskWhere.type = parsed.type as TaskType;
      } else if (!requestedTypes.includes('task') && requestedTypes.includes('bug')) {
        taskWhere.type = TaskType.BUG;
      } else if (requestedTypes.includes('task') && !requestedTypes.includes('bug')) {
        taskWhere.type = TaskType.TASK;
      }

      if (parsed.status) {
        taskWhere.status = parsed.status as TaskStatus;
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
        } else {
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
        } else if (parsed.due === 'overdue') {
          taskWhere.dueAt = { lt: startOfDay };
          taskWhere.status = { not: TaskStatus.DONE };
        } else if (parsed.due === 'week') {
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
        const isBug = t.type === TaskType.BUG;
        const resultType = isBug ? 'bug' : 'task';
        const freeTextLower = parsed.freeText.toLowerCase();
        const titleLower = t.title.toLowerCase();

        // Scoring rules:
        // Exact title match: 1000
        // Title prefix: 800
        // Title contains: 500
        // Bug actual/expected: 300
        // Description: 200
        let score = 100;

        if (parsed.freeText) {
          if (titleLower === freeTextLower) {
            score = 1000;
          } else if (titleLower.startsWith(freeTextLower)) {
            score = 800;
          } else if (titleLower.includes(freeTextLower)) {
            score = 500;
          } else if (
            t.bug &&
            (t.bug.actual?.toLowerCase().includes(freeTextLower) ||
              t.bug.expected?.toLowerCase().includes(freeTextLower))
          ) {
            score = 300;
          } else if (t.description?.toLowerCase().includes(freeTextLower)) {
            score = 200;
          }
        }

        const rawSnippetText =
          t.description ||
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

    // 2. Search Stickies
    if (requestedTypes.includes('sticky') && !parsed.type && !parsed.status) {
      const stickyWhere: Prisma.StickyWhereInput = {
        deletedAt: null,
      };

      const stickyProjectFilter: Prisma.ProjectWhereInput = {};
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

    // 3. Search Comments
    if (requestedTypes.includes('comment') && !parsed.type && !parsed.status) {
      const commentWhere: Prisma.CommentWhereInput = {
        deletedAt: null,
      };

      const commentProjectFilter: Prisma.ProjectWhereInput = {};
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

    // Sort by score DESC, then updatedAt DESC
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
}
