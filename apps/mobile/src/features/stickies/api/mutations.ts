import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stickyKeys } from './keys';
import { http } from '../../../lib/http';
import { StickyViewModel } from '../types';

export function useCreateStickyMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { body: string; color?: string; pinned?: boolean; isPinned?: boolean }) => {
      return http.post<StickyViewModel>(`/projects/${projectId}/stickies`, payload);
    },
    onMutate: async (newSticky) => {
      await queryClient.cancelQueries({ queryKey: stickyKeys.lists() });
      const previous = queryClient.getQueryData<StickyViewModel[]>(stickyKeys.list(projectId)) || [];

      const optimisticSticky: StickyViewModel = {
        id: `temp-${Date.now()}`,
        body: newSticky.body,
        color: newSticky.color,
        orderKey: 'a0',
        isPinned: Boolean(newSticky.isPinned),
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<StickyViewModel[]>(stickyKeys.list(projectId), [
        optimisticSticky,
        ...previous,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(stickyKeys.list(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.lists() });
    },
  });
}

export function useTogglePinStickyMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      return http.patch<StickyViewModel>(`/stickies/${id}`, { isPinned });
    },
    onMutate: async ({ id, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: stickyKeys.lists() });
      const previous = queryClient.getQueryData<StickyViewModel[]>(stickyKeys.list(projectId)) || [];

      queryClient.setQueryData<StickyViewModel[]>(
        stickyKeys.list(projectId),
        previous.map((s) => (s.id === id ? { ...s, isPinned } : s))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(stickyKeys.list(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.lists() });
    },
  });
}

export function useConvertStickyMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return http.post<{ sticky: StickyViewModel; task: any }>(`/stickies/${id}/convert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.lists() });
    },
  });
}
