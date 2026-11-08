import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskKeys } from './keys';
import { http } from '../../../lib/http';
import { TaskViewModel, TaskStatus } from '../types';

export function useCreateTaskMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      dueDate?: string;
      dueAt?: string;
      priority?: string;
      labelIds?: string[];
      projectId?: string;
    }) => {
      const { dueDate, dueAt, ...rest } = payload;
      let finalDueAt = dueAt;
      if (!finalDueAt && dueDate) {
        try {
          finalDueAt = new Date(dueDate).toISOString();
        } catch {
          finalDueAt = undefined;
        }
      }
      const targetProject = payload.projectId || projectId;
      return http.post<TaskViewModel>(`/projects/${targetProject}/tasks`, {
        ...rest,
        projectId: targetProject,
        dueAt: finalDueAt,
      });
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(taskKeys.list({ projectId })) || [];

      const optimisticTask: TaskViewModel = {
        id: `temp-${Date.now()}`,
        humanId: 'SMP-...',
        title: newTask.title,
        description: newTask.description,
        status: 'TODO',
        priority: (newTask.priority as any) || 'MEDIUM',
        orderKey: 'a0',
        dueDate: newTask.dueDate,
        projectId,
        isPending: true,
      };

      queryClient.setQueryData<TaskViewModel[]>(taskKeys.list({ projectId }), [
        optimisticTask,
        ...previousTasks,
      ]);

      return { previousTasks, tempId: optimisticTask.id };
    },
    onError: (_err, _newTask, context) => {
      // Mark as failed with retry affordance per §Requirements
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({ projectId }), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTaskStatusMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      return http.patch<TaskViewModel>(`/tasks/${id}/status`, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(taskKeys.list({ projectId })) || [];
      const previousDetail = queryClient.getQueryData<TaskViewModel>(taskKeys.detail(id));

      // Optimistically update list
      queryClient.setQueryData<TaskViewModel[]>(
        taskKeys.list({ projectId }),
        previousTasks.map((t) => (t.id === id ? { ...t, status } : t))
      );

      // Optimistically update detail
      if (previousDetail) {
        queryClient.setQueryData<TaskViewModel>(taskKeys.detail(id), {
          ...previousDetail,
          status,
        });
      }

      return { previousTasks, previousDetail };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({ projectId }), context.previousTasks);
      }
      if (context?.previousDetail && _vars?.id) {
        queryClient.setQueryData(taskKeys.detail(_vars.id), context.previousDetail);
      }
      const message = err?.response?.data?.message || err?.message || 'Could not update task status.';
      Alert.alert('Status Update Failed', message);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      }
    },
  });
}

export function useSetTaskLabelsMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, labelIds }: { taskId: string; labelIds: string[] }) => {
      return http.post<TaskViewModel>(`/tasks/${taskId}/labels`, { labelIds });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Could not update labels.';
      Alert.alert('Label Update Failed', message);
    },
  });
}


export function useDeleteTaskMutation(projectId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return http.delete(`/tasks/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(taskKeys.list({ projectId })) || [];
      queryClient.setQueryData<TaskViewModel[]>(
        taskKeys.list({ projectId }),
        previousTasks.filter((t) => t.id !== id)
      );
      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({ projectId }), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
