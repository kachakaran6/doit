import { useQuery } from '@tanstack/react-query';
import { stickyKeys } from './keys';
import { http } from '../../../lib/http';
import { StickyViewModel } from '../types';

export function useStickiesQuery(projectId: string = 'default') {
  return useQuery({
    queryKey: stickyKeys.list(projectId),
    queryFn: async (): Promise<StickyViewModel[]> => {
      const res = await http.get<{ items: StickyViewModel[] } | StickyViewModel[]>(
        `/projects/${projectId}/stickies`
      );
      if (Array.isArray(res)) return res;
      return res.items || [];
    },
  });
}
