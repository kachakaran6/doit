import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';

export function StickiesPage() {
  const stickies = [
    { id: '1', body: 'Remember to verify the S3 CORS headers before production launch.', isPinned: true },
    { id: '2', body: 'Audit offline queue sync states when network switches between cellular and Wi-Fi.', isPinned: false },
    { id: '3', body: 'Confirm brand accents pass contrast ratio WCAG AA 4.5:1 on light/dark mode.', isPinned: true },
    { id: '4', body: 'Review camera frame rate and memory footprint during continuous live session recording.', isPinned: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Sticky Board</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Freeform scratchpad for quick ideas and temporary thoughts
          </p>
        </div>

        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>New Sticky</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stickies.map((s) => (
          <Card
            key={s.id}
            className="p-5 flex flex-col justify-between min-h-[140px] hover:border-[var(--border-strong)] transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.body}</p>
              {s.isPinned && <Pin className="w-4 h-4 text-[var(--accent)] shrink-0" />}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-[10px] text-[var(--text-muted)]">
              <span>Sticky Note</span>
              <button className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                Convert to Task →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
