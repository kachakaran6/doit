import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api, resolveAttachmentUrl } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, SeverityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingCreateButton } from '@/components/layout/FloatingCreateButton';
import {
  CheckCircle2,
  Bug as BugIcon,
  Clock,
  Layers,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

export function DashboardPage() {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const wsId = activeWorkspace?.id;
  const pId = activeProject?.id;

  // 1. Fetch real tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', pId || wsId],
    queryFn: () => (pId ? api.tasks.list(pId) : wsId ? api.tasks.listWorkspace(wsId) : []),
    enabled: Boolean(pId || wsId),
  });

  // 2. Fetch real bugs
  const { data: bugs = [], isLoading: bugsLoading } = useQuery({
    queryKey: ['bugs', pId],
    queryFn: () => (pId ? api.bugs.list(pId) : []),
    enabled: Boolean(pId),
  });

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const openBugsCount = bugs.filter((b) => b.status !== 'DONE').length;

  const kpis = [
    {
      label: 'Completed tasks',
      value: completedCount,
      total: tasks.length,
      icon: CheckCircle2,
      color: 'text-[var(--success-text)]',
      to: '/tasks',
    },
    {
      label: 'In progress',
      value: inProgressCount,
      icon: Clock,
      color: 'text-[var(--primary-text)]',
      to: '/tasks',
    },
    {
      label: 'Active bugs',
      value: openBugsCount,
      icon: BugIcon,
      color: 'text-[var(--danger-text)]',
      to: '/bugs',
    },
    {
      label: 'Total tracked',
      value: tasks.length + bugs.length,
      icon: Layers,
      color: 'text-[var(--foreground)]',
      to: '/tasks',
    },
  ];

  const myWork = tasks.filter((t) => t.status !== 'DONE').slice(0, 6);
  const recentBugs = bugs.slice(0, 4);

  return (
    <PageContainer width="data" className="space-y-6 select-none">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} to={kpi.to} className="group">
              <Card className="p-4 hover:bg-[var(--accent)] transition-all duration-150">
                <div className="flex items-center justify-between text-[13px] text-[var(--muted-foreground)] mb-2">
                  <span>{kpi.label}</span>
                  <Icon className={`w-4 h-4 ${kpi.color} opacity-80`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--foreground)] tabular">
                    {tasksLoading ? '–' : kpi.value}
                  </span>
                  {kpi.total !== undefined && (
                    <span className="text-[11px] text-[var(--muted-foreground)] tabular">
                      of {kpi.total}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: My Work & Bugs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Work (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tasks Card */}
          <Card variant="bordered">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Active work</CardTitle>
                <CardDescription>Open tasks in current sprint</CardDescription>
              </div>
              <Link
                to="/tasks"
                className="text-[12px] font-semibold text-[var(--primary-text)] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : myWork.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[var(--muted-foreground)]">
                  All clear! No pending tasks in this workspace.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {myWork.map((t) => (
                    <div
                      key={t.id}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--accent)] px-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[11px] font-mono text-[var(--muted-foreground)] shrink-0">
                          {t.humanId}
                        </span>
                        <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Reported Bugs */}
          <Card variant="bordered">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recently reported bugs</CardTitle>
                <CardDescription>Captured from DoIt floating overlay or mobile app</CardDescription>
              </div>
              <Link
                to="/bugs"
                className="text-[12px] font-semibold text-[var(--primary-text)] hover:underline flex items-center gap-1"
              >
                <span>Triage queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent>
              {bugsLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : recentBugs.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[var(--muted-foreground)]">
                  No bugs reported yet. Use the floating bubble in mobile or topbar to report bugs.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentBugs.map((b) => {
                    const firstAttachment = b.attachments?.[0];
                    return (
                      <div
                        key={b.id}
                        className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--accent)] px-2 -mx-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail */}
                          {firstAttachment?.thumbUrl || firstAttachment?.url ? (
                            <img
                              src={resolveAttachmentUrl(firstAttachment.thumbUrl || firstAttachment.url)}
                              alt="Screenshot"
                              className="w-10 h-7 rounded-md object-cover bg-black/40 border border-[var(--border)] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-7 rounded-md bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] shrink-0">
                              <ImageIcon className="w-4 h-4 opacity-60" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                                {b.humanId}
                              </span>
                              <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                                {b.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <SeverityBadge severity={b.severity || 'MAJOR'} />
                          <StatusBadge status={b.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Breakdown & Quick Actions */}
        <div className="space-y-6">
          {/* Bugs Severity Breakdown */}
          <Card variant="bordered">
            <CardHeader className="pb-3">
              <CardTitle>Bugs by severity</CardTitle>
              <CardDescription>Active triage distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'].map((sev) => {
                const count = bugs.filter((b) => (b.severity || 'MAJOR') === sev).length;
                const pct = bugs.length > 0 ? (count / bugs.length) * 100 : 0;
                return (
                  <div key={sev} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <SeverityBadge severity={sev} />
                      <span className="text-[12px] font-medium text-[var(--muted-foreground)] tabular">
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          sev === 'CRITICAL'
                            ? 'bg-[var(--destructive)]'
                            : sev === 'MAJOR'
                              ? 'bg-[var(--warning-text)]'
                              : sev === 'MINOR'
                                ? 'bg-[#F59E0B]'
                                : 'bg-[var(--muted-foreground)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      </div>
      {/* Floating Action Button */}
      <FloatingCreateButton type="task" label="New task" />
    </PageContainer>
  );
}
