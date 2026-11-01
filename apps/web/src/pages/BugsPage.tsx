import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Bug } from 'lucide-react';

export function BugsPage() {
  const bugs = [
    { id: 'SMP-BUG-1', title: 'App crashed when updating profile details', severity: 'CRITICAL', status: 'TRIAGED' },
    { id: 'SMP-BUG-2', title: 'Task saving depth loop in capture modal', severity: 'MAJOR', status: 'RESOLVED' },
    { id: 'SMP-BUG-3', title: 'Header alignment misaligned on small tablets', severity: 'MINOR', status: 'IN_PROGRESS' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Bug Queue</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Issues, exceptions, and automatic device telemetry logs
          </p>
        </div>

        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Report Bug</span>
        </Button>
      </div>

      <Card>
        <div className="divide-y divide-[var(--border)]">
          {bugs.map((b) => (
            <div
              key={b.id}
              className="p-4 flex items-center justify-between hover:bg-[var(--surface-raised)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bug className="w-4 h-4 text-[var(--danger)] shrink-0" />
                <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">{b.id}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{b.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={b.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                  {b.severity}
                </Badge>
                <Badge variant={b.status === 'RESOLVED' ? 'success' : 'secondary'}>
                  {b.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
