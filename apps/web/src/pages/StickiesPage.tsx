import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { FloatingCreateButton } from '@/components/layout/FloatingCreateButton';
import { useCreateStore } from '@/lib/create-store';
import { Pin, Trash2, ArrowRight, Plus } from 'lucide-react';

export function StickiesPage() {
  const { activeProject, projects } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const openCreate = useCreateStore((s) => s.openCreate);

  const pId = activeProject?.id || projects[0]?.id;

  // 1. Fetch real stickies from backend
  const { data: stickies = [], isLoading } = useQuery({
    queryKey: ['stickies', pId],
    queryFn: () => (pId ? api.stickies.list(pId) : []),
    enabled: Boolean(pId),
  });

  // 2. Toggle Pin Mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      api.stickies.update(id, { isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickies'] });
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.stickies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickies'] });
      success('Note deleted', 'Sticky removed from board.');
    },
    onError: (err: any) => {
      error('Failed to delete note', err.message);
    },
  });

  // 4. Convert to Task Mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => api.stickies.convert(id),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['stickies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Converted to task', task.title);
    },
    onError: (err: any) => {
      error('Failed to convert', err.message);
    },
  });

  // Sort: pinned first
  const sortedStickies = [...stickies].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const pastelColors = [
    'bg-[rgba(255,237,160,0.15)] dark:bg-[rgba(255,237,160,0.08)] text-[var(--foreground)]', // soft yellow
    'bg-[rgba(167,243,208,0.15)] dark:bg-[rgba(167,243,208,0.08)] text-[var(--foreground)]', // soft green
    'bg-[rgba(191,219,254,0.15)] dark:bg-[rgba(191,219,254,0.08)] text-[var(--foreground)]', // soft blue
    'bg-[rgba(233,213,255,0.15)] dark:bg-[rgba(233,213,255,0.08)] text-[var(--foreground)]', // soft purple
    'bg-[rgba(254,205,211,0.15)] dark:bg-[rgba(254,205,211,0.08)] text-[var(--foreground)]', // soft rose
  ];

  return (
    <PageContainer width="data" className="space-y-6 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
          {stickies.length} {stickies.length === 1 ? 'sticky note' : 'sticky notes'}
        </span>

        <button
          type="button"
          onClick={() => openCreate('sticky')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] text-[12px] font-medium text-[var(--foreground)] transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <span>New sticky</span>
        </button>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : sortedStickies.length === 0 ? (
        <EmptyState
          title="No sticky notes yet"
          description="Capture quick ideas or temporary thoughts. You can convert any sticky note into a real task whenever you're ready."
          actionLabel="Add sticky note"
          onAction={() => openCreate('sticky')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedStickies.map((sticky, idx) => {
            const colorClass = pastelColors[idx % pastelColors.length] ?? pastelColors[0]!;
            return (
              <div
                key={sticky.id}
                className={`p-4 rounded-2xl border border-[var(--border)] ${colorClass} flex flex-col justify-between min-h-[170px] shadow-xs hover:border-[var(--border-strong)] transition-all group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        togglePinMutation.mutate({ id: sticky.id, isPinned: !sticky.isPinned })
                      }
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        sticky.isPinned
                          ? 'text-[var(--primary-text)]'
                          : 'text-[var(--muted-foreground)] opacity-40 hover:opacity-100'
                      }`}
                      title={sticky.isPinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${sticky.isPinned ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(sticky.id)}
                      className="p-1 rounded-md text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-[var(--danger-text)] transition-all cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {sticky.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span>{sticky.createdAt ? new Date(sticky.createdAt).toLocaleDateString() : 'Recent'}</span>
                  <button
                    type="button"
                    onClick={() => convertMutation.mutate(sticky.id)}
                    className="font-medium text-[var(--primary-text)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>To task</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating CTA Button */}
      <FloatingCreateButton type="sticky" label="New sticky" />
    </PageContainer>
  );
}
