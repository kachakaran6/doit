import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useCreateStore } from '@/lib/create-store';
import { api, resolveAttachmentUrl } from '@/lib/api';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { ShadcnSelect } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProjectContextPanel } from '@/components/tasks/ProjectContextPanel';
import { SolutionPromptPanel } from '@/components/tasks/SolutionPromptPanel';
import { FloatingCreateButton } from '@/components/layout/FloatingCreateButton';
import {
  LayoutList,
  Columns3,
  Table as TableIcon,
  Search,
  CheckCircle2,
  Circle,
  X,
  Paperclip,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  Mic,
  Maximize2,
  ExternalLink,
  Plus,
  Rows3,
  ListFilter,
  GripVertical,
} from 'lucide-react';

function TaskScreenshotCard({
  attachment,
  onExpand,
}: {
  attachment: any;
  onExpand: (url: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const rawUrl = attachment.url || attachment.thumbUrl;
  const resolvedUrl = rawUrl ? resolveAttachmentUrl(rawUrl) : null;

  if (!resolvedUrl) return null;

  return (
    <div
      onClick={() => !error && onExpand(resolvedUrl)}
      className={`relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/60 aspect-video flex items-center justify-center transition-all ${
        !error ? 'cursor-pointer hover:border-[var(--primary)] group' : ''
      }`}
    >
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-raised)]/80 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <ImageIcon className="w-8 h-8 opacity-40 text-[var(--muted-foreground)]" />
          <span className="text-[12px] text-[var(--muted-foreground)]">
            Unable to preview screenshot in this frame
          </span>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[var(--primary-text)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Open directly</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <img
          src={resolvedUrl}
          alt={attachment.name || 'Task Screenshot'}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {!loading && !error && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-2.5 h-2.5" />
          <span>Click to expand</span>
        </div>
      )}
    </div>
  );
}

