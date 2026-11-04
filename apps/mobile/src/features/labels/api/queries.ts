import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../../lib/http';

export interface LabelItem {
  id: string;
  name: string;
  color: string;
  workspaceId?: string;
  createdAt?: string;
}

export function useLabelsQuery(workspaceId?: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'labels'],
    queryFn: async (): Promise<LabelItem[]> => {
      if (!workspaceId) return [];
      const res = await http.get<LabelItem[]>(`/workspaces/${workspaceId}/labels`);
      return Array.isArray(res) ? res : [];
    },
    enabled: Boolean(workspaceId),
  });
}

export function useCreateLabelMutation(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: { name: string; color: string }) => {
      if (!workspaceId) throw new Error('Workspace required');
      return http.post<LabelItem>(`/workspaces/${workspaceId}/labels`, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'labels'] });
    },
  });
}

