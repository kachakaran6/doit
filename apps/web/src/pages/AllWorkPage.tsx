import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useCreateStore } from '@/lib/create-store';
import { api, resolveAttachmentUrl } from '@/lib/api';
import { Bug } from '@/lib/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { ShadcnSelect } from '@/components/ui/select';
import { StatusBadge, PriorityBadge, SeverityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { SolutionPromptPanel } from '@/components/tasks/SolutionPromptPanel';
import {
  CheckSquare,
  Bug as BugIcon,
  Search,
  CheckCircle2,
  Circle,
  X,
  Plus,
  Smartphone,
  ExternalLink,
  Maximize2,
  LayoutList,
  Table as TableIcon,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';

export type UnifiedWorkType = 'TASK' | 'BUG';

export interface UnifiedWorkItem {
  id: string;
  type: UnifiedWorkType;
  humanId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: string; // Task
  severity?: string; // Bug
  dueAt?: string | null;
  reportedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
  labels?: any[];
  projectId: string;
  projectName?: string;
  projectKey?: string;
  deviceModel?: string;
  attachmentsCount: number;
  raw: any;
}

export function AllWorkPage() {
  const { activeWorkspace, activeProject, projects } = useWorkspaceStore();
  const openCreate = useCreateStore((s) => s.openCreate);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TASK' | 'BUG'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'newest' | 'oldest' | 'priority' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject?.id || 'ALL');

  // Selected item for detail inspection
  const [selectedItem, setSelectedItem] = useState<UnifiedWorkItem | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const wsId = activeWorkspace?.id;
  const isAllProjects = selectedProjectId === 'ALL';
  const queryProjectId = isAllProjects ? undefined : selectedProjectId;

  // 1. Fetch tasks
  const { data: rawTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['all-work-tasks', wsId, queryProjectId],
    queryFn: async () => {
      if (queryProjectId) {
        return api.tasks.list(queryProjectId);
      }
      if (wsId) {
        return api.tasks.listWorkspace(wsId);
      }
      return [];
    },
    enabled: Boolean(wsId || queryProjectId),
  });

  // 2. Fetch bugs across project or all projects in workspace
  const { data: rawBugs = [], isLoading: bugsLoading } = useQuery({
    queryKey: ['all-work-bugs', wsId, queryProjectId],
    queryFn: async () => {
      if (queryProjectId) {
        return api.bugs.list(queryProjectId);
      }
      if (projects.length > 0) {
        const bugLists = await Promise.all(
          projects.map((p) => api.bugs.list(p.id).catch(() => [] as Bug[]))
        );
        return bugLists.flat();
      }
      return [];
    },
    enabled: Boolean(wsId || queryProjectId),
  });

  // 3. Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      api.tasks.updateStatus(id, newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['all-work-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-work-bugs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      if (selectedItem?.id === updated.id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: updated.status as any } : null));
      }
      success('Status updated', `Moved to ${updated.status}`);
    },
    onError: (err: any) => {
      error('Failed to update status', err.message);
    },
  });

  // 4. Adapt and normalize tasks and bugs
  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; key: string }>();
    projects.forEach((p) => map.set(p.id, { name: p.name, key: p.key }));
    return map;
  }, [projects]);

  const unifiedItems: UnifiedWorkItem[] = useMemo(() => {
    const adaptedTasks: UnifiedWorkItem[] = rawTasks.map((t) => {
      const proj = projectMap.get(t.projectId);
      return {
        id: t.id,
        type: 'TASK',
        humanId: t.humanId,
        title: t.title,
        description: t.description || undefined,
        status: (t.status as any) || 'TODO',
        priority: t.priority || 'MEDIUM',
        dueAt: t.dueAt,
        reportedAt: null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        assignee: t.assignee,
        labels: t.labels,
        projectId: t.projectId,
        projectName: proj?.name,
        projectKey: proj?.key,
        attachmentsCount: t.attachments?.length || (t as any)._count?.attachments || 0,
        raw: t,
      };
    });

    const adaptedBugs: UnifiedWorkItem[] = rawBugs.map((b) => {
      const proj = projectMap.get(b.projectId);
      return {
        id: b.id,
        type: 'BUG',
        humanId: b.humanId,
        title: b.title,
        description: b.description || undefined,
        status: (b.status as any) || 'TODO',
        severity: b.severity || 'MAJOR',
        dueAt: null,
        reportedAt: (b as any).capturedAt || b.createdAt,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        assignee: b.assignee,
        labels: b.labels,
        projectId: b.projectId,
        projectName: proj?.name,
        projectKey: proj?.key,
        deviceModel: (b as any).deviceModel,
        attachmentsCount: b.attachments?.length || (b as any)._count?.attachments || 0,
        raw: b,
      };
    });

    return [...adaptedTasks, ...adaptedBugs];
  }, [rawTasks, rawBugs, projectMap]);

  // 5. Filter & Sort
  const filteredItems = useMemo(() => {
    let result = unifiedItems.filter((item) => {
      // Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Priority filter (for tasks)
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

      // Severity filter (for bugs)
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesId = item.humanId.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesDesc) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority': {
          const priorityWeight: Record<string, number> = {
            URGENT: 4,
            BLOCKER: 4,
            CRITICAL: 4,
            HIGH: 3,
            MAJOR: 3,
            MEDIUM: 2,
            MINOR: 2,
            LOW: 1,
            COSMETIC: 1,
            TRIVIAL: 1,
          };
          const valA = priorityWeight[a.priority || a.severity || 'MEDIUM'] || 0;
          const valB = priorityWeight[b.priority || b.severity || 'MEDIUM'] || 0;
          return valB - valA;
        }
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [unifiedItems, typeFilter, statusFilter, priorityFilter, severityFilter, searchQuery, sortBy]);

  const taskCount = unifiedItems.filter((i) => i.type === 'TASK').length;
  const bugCount = unifiedItems.filter((i) => i.type === 'BUG').length;
  const isLoading = tasksLoading || bugsLoading;

  const handleToggleDone = (e: React.MouseEvent, item: UnifiedWorkItem) => {
    e.stopPropagation();
    const nextStatus = item.status === 'DONE' ? 'TODO' : 'DONE';
    updateStatusMutation.mutate({ id: item.id, newStatus: nextStatus });
  };

  const hasActiveFilters =
    searchQuery ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    severityFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSeverityFilter('ALL');
  };

  return (
    <PageContainer width="workspace" className="select-none relative flex flex-col min-h-full">
      {/* 1. Cohesive Header Toolbar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-3 shrink-0 space-y-3">
        {/* Row 1: Context, View & Primary Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">
              All Work
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Project Selector & Primary Actions */}
          <div className="flex items-center gap-2">
            {projects.length > 1 && (
              <ShadcnSelect
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                className="h-8 text-[12px] min-w-[150px]"
                wrapperClassName="w-auto"
                options={[
                  { value: 'ALL', label: 'All Projects' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.key})`,
                  })),
                ]}
              />
            )}

            <button
              type="button"
              onClick={() => openCreate('task')}
              className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-[12px] font-medium shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New task</span>
            </button>

            <button
              type="button"
              onClick={() => openCreate('bug')}
              className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--accent)] text-[12px] font-medium transition-all cursor-pointer shadow-2xs"
            >
              <BugIcon className="w-3.5 h-3.5 text-[var(--danger-text)]" />
              <span>Report bug</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[var(--border)]/70">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Segment Control */}
          <div className="flex rounded-lg bg-[var(--muted)] p-0.5 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              All ({unifiedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('TASK')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                typeFilter === 'TASK'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <CheckSquare className="w-3 h-3 text-[var(--primary-text)]" />
              <span>Tasks ({taskCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('BUG')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                typeFilter === 'BUG'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <BugIcon className="w-3 h-3 text-[var(--danger-text)]" />
              <span>Bugs ({bugCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search all work by title or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-7 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <ShadcnSelect
            value={statusFilter}
            onChange={setStatusFilter}
            className="h-8 text-[12px] w-auto min-w-[125px]"
            wrapperClassName="w-auto shrink-0"
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'TODO', label: 'To do' },
              { value: 'IN_PROGRESS', label: 'In progress' },
              { value: 'DONE', label: 'Completed' },
            ]}
          />

          {/* Priority filter if tasks selected */}
          {typeFilter !== 'BUG' && (
            <ShadcnSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              className="h-8 text-[12px] w-auto min-w-[130px]"
              wrapperClassName="w-auto shrink-0"
              options={[
                { value: 'ALL', label: 'All priorities' },
                { value: 'URGENT', label: 'Urgent' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          )}

          {/* Severity filter if bugs selected */}
          {typeFilter !== 'TASK' && (
            <ShadcnSelect
              value={severityFilter}
              onChange={setSeverityFilter}
              className="h-8 text-[12px] w-auto min-w-[130px]"
              wrapperClassName="w-auto shrink-0"
              options={[
                { value: 'ALL', label: 'All severities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'MAJOR', label: 'Major' },
                { value: 'MINOR', label: 'Minor' },
                { value: 'TRIVIAL', label: 'Trivial' },
              ]}
            />
          )}

          {/* Sort Selector */}
          <ShadcnSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            className="h-8 text-[12px] w-auto min-w-[140px]"
            wrapperClassName="w-auto shrink-0"
            options={[
              { value: 'updated', label: 'Recently updated' },
              { value: 'newest', label: 'Newest created' },
              { value: 'oldest', label: 'Oldest created' },
              { value: 'priority', label: 'Priority / Severity' },
              { value: 'title', label: 'Title (A–Z)' },
            ]}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer px-1.5 py-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* View Switcher: List · Table */}
        <div className="flex rounded-lg bg-[var(--muted)] p-0.5 border border-[var(--border)] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
              viewMode === 'table'
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

      {/* 3. Main Data Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-5">
        {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No work items found"
          description={
            hasActiveFilters
              ? 'No tasks or bugs match your active search filters. Try clearing filters.'
              : 'Your workspace has no tasks or bugs yet. Use the buttons above to create your first item.'
          }
          actionLabel={hasActiveFilters ? 'Clear filters' : 'Create a task'}
          onAction={hasActiveFilters ? clearFilters : () => openCreate('task')}
        />
      ) : viewMode === 'list' ? (
        /* Unified List View */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs divide-y divide-[var(--border)]">
          {filteredItems.map((item) => {
            const isTask = item.type === 'TASK';
            const isDone = item.status === 'DONE';

            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-[var(--accent)] transition-colors cursor-pointer group text-[13px]"
              >
                {/* Checkbox toggle */}
                <button
                  type="button"
                  onClick={(e) => handleToggleDone(e, item)}
                  className="w-7 shrink-0 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--success-text)] transition-colors cursor-pointer"
                  title={isDone ? 'Mark as to do' : 'Mark as completed'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success-text)] fill-[var(--success-text)]/10" />
                  ) : (
                    <Circle className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>

                {/* Type Icon Badge */}
                <span
                  title={isTask ? 'Task' : 'Bug Report'}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide shrink-0 ${
                    isTask
                      ? 'bg-[var(--primary-soft)] text-[var(--primary-text)] border border-[var(--primary)]/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {isTask ? (
                    <CheckSquare className="w-3 h-3" />
                  ) : (
                    <BugIcon className="w-3 h-3" />
                  )}
                  <span>{isTask ? 'TASK' : 'BUG'}</span>
                </span>

                {/* Human ID */}
                <span className="w-16 font-mono text-[11px] font-medium text-[var(--muted-foreground)] shrink-0">
                  {item.humanId}
                </span>

                {/* Title and metadata */}
                <div className="flex-1 min-w-[200px] flex items-center gap-2 truncate">
                  <span
                    className={`truncate font-medium ${
                      isDone ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {item.title}
                  </span>

                  {item.attachmentsCount > 0 && (
                    <span
                      title={`${item.attachmentsCount} attachment(s)`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0"
                    >
                      <ImageIcon className="w-2.5 h-2.5 text-[var(--primary-text)]" />
                      <span>{item.attachmentsCount}</span>
                    </span>
                  )}

                  {item.deviceModel && (
                    <span
                      title={`Reported from ${item.deviceModel}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0"
                    >
                      <Smartphone className="w-2.5 h-2.5" />
                      <span>{item.deviceModel}</span>
                    </span>
                  )}
                </div>

                {/* Project Tag */}
                {item.projectName && (
                  <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-[var(--muted)] text-[11px] text-[var(--muted-foreground)] shrink-0 max-w-[120px] truncate">
                    {item.projectName}
                  </span>
                )}

                {/* Assignee Avatar */}
                <div className="hidden lg:flex w-8 shrink-0 items-center justify-center">
                  {item.assignee ? (
                    <Avatar
                      name={item.assignee.name}
                      email={item.assignee.email}
                      size="xs"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted-foreground)] opacity-60">
                      -
                    </span>
                  )}
                </div>

                {/* Due Date or Reported Date */}
                <div className="hidden sm:flex w-24 text-[12px] text-[var(--muted-foreground)] shrink-0 items-center gap-1 truncate">
                  {item.dueAt ? (
                    <>
                      <Calendar className="w-3 h-3 opacity-60" />
                      <span>{new Date(item.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </>
                  ) : item.reportedAt ? (
                    <span>{new Date(item.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  ) : (
                    ''
                  )}
                </div>

                {/* Priority / Severity Badge */}
                <div className="w-24 shrink-0 flex justify-end">
                  {isTask ? (
                    <PriorityBadge priority={item.priority || 'MEDIUM'} />
                  ) : (
                    <SeverityBadge severity={item.severity || 'MAJOR'} />
                  )}
                </div>

                {/* Status Badge */}
                <div className="w-28 shrink-0 flex justify-end">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Unified Table View */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[12px] font-medium text-[var(--muted-foreground)]">
              <tr>
                <th className="py-2.5 px-4 w-10"></th>
                <th className="py-2.5 px-2 w-20">Type</th>
                <th className="py-2.5 px-3 w-20">ID</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-3 w-32">Project</th>
                <th className="py-2.5 px-3 w-24">Assignee</th>
                <th className="py-2.5 px-3 w-28">Date</th>
                <th className="py-2.5 px-3 w-28 text-right">Priority / Sev</th>
                <th className="py-2.5 px-4 w-32 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredItems.map((item) => {
                const isTask = item.type === 'TASK';
                const isDone = item.status === 'DONE';

                return (
                  <tr
                    key={`tbl-${item.type}-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleDone(e, item)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--success-text)] transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--success-text)]" />
                        ) : (
                          <Circle className="w-4 h-4 stroke-[1.5]" />
                        )}
                      </button>
                    </td>

                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isTask
                            ? 'bg-[var(--primary-soft)] text-[var(--primary-text)]'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {isTask ? <CheckSquare className="w-2.5 h-2.5" /> : <BugIcon className="w-2.5 h-2.5" />}
                        <span>{item.type}</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--muted-foreground)]">
                      {item.humanId}
                    </td>

                    <td className="py-2.5 px-4 font-medium text-[var(--foreground)]">
                      <div className="flex items-center gap-2 truncate max-w-md">
                        <span className={isDone ? 'line-through text-[var(--muted-foreground)]' : ''}>
                          {item.title}
                        </span>
                        {item.attachmentsCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--muted-foreground)]">
                            <ImageIcon className="w-2.5 h-2.5 text-[var(--primary-text)]" />
                            <span>{item.attachmentsCount}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--muted-foreground)]">
                      {item.projectName || '-'}
                    </td>

                    <td className="py-2.5 px-3">
                      {item.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={item.assignee.name} email={item.assignee.email} size="xs" />
                          <span className="text-[12px] text-[var(--foreground)] truncate max-w-[80px]">
                            {item.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--muted-foreground)] opacity-60">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[12px] text-[var(--muted-foreground)]">
                      {item.dueAt
                        ? new Date(item.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : item.reportedAt
                        ? new Date(item.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isTask ? (
                        <PriorityBadge priority={item.priority || 'MEDIUM'} />
                      ) : (
                        <SeverityBadge severity={item.severity || 'MAJOR'} />
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Unified Item Detail Modal */}
      {selectedItem && (
        <Modal
          open={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title=""
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedItem.type === 'TASK'
                        ? 'bg-[var(--primary-soft)] text-[var(--primary-text)]'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {selectedItem.type === 'TASK' ? (
                      <CheckSquare className="w-3 h-3" />
                    ) : (
                      <BugIcon className="w-3 h-3" />
                    )}
                    <span>{selectedItem.type}</span>
                  </span>

                  <span className="text-[12px] font-mono font-semibold text-[var(--muted-foreground)]">
                    {selectedItem.humanId}
                  </span>

                  {selectedItem.type === 'TASK' ? (
                    <PriorityBadge priority={selectedItem.priority || 'MEDIUM'} />
                  ) : (
                    <SeverityBadge severity={selectedItem.severity || 'MAJOR'} />
                  )}
                </div>

                <h2 className="text-[18px] font-semibold text-[var(--foreground)] leading-snug">
                  {selectedItem.title}
                </h2>
              </div>

              <StatusBadge status={selectedItem.status} />
            </div>

            {/* Quick Triage / Status Buttons */}
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-[var(--muted-foreground)]">Change status:</span>
              {selectedItem.status !== 'TODO' && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: selectedItem.id, newStatus: 'TODO' })
                  }
                  className="px-2.5 py-1 rounded-md bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer text-[11px] font-medium"
                >
                  To do
                </button>
              )}
              {selectedItem.status !== 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: selectedItem.id, newStatus: 'IN_PROGRESS' })
                  }
                  className="px-2.5 py-1 rounded-md bg-[var(--primary-soft)] hover:brightness-95 text-[var(--primary-text)] transition-colors cursor-pointer text-[11px] font-medium"
                >
                  In progress
                </button>
              )}
              {selectedItem.status !== 'DONE' && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: selectedItem.id, newStatus: 'DONE' })
                  }
                  className="px-2.5 py-1 rounded-md bg-[rgba(14,133,80,0.15)] hover:bg-[rgba(14,133,80,0.25)] text-[var(--success-text)] transition-colors cursor-pointer text-[11px] font-medium"
                >
                  Mark completed
                </button>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Description
              </h4>
              <p className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap bg-[var(--surface-raised)] p-3 rounded-xl border border-[var(--border)]">
                {selectedItem.description || 'No description provided.'}
              </p>
            </div>

            {/* If Bug: Steps and Device Context */}
            {selectedItem.type === 'BUG' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[12px]">
                <h4 className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  Bug Telemetry & Environment
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-[var(--muted-foreground)]">Device: </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedItem.deviceModel || 'Web Browser'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Reported: </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {new Date(selectedItem.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments (Screenshots & Audio) */}
            {selectedItem.raw?.attachments && selectedItem.raw.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  Attachments ({selectedItem.raw.attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedItem.raw.attachments.map((att: any) => {
                    const url = resolveAttachmentUrl(att.url || att.thumbUrl);
                    const isImg =
                      att.kind === 'IMAGE' ||
                      att.mimeType?.startsWith('image/') ||
                      url?.match(/\.(png|jpg|jpeg|webp)$/i);

                    if (isImg && url) {
                      return (
                        <div
                          key={att.id}
                          onClick={() => setLightboxUrl(url)}
                          className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-black/60 cursor-pointer hover:border-[var(--primary)] transition-all group"
                        >
                          <img
                            src={url}
                            alt={att.name || 'Attachment'}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] gap-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>Zoom</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={att.id}
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] flex items-center gap-2 text-[12px] text-[var(--foreground)] hover:border-[var(--primary)] transition-colors truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                        <span className="truncate">{att.name || 'File'}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Prompt Generator */}
            <SolutionPromptPanel
              taskId={selectedItem.id}
              attachments={selectedItem.raw?.attachments || []}
            />
          </div>
        </Modal>
      )}

      {/* Lightbox Image Preview */}
      {lightboxUrl && (
        <Modal
          open={Boolean(lightboxUrl)}
          onClose={() => setLightboxUrl(null)}
          title="Screenshot Preview"
          className="max-w-4xl p-2 bg-black/90 border-neutral-800"
        >
          <div className="flex flex-col items-center justify-center">
            <img
              src={lightboxUrl}
              alt="Screenshot Preview"
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-4">
              <a
                href={lightboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open original image</span>
              </a>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </PageContainer>
  );
}