export function TasksPage() {
  const { activeProject, projects, setActiveProject, activeWorkspace } = useWorkspaceStore();
  const openCreate = useCreateStore((s) => s.openCreate);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [view, setView] = useState<'list' | 'board' | 'table'>('list');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  // Drag and drop state for Kanban
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<string | null>(null);

  const pId = activeProject?.id || projects[0]?.id;

  // Fetch labels
  const { data: labels = [] } = useQuery({
    queryKey: ['workspace-labels', activeWorkspace?.id],
    queryFn: () => (activeWorkspace?.id ? api.workspaces.labels(activeWorkspace.id) : []),
    enabled: Boolean(activeWorkspace?.id),
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', activeWorkspace?.id],
    queryFn: () => (activeWorkspace?.id ? api.workspaces.members(activeWorkspace.id) : []),
    enabled: Boolean(activeWorkspace?.id),
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', pId],
    queryFn: () => (pId ? api.tasks.list(pId) : []),
    enabled: Boolean(pId),
  });

  // Fetch detailed task info when selected
  const { data: taskDetail } = useQuery({
    queryKey: ['task', selectedTask?.id],
    queryFn: () => (selectedTask?.id ? api.tasks.get(selectedTask.id) : null),
    enabled: Boolean(selectedTask?.id),
  });

  const activeTask = taskDetail || selectedTask;

  const imageAttachments = useMemo(() => {
    if (!activeTask?.attachments) return [];
    return activeTask.attachments.filter(
      (a: any) =>
        a.kind === 'IMAGE' ||
        a.mimeType?.startsWith('image/') ||
        a.url?.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ||
        a.thumbUrl?.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)
    );
  }, [activeTask]);

  const audioAttachments = useMemo(() => {
    if (!activeTask?.attachments) return [];
    return activeTask.attachments.filter(
      (a: any) =>
        a.kind === 'AUDIO' ||
        a.mimeType?.startsWith('audio/') ||
        a.url?.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)
    );
  }, [activeTask]);

  const otherAttachments = useMemo(() => {
    if (!activeTask?.attachments) return [];
    return activeTask.attachments.filter(
      (a: any) =>
        !imageAttachments.some((img: any) => img.id === a.id) &&
        !audioAttachments.some((aud: any) => aud.id === a.id)
    );
  }, [activeTask, imageAttachments, audioAttachments]);

  // Standard Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: string }) =>
      api.tasks.updateStatus(taskId, newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      queryClient.invalidateQueries({ queryKey: ['task', updated.id] });
      if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
      }
      success('Status updated', `Moved to ${updated.status}`);
    },
    onError: (err: any) => {
      error('Failed to update status', err.message);
    },
  });

  // Optimistic Move Mutation for smooth Kanban drag-and-drop
  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: string }) =>
      api.tasks.updateStatus(taskId, newStatus),
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', pId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', pId]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks', pId], (old) => {
          if (!old) return [];
          return old.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t));
        });
      }

      return { previousTasks };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', pId], context.previousTasks);
      }
      error('Failed to move task', err?.message || 'Reverted to original column');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      if (selectedTask) {
        queryClient.invalidateQueries({ queryKey: ['task', selectedTask.id] });
      }
    },
  });

  // Quick Task Creation Mutation
  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      api.tasks.create(pId!, {
        title: title.trim(),
        priority: 'MEDIUM',
      }),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      setQuickTitle('');
      success('Task created', newTask.title);
    },
    onError: (err: any) => {
      error('Failed to create task', err.message);
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      setSelectedTask(null);
      success('Task deleted', 'Removed from workspace.');
    },
    onError: (err: any) => {
      error('Failed to delete task', err.message);
    },
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchId = t.humanId.toLowerCase().includes(q);
        if (!matchTitle && !matchId) return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Group by status for List and Board
  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  const handleToggleDone = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateStatusMutation.mutate({ taskId: task.id, newStatus: nextStatus });
  };

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !pId) return;
    createTaskMutation.mutate(quickTitle);
  };

  return (
    <PageContainer width="workspace" className="space-y-4 select-none relative">
      {/* Cohesive Primary Workspace Toolbar */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs space-y-3">
        {/* Row 1: Context, View & Primary Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Project & Count Badge */}
          <div className="flex items-center gap-2">
            {projects.length > 1 ? (
              <ShadcnSelect
                value={pId || ''}
                placeholder={activeProject?.name || projects[0]?.name || 'Select project'}
                onChange={(newPid) => {
                  const found = projects.find((p) => p.id === newPid);
                  if (found) setActiveProject(found);
                }}
                className="h-8 text-[12px] min-w-[160px]"
                wrapperClassName="w-auto"
                options={projects.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.key})`,
                }))}
              />
            ) : (
              <span className="text-[14px] font-semibold text-[var(--foreground)]">
                {activeProject?.name || projects[0]?.name || 'Tasks'}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>

            {pId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setContextModalOpen(true)}
                className="text-[11px] h-7 px-2.5 text-[var(--foreground)] gap-1.5 hidden sm:inline-flex"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                <span>Project context</span>
              </Button>
            )}
          </div>

          {/* Right: Density, View Switcher & + New Task button */}
          <div className="flex items-center gap-2">
            {/* Density toggle (for List view) */}
            {view === 'list' && (
              <div className="flex rounded-lg bg-[var(--muted)] p-0.5 border border-[var(--border)]" title="Row density">
                <button
                  type="button"
                  onClick={() => setDensity('comfortable')}
                  className={`p-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    density === 'comfortable'
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs font-semibold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                  title="Comfortable row density"
                >
                  <Rows3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={`p-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    density === 'compact'
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs font-semibold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                  title="Compact row density"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* View Switcher: List · Board · Table */}
            <div className="flex rounded-lg bg-[var(--muted)] p-0.5 border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                  view === 'list'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setView('board')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                  view === 'board'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                type="button"
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                  view === 'table'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* In-page Primary + New Task Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => openCreate('task')}
              className="h-8 text-[12px] gap-1 px-3 shadow-2xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New task</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Search & Dropdown Filters (Single clean horizontal row) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/70">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Filter tasks by title or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-7 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <ShadcnSelect
            value={statusFilter}
            onChange={setStatusFilter}
            className="h-8 text-[12px] min-w-[130px]"
            wrapperClassName="w-auto"
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'TODO', label: 'To do' },
              { value: 'IN_PROGRESS', label: 'In progress' },
              { value: 'DONE', label: 'Done' },
            ]}
          />

          <ShadcnSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            className="h-8 text-[12px] min-w-[130px]"
            wrapperClassName="w-auto"
            options={[
              { value: 'ALL', label: 'All priorities' },
              { value: 'URGENT', label: 'Urgent' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />

          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : filteredTasks.length === 0 && !quickTitle ? (
        <EmptyState
          title="No tasks found"
          description={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No tasks match your active search or filters.'
              : 'Add your first task using the input below or the "+ New task" button.'
          }
          actionLabel="Create task"
          onAction={() => openCreate('task')}
        />
      ) : view === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-5">
          {/* Inline Quick Task Creation Input */}
          <form onSubmit={handleQuickCreate} className="relative">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs hover:border-[var(--border-strong)] focus-within:border-[var(--primary)] transition-all">
              <Plus className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
              <input
                type="text"
                placeholder="+ Add a quick task to this project… (Press Enter to save)"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
              />
              {quickTitle.trim() && (
                <Button
                  type="submit"
                  size="xs"
                  variant="primary"
                  disabled={createTaskMutation.isPending}
                  className="h-6 text-[11px] px-2.5"
                >
                  {createTaskMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              )}
            </div>
          </form>

          {[
            { title: 'In progress', list: inProgressTasks, status: 'IN_PROGRESS' },
            { title: 'To do', list: todoTasks, status: 'TODO' },
            { title: 'Done', list: doneTasks, status: 'DONE' },
          ].map((grp) => {
            if (grp.list.length === 0) return null;
            return (
              <div key={grp.status} className="space-y-1.5">
                <div className="flex items-center gap-2 px-1 text-[12px] font-semibold text-[var(--muted-foreground)]">
                  <span>{grp.title}</span>
                  <span className="tabular text-[11px] font-normal">({grp.list.length})</span>
                </div>

                <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
                  {grp.list.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`px-3.5 ${
                        density === 'compact' ? 'py-1.5' : 'py-2.5'
                      } flex items-center gap-3 hover:bg-[var(--accent)] transition-colors cursor-pointer group text-[13px]`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleDone(e, task)}
                        className="w-6 shrink-0 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--success-text)] transition-colors cursor-pointer"
                        title={task.status === 'DONE' ? 'Mark incomplete' : 'Mark done'}
                      >
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--success-text)] fill-[var(--success-text)]/10" />
                        ) : (
                          <Circle className="w-4 h-4 stroke-[1.5]" />
                        )}
                      </button>

                      {/* Human ID */}
                      <span className="w-16 font-mono text-[11px] text-[var(--muted-foreground)] shrink-0">
                        {task.humanId}
                      </span>

                      {/* Title: flex-1 without max-w-[65ch] so it expands cleanly to full width */}
                      <div className="flex-1 min-w-[200px] flex items-center gap-2 truncate">
                        <span
                          className={`truncate font-medium ${
                            task.status === 'DONE'
                              ? 'line-through text-[var(--muted-foreground)]'
                              : 'text-[var(--foreground)]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {((task.attachments && task.attachments.length > 0) || ((task as any)._count?.attachments > 0)) && (
                          <span
                            title="Has attachments / screenshots"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0"
                          >
                            <ImageIcon className="w-3 h-3 text-[var(--primary-text)]" />
                            <span>{task.attachments?.length || (task as any)._count?.attachments}</span>
                          </span>
                        )}
                      </div>

                      {/* Labels */}
                      <div className="hidden md:flex items-center gap-1 max-w-[180px] shrink-0 overflow-hidden">
                        {task.labels?.map((item) => {
                          const label = 'label' in item && item.label ? item.label : (item as any);
                          if (!label || !label.name) return null;
                          return (
                            <span
                              key={item.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                              style={{
                                backgroundColor: `${label.color || '#3b82f6'}15`,
                                borderColor: `${label.color || '#3b82f6'}30`,
                                color: label.color || '#3b82f6',
                              }}
                            >
                              {label.name}
                            </span>
                          );
                        })}
                      </div>

                      {/* Assignee */}
                      <div className="hidden lg:flex w-8 shrink-0 items-center justify-center">
                        {task.assignee ? (
                          <Avatar
                            name={task.assignee.name}
                            email={task.assignee.email}
                            size="xs"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted-foreground)] opacity-50">
                            -
                          </span>
                        )}
                      </div>

                      {/* Due date */}
                      <div className="hidden sm:flex w-24 text-[12px] text-[var(--muted-foreground)] shrink-0 truncate">
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                      </div>

                      {/* Priority */}
                      <div className="w-24 shrink-0 flex justify-end">
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {/* Status */}
                      <div className="w-28 shrink-0 flex justify-end">
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'board' ? (
        /* KANBAN BOARD VIEW (Smooth HTML5 Drag & Drop with Optimistic Updates & Rollback) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {[
            { title: 'To do', status: 'TODO', list: todoTasks },
            { title: 'In progress', status: 'IN_PROGRESS', list: inProgressTasks },
            { title: 'Done', status: 'DONE', list: doneTasks },
          ].map((col) => {
            const isTarget = dropTargetCol === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dropTargetCol !== col.status) {
                    setDropTargetCol(col.status);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dropTargetCol === col.status) {
                    setDropTargetCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropTargetCol(null);
                  const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (taskId) {
                    const task = tasks.find((t) => t.id === taskId);
                    if (task && task.status !== col.status) {
                      moveTaskMutation.mutate({ taskId, newStatus: col.status });
                    }
                  }
                  setDraggedTaskId(null);
                }}
                className={`rounded-xl bg-[var(--surface-raised)] border transition-all duration-150 p-3 space-y-3 min-h-[380px] flex flex-col ${
                  isTarget
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20'
                    : 'border-[var(--border)]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--foreground)]">
                      {col.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
                      {col.list.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreate('task')}
                    className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1">
                  {col.list.map((task) => {
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <Card
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDropTargetCol(null);
                        }}
                        onClick={() => setSelectedTask(task)}
                        className={`p-3.5 hover:border-[var(--border-strong)] transition-all cursor-grab active:cursor-grabbing shadow-2xs space-y-2 group select-none ${
                          isDragging ? 'opacity-40 scale-[0.98] border-dashed border-[var(--primary)]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-80 transition-opacity" />
                            <span className="font-mono font-semibold">{task.humanId}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {((task.attachments && task.attachments.length > 0) || ((task as any)._count?.attachments > 0)) && (
                              <span
                                title="Has attachments / screenshots"
                                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)]"
                              >
                                <ImageIcon className="w-2.5 h-2.5 text-[var(--primary-text)]" />
                                <span>{task.attachments?.length || (task as any)._count?.attachments}</span>
                              </span>
                            )}
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </div>

                        <h4 className="text-[13px] font-medium text-[var(--foreground)] leading-snug">
                          {task.title}
                        </h4>

                        {/* Labels row if present */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {task.labels.slice(0, 3).map((item) => {
                              const label = 'label' in item && item.label ? item.label : (item as any);
                              if (!label || !label.name) return null;
                              return (
                                <span
                                  key={item.id}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-medium border"
                                  style={{
                                    backgroundColor: `${label.color || '#3b82f6'}15`,
                                    borderColor: `${label.color || '#3b82f6'}30`,
                                    color: label.color || '#3b82f6',
                                  }}
                                >
                                  {label.name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Quick accessible move buttons */}
                        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                          <span className="text-[var(--muted-foreground)] text-[10px]">
                            {task.status === 'DONE' ? 'Completed' : 'Move:'}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {col.status !== 'TODO' && (
                              <button
                                type="button"
                                onClick={() => moveTaskMutation.mutate({ taskId: task.id, newStatus: 'TODO' })}
                                className="px-1.5 py-0.5 rounded bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer text-[10px]"
                              >
                                To do
                              </button>
                            )}
                            {col.status !== 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() =>
                                  moveTaskMutation.mutate({ taskId: task.id, newStatus: 'IN_PROGRESS' })
                                }
                                className="px-1.5 py-0.5 rounded bg-[var(--primary-soft)] hover:brightness-95 text-[var(--primary-text)] cursor-pointer text-[10px]"
                              >
                                In progress
                              </button>
                            )}
                            {col.status !== 'DONE' && (
                              <button
                                type="button"
                                onClick={() => moveTaskMutation.mutate({ taskId: task.id, newStatus: 'DONE' })}
                                className="px-1.5 py-0.5 rounded bg-[rgba(14,133,80,0.15)] hover:bg-[rgba(14,133,80,0.25)] text-[var(--success-text)] cursor-pointer text-[10px]"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {col.list.length === 0 && (
                    <div
                      className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-3 transition-colors ${
                        isTarget
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary-text)]'
                          : 'border-[var(--border)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      <span className="text-[12px] font-medium">
                        {isTarget ? 'Drop task here' : 'No tasks in this column'}
                      </span>
                      <span className="text-[11px] opacity-70 mt-0.5">
                        Drag cards here or click + above
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[12px] font-medium text-[var(--muted-foreground)]">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">Done</th>
                <th className="py-2.5 px-4 w-28">ID</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4 w-36">Status</th>
                <th className="py-2.5 px-4 w-32">Priority</th>
                <th className="py-2.5 px-4 w-36">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-[var(--accent)] transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => handleToggleDone(e, task)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--success-text)] cursor-pointer"
                    >
                      {task.status === 'DONE' ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--success-text)]" />
                      ) : (
                        <Circle className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--muted-foreground)]">
                    {task.humanId}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-[var(--foreground)]">
                    {task.title}
                  </td>
                  <td className="py-2.5 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-2.5 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-[var(--muted-foreground)]">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PEEK PANEL (Slide-over Details) */}
      {activeTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg bg-[var(--card)] shadow-2xl border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-[var(--muted-foreground)]">
                {activeTask.humanId}
              </span>
              <StatusBadge status={activeTask.status} />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteTaskMutation.mutate(activeTask.id)}
                className="text-[var(--danger-text)] hover:bg-[rgba(201,60,53,0.1)]"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedTask(null)}
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-[17px] font-semibold text-[var(--foreground)] leading-snug">
                {activeTask.title}
              </h2>
            </div>

            {/* Properties List */}
            <div className="space-y-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Status</span>
                <ShadcnSelect
                  value={activeTask.status}
                  onChange={(newStatus) =>
                    updateStatusMutation.mutate({
                      taskId: activeTask.id,
                      newStatus,
                    })
                  }
                  className="h-8 text-[12px] min-w-[120px]"
                  wrapperClassName="w-auto"
                  options={[
                    { value: 'TODO', label: 'To do' },
                    { value: 'IN_PROGRESS', label: 'In progress' },
                    { value: 'DONE', label: 'Done' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Priority</span>
                <PriorityBadge priority={activeTask.priority} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--muted-foreground)]">Assignee</span>
                <ShadcnSelect
                  value={activeTask.assigneeId || 'unassigned'}
                  onChange={async (newVal) => {
                    const assigneeId = newVal === 'unassigned' ? null : newVal;
                    try {
                      await api.tasks.assign(activeTask.id, assigneeId);
                      setSelectedTask((prev) => (prev ? { ...prev, assigneeId } : null));
                      success('Assignee updated', '');
                    } catch (err: any) {
                      error('Could not assign', err.message);
                    }
                  }}
                  className="h-8 text-[12px] min-w-[150px]"
                  wrapperClassName="w-auto"
                  options={[
                    { value: 'unassigned', label: 'Unassigned' },
                    ...members.map((member) => ({
                      value: member.userId,
                      label: member.user?.name || member.user?.email || 'Member',
                    })),
                  ]}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[var(--muted-foreground)]">Labels</span>
                <div className="flex flex-wrap gap-1">
                  {labels.map((label) => {
                    const on = activeTask.labels?.some((entry) => entry.label?.id === label.id || entry.id === label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        className={`text-[11px] px-2 py-0.5 rounded-md border ${on ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}
                        onClick={async () => {
                          const current = new Set(
                            (activeTask.labels || []).map((entry) => entry.label?.id || entry.id),
                          );
                          if (on) current.delete(label.id);
                          else current.add(label.id);
                          const labelIds = [...current];
                          try {
                            await api.tasks.setLabels(activeTask.id, labelIds);
                            setSelectedTask((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    labels: labels
                                      .filter((item) => labelIds.includes(item.id))
                                      .map((item) => ({ id: item.id, label: item })),
                                  }
                                : null
                            );
                          } catch (err: any) {
                            error('Could not update labels', err.message);
                          }
                        }}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Created</span>
                <span className="text-[12px] text-[var(--foreground)]">
                  {new Date(activeTask.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                Description
              </div>
              <p className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap bg-[var(--surface-raised)]/50 p-3 rounded-lg border border-[var(--border)] min-h-[48px]">
                {activeTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Captured Screenshots & Image Attachments */}
            {imageAttachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                    <span>Screenshots ({imageAttachments.length})</span>
                  </div>
                  {imageAttachments.length === 1 && imageAttachments[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        const first = imageAttachments[0];
                        if (first) {
                          setLightboxImage(resolveAttachmentUrl(first.url || first.thumbUrl));
                        }
                      }}
                      className="flex items-center gap-1 text-[var(--primary-text)] hover:underline cursor-pointer text-[11px]"
                    >
                      <span>Full screen</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {imageAttachments.map((img: any) => (
                    <TaskScreenshotCard
                      key={img.id}
                      attachment={img}
                      onExpand={(url) => setLightboxImage(url)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Audio Voice Notes */}
            {audioAttachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                  <span>Voice Note</span>
                </div>
                {audioAttachments.map((audio: any) => (
                  <div key={audio.id} className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                    <audio controls className="w-full h-8">
                      <source src={resolveAttachmentUrl(audio.url)} type={audio.mimeType} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ))}
              </div>
            )}

            {/* Other File Attachments */}
            {otherAttachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  Files & Documents ({otherAttachments.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {otherAttachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={resolveAttachmentUrl(att.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--accent)] flex items-center gap-2 text-[12px] text-[var(--foreground)] truncate transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0" />
                      <span className="truncate">{att.name || `${att.kind} attachment`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Solution Prompt Panel */}
            <SolutionPromptPanel taskId={activeTask.id} attachments={activeTask.attachments} />
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between py-2 text-white text-[13px] mb-2 font-medium">
              <span className="truncate">{activeTask?.humanId} — Screenshot</span>
              <div className="flex items-center gap-3">
                <a
                  href={lightboxImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-[12px]"
                >
                  <span>Open raw</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[80vh]">
              <img
                src={lightboxImage}
                alt="Full Screenshot"
                className="max-w-full max-h-[80vh] object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Context Dialog */}
      <Modal
        open={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
        title={`${activeProject?.name || 'Project'} Context`}
        description="Architecture conventions, tech stack, and instructions used by AI solution prompts."
        maxWidth="2xl"
      >
        {pId && (
          <ProjectContextPanel
            projectId={pId}
            projectName={activeProject?.name}
            onClose={() => setContextModalOpen(false)}
          />
        )}
      </Modal>

      {/* Floating Action Button */}
      <FloatingCreateButton type="task" label="New task" />
    </PageContainer>
  );
}
