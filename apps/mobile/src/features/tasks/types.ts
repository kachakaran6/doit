export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAttachment {
  id: string;
  taskId?: string;
  bugId?: string;
  kind: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  thumbKey?: string | null;
  url?: string | null;
  thumbUrl?: string | null;
  createdAt: string;
}

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
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: TaskAttachment[];
  createdAt?: string;
  updatedAt?: string;
  isPending?: boolean;
  isFailed?: boolean;
}

export type TaskViewMode = 'list' | 'board';
export type TaskFilterTab = 'my_day' | 'inbox' | 'upcoming' | 'all';
