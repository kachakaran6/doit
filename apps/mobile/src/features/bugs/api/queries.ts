import { useQuery } from '@tanstack/react-query';
import { bugKeys } from './keys';
import { http } from '../../../lib/http';
import { BugViewModel } from '../types';

export function useBugsQuery(
  projectId: string | null = 'default',
  filters?: Record<string, any>,
  options?: { workspaceId?: string | null }
) {
  const isAllProjects = !projectId || projectId === 'ALL';
  return useQuery({
    queryKey: bugKeys.list({ projectId: isAllProjects ? 'ALL' : projectId, workspaceId: options?.workspaceId, ...filters }),
    queryFn: async (): Promise<BugViewModel[]> => {
      let endpoint: string;
      if (isAllProjects) {
        endpoint = options?.workspaceId
          ? `/workspaces/${options.workspaceId}/tasks?type=BUG`
          : '/workspaces/default/tasks?type=BUG';
      } else {
        endpoint = `/projects/${projectId}/bugs`;
      }
      const res = await http.get<{ items: BugViewModel[] } | BugViewModel[]>(endpoint);
      if (Array.isArray(res)) return res;
      return res.items || [];
    },
  });
}

export function useBugDetailQuery(id: string) {
  return useQuery({
    queryKey: bugKeys.detail(id),
    queryFn: async (): Promise<BugViewModel> => {
      return http.get<BugViewModel>(`/bugs/${id}`);
    },
    enabled: Boolean(id),
  });
}
