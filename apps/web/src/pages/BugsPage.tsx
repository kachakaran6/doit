import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SeverityBadge, StatusBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { SolutionPromptPanel } from '@/components/tasks/SolutionPromptPanel';
import {
  Search,
  Image as ImageIcon,
  Mic,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export function BugsPage() {
  const { activeProject, projects } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);

  const pId = activeProject?.id || projects[0]?.id;

  // 1. Fetch real bugs from backend
  const { data: bugs = [], isLoading } = useQuery({
    queryKey: ['bugs', pId],
    queryFn: () => (pId ? api.bugs.list(pId) : []),
    enabled: Boolean(pId),
  });

  // 2. Fetch full bug details when selected
  const { data: bugDetail } = useQuery({
    queryKey: ['bug', selectedBugId],
    queryFn: () => (selectedBugId ? api.tasks.get(selectedBugId) : null),
    enabled: Boolean(selectedBugId),
  });

  // 3. Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ bugId, status }: { bugId: string; status: string }) =>
      api.tasks.updateStatus(bugId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bug', updated.id] });
      success('Bug status updated', `Marked as ${updated.status}`);
    },
    onError: (err: any) => {
      error('Failed to update bug', err.message);
    },
  });

  // Filter bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchId = b.humanId.toLowerCase().includes(q);
        if (!matchTitle && !matchId) return false;
      }
      if (severityFilter !== 'ALL' && (b.severity || 'MAJOR') !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && b.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [bugs, searchQuery, severityFilter, statusFilter]);

  const firstFiltered = filteredBugs[0];
  const activeBug = bugDetail || bugs.find((b) => b.id === selectedBugId) || firstFiltered || null;

  // Auto-select first bug on load if none selected
  useEffect(() => {
    if (!selectedBugId && firstFiltered) {
      setSelectedBugId(firstFiltered.id);
    }
  }, [selectedBugId, firstFiltered]);

  const screenshotAttachment = activeBug?.attachments?.find((a) => a.kind === 'IMAGE' || a.mimeType?.includes('image'));
  const audioAttachment = activeBug?.attachments?.find((a) => a.kind === 'AUDIO' || a.mimeType?.includes('audio'));

  return (
    <PageContainer width="data" className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Bug Queue</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
              {filteredBugs.length}
            </span>
          </div>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
            Issues captured from mobile shake gesture, overlay bubble, and web reports.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search bugs by title or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-[var(--input)] bg-[var(--card)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-8 rounded-lg border border-[var(--input)] bg-[var(--card)] px-2.5 text-[12px] font-medium text-[var(--foreground)] focus:outline-none"
        >
          <option value="ALL">All severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="MAJOR">Major</option>
          <option value="MINOR">Minor</option>
          <option value="TRIVIAL">Trivial</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-lg border border-[var(--input)] bg-[var(--card)] px-2.5 text-[12px] font-medium text-[var(--foreground)] focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To do / Triaged</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Resolved</option>
        </select>
      </div>

      {/* Main Split Layout: Triage Table (Left) + Detail Inspector (Right) */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : filteredBugs.length === 0 ? (
        <EmptyState
          title="No bugs in queue"
          description="Great job! There are currently no bugs in this workspace. Reports from the DoIt mobile app (shake gesture or floating bubble) will appear here in real time."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table / List (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs divide-y divide-[var(--border)]">
            {filteredBugs.map((bug) => {
              const isSelected = activeBug?.id === bug.id;
              const thumb = bug.attachments?.[0]?.thumbUrl || bug.attachments?.[0]?.url;

              return (
                <div
                  key={bug.id}
                  onClick={() => setSelectedBugId(bug.id)}
                  className={`p-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[var(--accent)] font-medium' : 'hover:bg-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Screenshot Thumbnail */}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt="Preview"
                        className="w-10 h-7 rounded-md object-cover bg-black/40 border border-[var(--border)] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-7 rounded-md bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] shrink-0">
                        <ImageIcon className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-[var(--muted-foreground)]">
                          {bug.humanId}
                        </span>
                        <span className="text-[13px] text-[var(--foreground)] truncate">
                          {bug.title}
                        </span>
                      </div>

                      {/* Device & Meta row */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 opacity-70" />
                          <span>Mobile</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <SeverityBadge severity={bug.severity || 'MAJOR'} />
                    <StatusBadge status={bug.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Pane (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-6 shadow-2xs sticky top-4">
            {activeBug ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-mono font-semibold text-[var(--muted-foreground)]">
                        {activeBug.humanId}
                      </span>
                      <SeverityBadge severity={activeBug.severity || 'MAJOR'} />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[var(--foreground)] leading-snug">
                      {activeBug.title}
                    </h3>
                  </div>

                  <StatusBadge status={activeBug.status} />
                </div>

                {/* Status Update Quick Action */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[var(--muted-foreground)]">Triage action:</span>
                  {activeBug.status !== 'IN_PROGRESS' && (
                    <Button
                      variant="soft"
                      size="xs"
                      onClick={() =>
                        updateStatusMutation.mutate({ bugId: activeBug.id, status: 'IN_PROGRESS' })
                      }
                    >
                      Start investigation
                    </Button>
                  )}
                  {activeBug.status !== 'DONE' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        updateStatusMutation.mutate({ bugId: activeBug.id, status: 'DONE' })
                      }
                      className="text-[var(--success-text)]"
                    >
                      Mark resolved
                    </Button>
                  )}
                  {activeBug.status === 'DONE' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        updateStatusMutation.mutate({ bugId: activeBug.id, status: 'TODO' })
                      }
                    >
                      Reopen
                    </Button>
                  )}
                </div>

                {/* Screenshot Viewer */}
                {screenshotAttachment ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                      <span>Captured screenshot</span>
                      <a
                        href={screenshotAttachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[var(--primary-text)] hover:underline"
                      >
                        <span>Full screen</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-black/50 aspect-video flex items-center justify-center">
                      <img
                        src={screenshotAttachment.url}
                        alt="Bug Screenshot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-3 text-[12px] text-[var(--muted-foreground)]">
                    <ImageIcon className="w-5 h-5 opacity-40 shrink-0" />
                    <span>No screenshot attached to this report.</span>
                  </div>
                )}

                {/* Audio Note Player if present */}
                {audioAttachment && (
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--foreground)]">
                      <Mic className="w-4 h-4 text-[var(--primary-text)]" />
                      <span>Voice note attachment</span>
                    </div>
                    <audio controls className="w-full mt-2 h-8">
                      <source src={audioAttachment.url} type={audioAttachment.mimeType} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Device & Telemetry Info */}
                <div className="space-y-2 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[12px]">
                  <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
                    Device telemetry
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[var(--border)]">
                    <span className="text-[var(--muted-foreground)]">Source</span>
                    <span className="font-medium text-[var(--foreground)]">{activeBug.source || 'MOBILE_OVERLAY'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[var(--border)]">
                    <span className="text-[var(--muted-foreground)]">Reported at</span>
                    <span className="text-[var(--foreground)]">{new Date(activeBug.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[var(--muted-foreground)]">Platform</span>
                    <span className="font-medium text-[var(--foreground)]">Android 14 (DoIt Mobile)</span>
                  </div>
                </div>

                {/* Description */}
                {activeBug.description && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Notes / Description
                    </div>
                    <p className="text-[13px] text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                      {activeBug.description}
                    </p>
                  </div>
                )}

                <SolutionPromptPanel taskId={activeBug.id} attachments={activeBug.attachments || []} />
              </>
            ) : (
              <div className="py-12 text-center text-[13px] text-[var(--muted-foreground)]">
                Select a bug from the queue to view details and screenshots.
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
