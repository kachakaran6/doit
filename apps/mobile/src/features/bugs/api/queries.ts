import { useQuery } from '@tanstack/react-query';
import { bugKeys } from './keys';
import { http } from '../../../lib/http';
import { BugViewModel } from '../types';

export function useBugsQuery(projectId: string = 'default', filters?: Record<string, any>) {
  return useQuery({
    queryKey: bugKeys.list({ projectId, ...filters }),
    queryFn: async (): Promise<BugViewModel[]> => {
      const res = await http.get<{ items: BugViewModel[] } | BugViewModel[]>(
        `/projects/${projectId}/bugs`
      );
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
