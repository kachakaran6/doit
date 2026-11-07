export interface TaskListItemMapped {
  id: string;
  humanId: string;
  projectId: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: Date | null;
  dueHasTime: boolean;
  order: string;
  source: string;
  assignee: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  labels: {
    id: string;
    name: string;
    color: string;
  }[];
  checklistProgress: {
    done: number;
    total: number;
  };
  attachmentCount: number;
  commentCount: number;
  attachments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RawTaskModel {
  id: string;
  projectId: string;
  number: number;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: Date | null;
  dueHasTime: boolean;
  order: unknown;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  project?: { key: string };
  assignee?: { id: string; name: string; avatarUrl: string | null } | null;
  checklist?: { id: string; done: boolean }[];
  labels?: { label: { id: string; name: string; color: string } }[];
  _count?: { attachments: number; comments: number };
  attachments?: unknown[];
  comments?: unknown[];
}

export function mapTaskListItem(task: RawTaskModel, projectKey?: string): TaskListItemMapped {
  const pKey = projectKey || task.project?.key || 'TASK';
  const humanId = `${pKey}-${task.number}`;

  const checklist = task.checklist || [];
  const doneCount = checklist.filter((c) => c.done).length;

  return {
    id: task.id,
    humanId,
    projectId: task.projectId,
    type: task.type,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt,
    dueHasTime: task.dueHasTime,
    order: String(task.order),
    source: task.source,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          avatarUrl: task.assignee.avatarUrl,
        }
      : null,
    labels: (task.labels || []).map((tl) => ({
      id: tl.label.id,
      name: tl.label.name,
      color: tl.label.color,
    })),
    checklistProgress: {
      done: doneCount,
      total: checklist.length,
    },
    attachmentCount: task._count?.attachments ?? task.attachments?.length ?? 0,
    commentCount: task._count?.comments ?? task.comments?.length ?? 0,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
