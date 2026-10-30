import { useMutation, useQueryClient } from '@tanstack/react-query';
import { xKeys } from './keys';
import { http } from '../../../lib/http';
import { XItemViewModel } from '../types';

export function useCreateXMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {
      return http.post<XItemViewModel>('/x', payload);
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: xKeys.lists() });
      const previousList = queryClient.getQueryData<XItemViewModel[]>(xKeys.list()) || [];

      const optimisticItem: XItemViewModel = {
        id: `temp-${Date.now()}`,
        title: newItem.title,
        description: newItem.description,
        status: 'PENDING',
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<XItemViewModel[]>(xKeys.list(), [optimisticItem, ...previousList]);

      return { previousList };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(xKeys.list(), context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: xKeys.lists() });
    },
  });
}
