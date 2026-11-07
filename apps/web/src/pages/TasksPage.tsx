import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api, resolveAttachmentUrl } from '@/lib/api';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProjectContextPanel } from '@/components/tasks/ProjectContextPanel';
import { SolutionPromptPanel } from '@/components/tasks/SolutionPromptPanel';
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
} from 'lucide-react';

export function TasksPage() {
  const { activeProject, projects, setActiveProject, labels, activeWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [view, setView] = useState<'list' | 'board' | 'table'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);

  const pId = activeProject?.id || projects[0]?.id;

  // 1. Fetch real tasks from backend
  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', activeWorkspace?.id],
    queryFn: () => (activeWorkspace?.id ? api.workspaces.members(activeWorkspace.id) : []),
    enabled: Boolean(activeWorkspace?.id),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', pId],
    queryFn: () => (pId ? api.tasks.list(pId) : []),
    enabled: Boolean(pId),
  });

  // 2. Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: string }) =>
      api.tasks.updateStatus(taskId, newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
      }
      success('Status updated', `Moved to ${updated.status}`);
    },
    onError: (err: any) => {
      error('Failed to update status', err.message);
    },
  });

  // 3. Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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

  return (
    <PageContainer width="data" className="space-y-6 select-none relative">
      {/* Top Controls & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {projects.length > 1 ? (
            <select
              value={pId}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="h-8 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[12px] font-medium text-[var(--foreground)] cursor-pointer focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          ) : null}

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Actions & View Switcher */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {pId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setContextModalOpen(true)}
              className="text-[12px] h-8 text-[var(--foreground)] gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--primary-text)]" />
              <span>Project context</span>
            </Button>
          )}

          {/* View Switcher: List · Board · Table */}
          <div className="flex rounded-lg bg-[var(--muted)] p-0.5 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                view === 'list'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setView('board')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                view === 'board'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                view === 'table'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Filter tasks by title or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-[var(--input)] bg-[var(--card)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-lg border border-[var(--input)] bg-[var(--card)] px-2.5 text-[12px] font-medium text-[var(--foreground)] focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-8 rounded-lg border border-[var(--input)] bg-[var(--card)] px-2.5 text-[12px] font-medium text-[var(--foreground)] focus:outline-none"
        >
          <option value="ALL">All priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No tasks match your active search or filters.'
              : 'Create your first task using the "+ New task" button above.'
          }
        />
      ) : view === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-6">
          {[
            { title: 'In progress', list: inProgressTasks, status: 'IN_PROGRESS' },
            { title: 'To do', list: todoTasks, status: 'TODO' },
            { title: 'Done', list: doneTasks, status: 'DONE' },
          ].map((grp) => {
            if (grp.list.length === 0) return null;
            return (
              <div key={grp.status} className="space-y-2">
                <div className="flex items-center gap-2 px-1 text-[12px] font-semibold text-[var(--muted-foreground)]">
                  <span>{grp.title}</span>
                  <span className="tabular text-[11px] font-normal">({grp.list.length})</span>
                </div>

                <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
                  {grp.list.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-[var(--accent)] transition-colors cursor-pointer group text-[13px]"
                    >
                      {/* [checkbox 32] */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleDone(e, task)}
                        className="w-8 shrink-0 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--success-text)] transition-colors cursor-pointer"
                      >
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--success-text)] fill-[var(--success-text)]/10" />
                        ) : (
                          <Circle className="w-4 h-4 stroke-[1.5]" />
                        )}
                      </button>

                      {/* [id 72] */}
                      <span className="w-16 font-mono text-[11px] text-[var(--muted-foreground)] shrink-0">
                        {task.humanId}
                      </span>

                      {/* [title minmax(240px, 1fr)] */}
                      <span
                        className={`flex-1 min-w-[200px] max-w-[65ch] truncate font-medium ${
                          task.status === 'DONE'
                            ? 'line-through text-[var(--muted-foreground)]'
                            : 'text-[var(--foreground)]'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* [labels max 180] */}
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

                      {/* [assignee 32] */}
                      <div className="hidden lg:flex w-8 shrink-0 items-center justify-center">
                        {task.assignee ? (
                          <Avatar
                            name={task.assignee.name}
                            email={task.assignee.email}
                            size="xs"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted-foreground)] opacity-60">
                            -
                          </span>
                        )}
                      </div>

                      {/* [due 96] */}
                      <div className="hidden sm:flex w-24 text-[12px] text-[var(--muted-foreground)] shrink-0 truncate">
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                      </div>

                      {/* [priority 108] */}
                      <div className="w-24 shrink-0 flex justify-end">
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {/* [status 132] */}
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
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {[
            { title: 'To do', status: 'TODO', list: todoTasks },
            { title: 'In progress', status: 'IN_PROGRESS', list: inProgressTasks },
            { title: 'Done', status: 'DONE', list: doneTasks },
          ].map((col) => (
            <div
              key={col.status}
              className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] p-3 space-y-3 min-h-[300px]"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--foreground)]">
                    {col.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
                    {col.list.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {col.list.map((task) => (
                  <Card
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-3.5 hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <span className="font-mono font-semibold">{task.humanId}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <h4 className="text-[13px] font-medium text-[var(--foreground)] leading-snug">
                      {task.title}
                    </h4>

                    {/* Quick move buttons */}
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted-foreground)]">
                        {task.status === 'DONE' ? 'Done' : 'Move to:'}
                      </span>
                      <div className="flex gap-1">
                        {col.status !== 'TODO' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusMutation.mutate({ taskId: task.id, newStatus: 'TODO' });
                            }}
                            className="px-1.5 py-0.5 rounded bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer text-[10px]"
                          >
                            To do
                          </button>
                        )}
                        {col.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusMutation.mutate({
                                taskId: task.id,
                                newStatus: 'IN_PROGRESS',
                              });
                            }}
                            className="px-1.5 py-0.5 rounded bg-[var(--primary-soft)] hover:brightness-95 text-[var(--primary-text)] cursor-pointer text-[10px]"
                          >
                            In progress
                          </button>
                        )}
                        {col.status !== 'DONE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusMutation.mutate({ taskId: task.id, newStatus: 'DONE' });
                            }}
                            className="px-1.5 py-0.5 rounded bg-[rgba(14,133,80,0.15)] hover:bg-[rgba(14,133,80,0.25)] text-[var(--success-text)] cursor-pointer text-[10px]"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[12px] font-medium text-[var(--muted-foreground)]">
              <tr>
                <th className="py-2.5 px-4 w-12"></th>
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
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--card)] shadow-2xl border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-[var(--muted-foreground)]">
                {selectedTask.humanId}
              </span>
              <StatusBadge status={selectedTask.status} />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteTaskMutation.mutate(selectedTask.id)}
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
                {selectedTask.title}
              </h2>
            </div>

            {/* Properties List */}
            <div className="space-y-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Status</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      taskId: selectedTask.id,
                      newStatus: e.target.value,
                    })
                  }
                  className="rounded-md bg-[var(--card)] px-2 py-1 text-[12px] border border-[var(--border)] font-medium text-[var(--foreground)]"
                >
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Priority</span>
                <PriorityBadge priority={selectedTask.priority} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--muted-foreground)]">Assignee</span>
                <select
                  value={selectedTask.assigneeId || ''}
                  onChange={async (e) => {
                    const assigneeId = e.target.value || null;
                    try {
                      await api.tasks.assign(selectedTask.id, assigneeId);
                      setSelectedTask({ ...selectedTask, assigneeId });
                      success('Assignee updated', '');
                    } catch (err: any) {
                      error('Could not assign', err.message);
                    }
                  }}
                  className="rounded-md bg-[var(--card)] px-2 py-1 text-[12px] border border-[var(--border)]"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>{member.user?.name || member.user?.email}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[var(--muted-foreground)]">Labels</span>
                <div className="flex flex-wrap gap-1">
                  {labels.map((label) => {
                    const on = selectedTask.labels?.some((entry) => entry.label?.id === label.id || entry.id === label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        className={`text-[11px] px-2 py-0.5 rounded-md border ${on ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}
                        onClick={async () => {
                          const current = new Set(
                            (selectedTask.labels || []).map((entry) => entry.label?.id || entry.id),
                          );
                          if (on) current.delete(label.id);
                          else current.add(label.id);
                          const labelIds = [...current];
                          try {
                            await api.tasks.setLabels(selectedTask.id, labelIds);
                            setSelectedTask({
                              ...selectedTask,
                              labels: labels.filter((item) => labelIds.includes(item.id)).map((item) => ({ id: item.id, label: item })),
                            });
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
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <SolutionPromptPanel taskId={selectedTask.id} attachments={selectedTask.attachments} />

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                Description
              </div>
              <p className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Attachments if any */}
            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  Attachments ({selectedTask.attachments.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTask.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={resolveAttachmentUrl(att.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--accent)] flex items-center gap-2 text-[12px] text-[var(--foreground)] truncate transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0" />
                      <span className="truncate">{att.kind} attachment</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
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
    </PageContainer>
  );
}
