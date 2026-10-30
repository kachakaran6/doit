import { useQuery } from '@tanstack/react-query';
import { taskKeys } from './keys';
import { http } from '../../../lib/http';
import { TaskViewModel } from '../types';

export function useTasksQuery(projectId?: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: taskKeys.list({ projectId, ...filters }),
    queryFn: async (): Promise<TaskViewModel[]> => {
      const pId = projectId || 'default';
      const res = await http.get<{ items: TaskViewModel[] } | TaskViewModel[]>(`/projects/${pId}/tasks`);
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
