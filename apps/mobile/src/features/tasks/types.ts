export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskViewModel {
  id: string;
  humanId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  orderKey: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  isPending?: boolean;
  isFailed?: boolean;
}

export type TaskViewMode = 'list' | 'board';
export type TaskFilterTab = 'my_day' | 'inbox' | 'upcoming' | 'all';
