import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bugKeys } from './keys';
import { http } from '../../../lib/http';
import { BugViewModel, BugSeverity, BugStatus } from '../types';

export function useCreateBugMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      severity: BugSeverity;
      reproductionSteps?: string[];
      telemetry?: any;
      labelIds?: string[];
      projectId?: string;
    }) => {
      const targetProject = payload.projectId || projectId;
      return http.post<BugViewModel>(`/projects/${targetProject}/bugs`, payload);
    },
    onMutate: async (newBug) => {
      await queryClient.cancelQueries({ queryKey: bugKeys.lists() });
      const previous = queryClient.getQueryData<BugViewModel[]>(bugKeys.list({ projectId })) || [];

      const optimisticBug: BugViewModel = {
        id: `temp-${Date.now()}`,
        humanId: 'SMP-BUG-...',
        title: newBug.title,
        description: newBug.description,
        severity: newBug.severity,
        status: 'TRIAGED',
        orderKey: 'a0',
        projectId,
        reproductionSteps: newBug.reproductionSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<BugViewModel[]>(bugKeys.list({ projectId }), [
        optimisticBug,
        ...previous,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bugKeys.list({ projectId }), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bugKeys.lists() });
    },
  });
}

export function useUpdateBugStatusMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BugStatus }) => {
      return http.patch<BugViewModel>(`/bugs/${id}`, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: bugKeys.lists() });
      const previous = queryClient.getQueryData<BugViewModel[]>(bugKeys.list({ projectId })) || [];

      queryClient.setQueryData<BugViewModel[]>(
        bugKeys.list({ projectId }),
        previous.map((b) => (b.id === id ? { ...b, status } : b))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bugKeys.list({ projectId }), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bugKeys.lists() });
    },
  });
}


export function useDeleteBugMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return http.delete(`/tasks/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: bugKeys.lists() });
      const previous = queryClient.getQueryData<BugViewModel[]>(bugKeys.list({ projectId })) || [];
      queryClient.setQueryData<BugViewModel[]>(
        bugKeys.list({ projectId }),
        previous.filter((b) => b.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bugKeys.list({ projectId }), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bugKeys.lists() });
    },
  });
}
