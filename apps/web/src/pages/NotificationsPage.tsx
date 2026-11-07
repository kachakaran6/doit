import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
  });
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
      {isLoading ? <p className="text-[13px] text-[var(--muted-foreground)]">Loading notifications…</p> : null}
      {isError ? (
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      ) : null}
      {!isLoading && items.length === 0 ? (
        <EmptyState title="No notifications" description="Assignments, bugs, and due dates show up here." />
      ) : null}
      <ul className="space-y-2">
        {items.map((item: any) => (
          <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold">{item.title}</div>
              {item.body ? <p className="text-[12px] text-[var(--muted-foreground)]">{item.body}</p> : null}
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{item.type} · {item.isRead ? 'Read' : 'Unread'}</p>
            </div>
            {!item.isRead ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await api.notifications.markRead(item.id);
                  queryClient.invalidateQueries({ queryKey: ['notifications'] });
                }}
              >
                Mark read
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
