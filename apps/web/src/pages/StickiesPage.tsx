import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { ShadcnSelect } from '@/components/ui/select';
import { useCreateStore } from '@/lib/create-store';
import {
  Pin,
  Trash2,
  ArrowRight,
  Plus,
  Search,
  X,
  StickyNote,
} from 'lucide-react';

const PASTEL_THEMES = [
  { id: 'yellow', label: 'Yellow', bg: 'bg-[#fef9c3]/70 dark:bg-[#713f12]/20 border-[#fde047]/50 dark:border-[#854d0e]/40' },
  { id: 'green', label: 'Green', bg: 'bg-[#dcfce7]/70 dark:bg-[#14532d]/20 border-[#86efac]/50 dark:border-[#166534]/40' },
  { id: 'blue', label: 'Blue', bg: 'bg-[#dbeafe]/70 dark:bg-[#1e3a8a]/20 border-[#93c5fd]/50 dark:border-[#1e40af]/40' },
  { id: 'purple', label: 'Purple', bg: 'bg-[#f3e8ff]/70 dark:bg-[#581c87]/20 border-[#d8b4fe]/50 dark:border-[#6b21a8]/40' },
  { id: 'rose', label: 'Rose', bg: 'bg-[#ffe4e6]/70 dark:bg-[#881337]/20 border-[#fecdd3]/50 dark:border-[#9f1239]/40' },
];

export function StickiesPage() {
  const { activeProject, projects, setActiveProject } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const openCreate = useCreateStore((s) => s.openCreate);

  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [quickNoteBody, setQuickNoteBody] = useState('');
  const [quickColor, setQuickColor] = useState('yellow');

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
      queryClient.invalidateQueries({ queryKey: ['stickies', pId] });
    },
  });

  // 3. Quick Create Note Mutation
  const createNoteMutation = useMutation({
    mutationFn: (body: string) =>
      api.stickies.create(pId!, {
        body: body.trim(),
        color: quickColor,
        isPinned: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickies', pId] });
      setQuickNoteBody('');
      success('Note posted', 'Sticky note added to the board.');
    },
    onError: (err: any) => {
      error('Failed to create note', err.message);
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.stickies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickies', pId] });
      success('Note deleted', 'Sticky removed from board.');
    },
    onError: (err: any) => {
      error('Failed to delete note', err.message);
    },
  });

  // 5. Convert to Task Mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => api.stickies.convert(id),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['stickies', pId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      success('Converted to task', task.title);
    },
    onError: (err: any) => {
      error('Failed to convert', err.message);
    },
  });

  // Filter & sort stickies
  const filteredStickies = useMemo(() => {
    return stickies
      .filter((s) => {
        if (pinnedOnly && !s.isPinned) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return s.body.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [stickies, searchQuery, pinnedOnly]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteBody.trim() || !pId) return;
    createNoteMutation.mutate(quickNoteBody);
  };

  return (
    <PageContainer width="workspace" className="select-none relative flex flex-col min-h-full">
      {/* Top Workspace Toolbar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-3 shrink-0 space-y-3">
        {/* Row 1: Project & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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
                {activeProject?.name || projects[0]?.name || 'Sticky Board'}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
              {stickies.length} {stickies.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openCreate('sticky')}
            className="h-8 text-[12px] gap-1 px-3 shadow-2xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New sticky</span>
          </Button>
        </div>

        {/* Row 2: Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/70">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search sticky notes…"
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

          <button
            type="button"
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer ${
              pinnedOnly
                ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary-text)] font-semibold'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${pinnedOnly ? 'fill-current' : ''}`} />
            <span>Pinned only</span>
          </button>

          {(searchQuery || pinnedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPinnedOnly(false);
              }}
              className="text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Board Grid Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
          {/* 1. Quick Compose Card (Always present as the first interactive slot on the canvas) */}
          <form
            onSubmit={handleQuickSubmit}
            className="p-4 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--border-strong)] focus-within:border-[var(--primary)] bg-[var(--card)] flex flex-col justify-between min-h-[190px] shadow-2xs transition-all space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <StickyNote className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                  <span>Quick Note</span>
                </span>
                <span className="text-[10px] font-normal opacity-70">Ctrl+Enter</span>
              </div>

              <textarea
                rows={3}
                placeholder="Jot a quick note or idea…"
                value={quickNoteBody}
                onChange={(e) => setQuickNoteBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleQuickSubmit(e);
                  }
                }}
                className="w-full bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
              {/* Color dots */}
              <div className="flex items-center gap-1">
                {PASTEL_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setQuickColor(theme.id)}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      quickColor === theme.id ? 'ring-2 ring-[var(--primary)] scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        theme.id === 'yellow' ? '#fde047' :
                        theme.id === 'green' ? '#86efac' :
                        theme.id === 'blue' ? '#93c5fd' :
                        theme.id === 'purple' ? '#d8b4fe' : '#fecdd3',
                    }}
                    title={theme.label}
                  />
                ))}
              </div>

              <Button
                type="submit"
                size="xs"
                variant="primary"
                disabled={!quickNoteBody.trim() || createNoteMutation.isPending}
                className="h-6 text-[11px] px-2.5 font-medium cursor-pointer"
              >
                {createNoteMutation.isPending ? 'Saving…' : 'Add'}
              </Button>
            </div>
          </form>

          {/* 2. Existing Sticky Notes Cards */}
          {filteredStickies.map((sticky, idx) => {
            const theme =
              PASTEL_THEMES.find((t) => t.id === sticky.color) ||
              PASTEL_THEMES[idx % PASTEL_THEMES.length] ||
              PASTEL_THEMES[0]!;

            return (
              <div
                key={sticky.id}
                className={`p-4 rounded-2xl border ${theme.bg} flex flex-col justify-between min-h-[190px] shadow-2xs hover:shadow-sm transition-all group relative`}
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
                          ? 'text-[var(--primary-text)] font-semibold'
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

                  <p className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap select-text">
                    {sticky.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)]/40 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span>{sticky.createdAt ? new Date(sticky.createdAt).toLocaleDateString() : 'Recent'}</span>
                  <button
                    type="button"
                    onClick={() => convertMutation.mutate(sticky.id)}
                    className="font-medium text-[var(--primary-text)] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Convert this sticky note into a real project task"
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
      </div>
    </PageContainer>
  );
}
