import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Bug, StickyNote, ArrowRight, Plus } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { label: 'Completed Tasks', count: 12, icon: CheckCircle2, color: 'text-[var(--success)]' },
    { label: 'Active Bugs', count: 3, icon: Bug, color: 'text-[var(--warning)]' },
    { label: 'Board Stickies', count: 8, icon: StickyNote, color: 'text-[var(--accent)]' },
  ];

  const recentTasks = [
    { id: 'SMP-1', title: 'Implement Linear graphite design system', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'SMP-2', title: 'Verify native camera & microphone audio capture', status: 'DONE', priority: 'URGENT' },
    { id: 'SMP-3', title: 'Add real-time sync conflict resolver', status: 'TODO', priority: 'MEDIUM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Project Overview</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time status for active workspace and cross-platform sync
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Capture Item</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className="hover:border-[var(--border-strong)] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Work Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Work Items</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Card>
          <div className="divide-y divide-[var(--border)]">
            {recentTasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-[var(--surface-raised)] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">{t.id}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{t.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.priority === 'HIGH' || t.priority === 'URGENT' ? 'danger' : 'secondary'}>
                    {t.priority}
                  </Badge>
                  <Badge variant={t.status === 'DONE' ? 'success' : 'default'}>
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
