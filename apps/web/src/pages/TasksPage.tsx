import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, LayoutList, Columns3, CheckCircle2, Circle } from 'lucide-react';

export function TasksPage() {
  const [view, setView] = useState<'list' | 'board'>('list');

  const tasks = [
    { id: 'SMP-1', title: 'Implement Linear graphite design system', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'SMP-2', title: 'Verify native camera & microphone audio capture', status: 'DONE', priority: 'URGENT' },
    { id: 'SMP-3', title: 'Add real-time sync conflict resolver', status: 'TODO', priority: 'MEDIUM' },
    { id: 'SMP-4', title: 'Standardize bottom floating navigation bar', status: 'DONE', priority: 'HIGH' },
    { id: 'SMP-5', title: 'Audit and redesign settings view with avatar', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Tasks</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track, filter, and prioritize your team's sprint backlogs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-[var(--border)] rounded-md p-0.5 bg-[var(--surface-raised)]">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded text-xs font-medium cursor-pointer ${
                view === 'list'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded text-xs font-medium cursor-pointer ${
                view === 'board'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>

          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card>
          <div className="divide-y divide-[var(--border)]">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--surface-raised)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {t.status === 'DONE' ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  )}
                  <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">{t.id}</span>
                  <span
                    className={`text-sm font-medium ${
                      t.status === 'DONE' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.priority === 'HIGH' || t.priority === 'URGENT' ? 'danger' : 'secondary'}>
                    {t.priority}
                  </Badge>
                  <Badge variant={t.status === 'DONE' ? 'success' : 'secondary'}>
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div
                key={col}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {col.replace('_', ' ')}
                  </span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {colTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2 flex-1">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-md border border-[var(--border)] bg-[var(--surface-raised)] text-xs space-y-1.5 shadow-sm"
                    >
                      <div className="font-mono text-[10px] text-[var(--text-muted)]">{t.id}</div>
                      <div className="font-medium text-[var(--text-primary)]">{t.title}</div>
                      <Badge variant="secondary" className="text-[10px]">
                        {t.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
