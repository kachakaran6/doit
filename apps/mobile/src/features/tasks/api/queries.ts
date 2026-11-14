import { useQuery } from '@tanstack/react-query';
import { taskKeys } from './keys';
import { http } from '../../../lib/http';
import { TaskViewModel } from '../types';

export function useTasksQuery(
  projectId?: string | null,
  filters?: Record<string, any>,
  options?: { workspaceId?: string | null }
) {
  const isAllProjects = !projectId || projectId === 'ALL';
  return useQuery({
    queryKey: taskKeys.list({ projectId: isAllProjects ? 'ALL' : projectId, workspaceId: options?.workspaceId, ...filters }),
    queryFn: async (): Promise<TaskViewModel[]> => {
      let endpoint: string;
      if (isAllProjects) {
        endpoint = options?.workspaceId ? `/workspaces/${options.workspaceId}/tasks` : '/workspaces/default/tasks';
      } else {
        endpoint = `/projects/${projectId}/tasks`;
      }
      const res = await http.get<{ items: TaskViewModel[] } | TaskViewModel[]>(endpoint);
      if (Array.isArray(res)) return res;
      return res.items || [];
    },
  });
}

export function useTaskDetailQuery(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async (): Promise<TaskViewModel> => {
      return http.get<TaskViewModel>(`/tasks/${id}`);
    },
    enabled: Boolean(id),
  });
}
