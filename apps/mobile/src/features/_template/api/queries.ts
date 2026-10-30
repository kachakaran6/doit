import { useQuery } from '@tanstack/react-query';
import { xKeys } from './keys';
import { http } from '../../../lib/http';
import { XItemViewModel } from '../types';

export function useXListQuery(filters?: Record<string, any>) {
  return useQuery({
    queryKey: xKeys.list(filters),
    queryFn: async (): Promise<XItemViewModel[]> => {
      const res = await http.get<XItemViewModel[]>('/x', {
        headers: filters ? { 'X-Filters': JSON.stringify(filters) } : undefined,
      });
      return res;
    },
  });
}

export function useXDetailQuery(id: string) {
  return useQuery({
    queryKey: xKeys.detail(id),
    queryFn: async (): Promise<XItemViewModel> => {
      return http.get<XItemViewModel>(`/x/${id}`);
    },
    enabled: Boolean(id),
  });
}
