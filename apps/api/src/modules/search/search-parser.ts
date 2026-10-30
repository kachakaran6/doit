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

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const result: ParsedSearchQuery = {
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
  const freeTextParts: string[] = [];

  for (const token of rawTokens) {
    // 1. #label
    if (token.startsWith('#') && token.length > 1) {
      const label = token.substring(1).trim();
      if (label) {
        result.labels.push(label);
        continue;
      }
    }

    // 2. @assignee
    if (token.startsWith('@') && token.length > 1) {
      const assignee = token.substring(1).trim();
      if (assignee) {
        result.assignees.push(assignee);
        continue;
      }
    }

    // 3. is:<value>
    if (token.toLowerCase().startsWith('is:')) {
      const val = token.substring(3).toLowerCase();
      if (val === 'bug') {
        result.type = 'BUG';
        continue;
      } else if (val === 'task') {
        result.type = 'TASK';
        continue;
      } else if (val === 'done') {
        result.status = 'DONE';
        continue;
      } else if (val === 'todo') {
        result.status = 'TODO';
        continue;
      } else if (val === 'blocked') {
        result.status = 'BLOCKED';
        continue;
      } else if (val === 'in_progress' || val === 'in-progress') {
        result.status = 'IN_PROGRESS';
        continue;
      }
    }

    // 4. due:<value>
    if (token.toLowerCase().startsWith('due:')) {
      const val = token.substring(4).toLowerCase();
      if (val === 'today' || val === 'overdue' || val === 'week') {
        result.due = val;
        continue;
      }
    }

    // 5. project:<key>
    if (token.toLowerCase().startsWith('project:')) {
      const val = token.substring(8).trim().toUpperCase();
      if (val) {
        result.projectKey = val;
        continue;
      }
    }

    // Unrecognized or malformed token treated as free text
    freeTextParts.push(token);
  }

  result.freeText = freeTextParts.join(' ');
  result.tokens = freeTextParts;
  return result;
}
