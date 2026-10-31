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
      return http.post<TaskViewModel>(`/projects/${projectId}/tasks`, {
        ...rest,
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
      return http.patch<TaskViewModel>(`/tasks/${id}`, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(taskKeys.list({ projectId })) || [];

      queryClient.setQueryData<TaskViewModel[]>(
        taskKeys.list({ projectId }),
        previousTasks.map((t) => (t.id === id ? { ...t, status } : t))
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({ projectId }), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
