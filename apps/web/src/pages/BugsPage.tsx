import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api, resolveAttachmentUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SeverityBadge, StatusBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { ShadcnSelect } from '@/components/ui/select';
import { SolutionPromptPanel } from '@/components/tasks/SolutionPromptPanel';
import { useCreateStore } from '@/lib/create-store';
import {
  Search,
  Image as ImageIcon,
  Mic,
  Smartphone,
  ExternalLink,
  Maximize2,
  X,
  ChevronLeft,
  ChevronDown,
  Plus,
} from 'lucide-react';

function BugThumbnailItem({ bug }: { bug: any }) {
  const [error, setError] = useState(false);
  const imgAtt = bug.attachments?.find(
    (a: any) =>
      a.kind === 'IMAGE' ||
      a.mimeType?.includes('image') ||
      a.url?.match(/\.(png|jpg|jpeg|webp)$/i) ||
      a.thumbUrl?.match(/\.(png|jpg|jpeg|webp)$/i),
  );

  const rawUrl = imgAtt?.url || imgAtt?.thumbUrl || bug.attachments?.[0]?.url;
  const resolvedUrl = rawUrl ? resolveAttachmentUrl(rawUrl) : null;

  if (!resolvedUrl || error) {
    return (
      <div className="w-10 h-8 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] shrink-0">
        <ImageIcon className="w-3.5 h-3.5 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={bug.humanId}
      onError={() => setError(true)}
      className="w-10 h-8 rounded-md object-cover bg-black/40 border border-[var(--border)] shrink-0"
    />
  );
}

export function BugsPage() {
  const { activeProject, projects, setActiveProject } = useWorkspaceStore();
  const openCreate = useCreateStore((s) => s.openCreate);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [telemetryOpen, setTelemetryOpen] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['bugs', pId] });
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
      if (severityFilter !== 'ALL' && b.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && b.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [bugs, searchQuery, severityFilter, statusFilter]);

  // Default selection to first bug on wide desktop if none selected
  useEffect(() => {
    if (!selectedBugId && filteredBugs.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedBugId(filteredBugs[0]?.id || null);
    }
  }, [filteredBugs, selectedBugId]);

  const activeBug = bugDetail || filteredBugs.find((b) => b.id === selectedBugId);

  // Extract screenshot and audio
  const screenshotAttachment = useMemo(() => {
    if (!activeBug?.attachments) return null;
    return activeBug.attachments.find(
      (a: any) =>
        a.kind === 'IMAGE' ||
        a.mimeType?.includes('image') ||
        a.url?.match(/\.(png|jpg|jpeg|webp)$/i) ||
        a.thumbUrl?.match(/\.(png|jpg|jpeg|webp)$/i),
    );
  }, [activeBug]);

  const audioAttachment = useMemo(() => {
    if (!activeBug?.attachments) return null;
    return activeBug.attachments.find(
      (a: any) =>
        a.kind === 'AUDIO' ||
        a.mimeType?.includes('audio') ||
        a.url?.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i),
    );
  }, [activeBug]);

  const rawUrl = screenshotAttachment?.url || screenshotAttachment?.thumbUrl;
  const screenshotUrl = rawUrl ? resolveAttachmentUrl(rawUrl) : null;

  return (
    <PageContainer width="workspace" className="select-none relative flex flex-col min-h-full">
      {/* Top Workspace Toolbar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-3 shrink-0 space-y-3">
        {/* Row 1: Context & Primary Action */}
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
                {activeProject?.name || projects[0]?.name || 'Bug Queue'}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
              {filteredBugs.length} {filteredBugs.length === 1 ? 'bug' : 'bugs'}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openCreate('bug')}
            className="h-8 text-[12px] gap-1 px-3 shadow-2xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report bug</span>
          </Button>
        </div>

        {/* Row 2: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/70">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search bugs by title or ID…"
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
            value={severityFilter}
            onChange={setSeverityFilter}
            className="h-8 text-[12px] min-w-[130px]"
            wrapperClassName="w-auto"
            options={[
              { value: 'ALL', label: 'All severities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'MAJOR', label: 'Major' },
              { value: 'MINOR', label: 'Minor' },
              { value: 'TRIVIAL', label: 'Trivial' },
            ]}
          />

          <ShadcnSelect
            value={statusFilter}
            onChange={setStatusFilter}
            className="h-8 text-[12px] min-w-[140px]"
            wrapperClassName="w-auto"
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'TODO', label: 'To do / Triaged' },
              { value: 'IN_PROGRESS', label: 'In progress' },
              { value: 'DONE', label: 'Resolved' },
            ]}
          />

          {(searchQuery || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Triage List (Left ~42%) + Detail Inspector (Right ~58%) */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : filteredBugs.length === 0 ? (
        <EmptyState
          title="No bugs in queue"
          description="There are currently no bugs in this workspace. Reports from the DoIt mobile app (shake gesture or floating bubble) will appear here in real time."
          actionLabel="Report a bug"
          onAction={() => openCreate('bug')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Triage List (lg: 5 cols = ~42%) */}
          <div
            className={`lg:col-span-5 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs divide-y divide-[var(--border)] ${
              selectedBugId ? 'hidden lg:block' : 'block'
            }`}
          >
            {filteredBugs.map((bug) => {
              const isSelected = activeBug?.id === bug.id;

              return (
                <div
                  key={bug.id}
                  onClick={() => setSelectedBugId(bug.id)}
                  className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] font-medium border-l-3 border-[var(--primary)]'
                      : 'hover:bg-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BugThumbnailItem bug={bug} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-semibold text-[var(--muted-foreground)]">
                          {bug.humanId}
                        </span>
                        <span className="text-[13px] text-[var(--foreground)] truncate">
                          {bug.title}
                        </span>
                      </div>

                      {/* Device & Date meta row */}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 opacity-60" />
                          <span>Mobile</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SeverityBadge severity={bug.severity || 'MAJOR'} />
                    <StatusBadge status={bug.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Inspector Pane (lg: 7 cols = ~58%) */}
          <div
            className={`lg:col-span-7 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5 shadow-2xs ${
              selectedBugId ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Mobile Back Button to queue list */}
            {selectedBugId && (
              <button
                type="button"
                onClick={() => setSelectedBugId(null)}
                className="lg:hidden inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--primary-text)] hover:underline cursor-pointer mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to bug queue</span>
              </button>
            )}

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
                    <h3 className="text-[17px] font-semibold text-[var(--foreground)] leading-snug">
                      {activeBug.title}
                    </h3>
                  </div>

                  <StatusBadge status={activeBug.status} />
                </div>

                {/* Triage Action Row */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                  <span className="text-[12px] font-medium text-[var(--muted-foreground)]">Triage action:</span>
                  {activeBug.status !== 'IN_PROGRESS' && (
                    <Button
                      variant="soft"
                      size="xs"
                      onClick={() =>
                        updateStatusMutation.mutate({ bugId: activeBug.id, status: 'IN_PROGRESS' })
                      }
                      className="cursor-pointer"
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
                      className="text-[var(--success-text)] hover:bg-[rgba(14,133,80,0.1)] cursor-pointer"
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
                      className="cursor-pointer"
                    >
                      Reopen
                    </Button>
                  )}
                </div>

                {/* Description & Reproduction Steps (Prominently First) */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                    Issue Description & Reproduction
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-raised)]/60 border border-[var(--border)]">
                    <p className="text-[13px] text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                      {activeBug.description || 'No detailed reproduction steps or notes provided for this report.'}
                    </p>
                  </div>
                </div>

                {/* Compact Screenshot Viewer Card (With Lightbox) */}
                {screenshotAttachment && screenshotUrl ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      <span>Captured screenshot</span>
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="flex items-center gap-1 text-[var(--primary-text)] hover:underline cursor-pointer text-[11px]"
                      >
                        <span>Full screen</span>
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div
                      onClick={() => !imgError && setLightboxOpen(true)}
                      className={`relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/60 max-h-48 h-40 flex items-center justify-center transition-all ${
                        !imgError ? 'cursor-pointer hover:border-[var(--primary)] group' : ''
                      }`}
                    >
                      {imgLoading && !imgError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-raised)]/80 z-10">
                          <Skeleton className="w-full h-full" />
                        </div>
                      )}

                      {imgError ? (
                        <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                          <ImageIcon className="w-6 h-6 opacity-40 text-[var(--muted-foreground)]" />
                          <span className="text-[12px] text-[var(--muted-foreground)]">
                            Unable to preview screenshot in this frame
                          </span>
                          <a
                            href={screenshotUrl}
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
                          src={screenshotUrl}
                          alt="Bug Screenshot"
                          onLoad={() => setImgLoading(false)}
                          onError={() => {
                            setImgLoading(false);
                            setImgError(true);
                          }}
                          className={`w-full h-full object-contain transition-opacity duration-200 ${
                            imgLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                      )}

                      {!imgLoading && !imgError && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Click to expand</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Audio Note Player if present */}
                {audioAttachment && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--foreground)]">
                      <Mic className="w-4 h-4 text-[var(--primary-text)]" />
                      <span>Reporter voice note</span>
                    </div>
                    <audio controls className="w-full mt-2 h-8">
                      <source src={resolveAttachmentUrl(audioAttachment.url)} type={audioAttachment.mimeType} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Collapsible Device Telemetry Section */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] overflow-hidden text-[12px]">
                  <button
                    type="button"
                    onClick={() => setTelemetryOpen(!telemetryOpen)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                      <span className="text-[12px]">Device Telemetry & Environment</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-150 ${
                        telemetryOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {telemetryOpen && (
                    <div className="p-3.5 pt-0 border-t border-[var(--border)] space-y-2 mt-2">
                      <div className="flex justify-between py-1 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Capture Source</span>
                        <span className="font-medium text-[var(--foreground)]">{activeBug.source || 'MOBILE_OVERLAY'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Reported Timestamp</span>
                        <span className="text-[var(--foreground)]">{new Date(activeBug.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Target App Version</span>
                        <span className="font-mono text-[var(--foreground)]">v1.2.0-rc3 (DoIt Mobile)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--muted-foreground)]">Operating System</span>
                        <span className="font-medium text-[var(--foreground)]">Android 14 (API 34)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Solution Prompt Panel */}
                <SolutionPromptPanel taskId={activeBug.id} attachments={activeBug.attachments || []} />
              </>
            ) : (
              <div className="py-16 text-center text-[13px] text-[var(--muted-foreground)]">
                Select a bug from the queue to inspect details, screenshots, and telemetry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {lightboxOpen && screenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between py-2 text-white text-[13px] mb-2 font-medium">
              <span className="truncate">{activeBug?.humanId} — Screenshot Preview</span>
              <div className="flex items-center gap-3">
                <a
                  href={screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-[12px]"
                >
                  <span>Open raw</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[80vh]">
              <img
                src={screenshotUrl}
                alt="Full Screenshot"
                className="max-w-full max-h-[80vh] object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
}
