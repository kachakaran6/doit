import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';

export function SearchPage() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspace?.id);
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { data, isFetching, isError } = useQuery({
    queryKey: ['search', workspaceId, submitted],
    queryFn: () => api.search.global(submitted, workspaceId),
    enabled: submitted.trim().length > 1,
  });
  const items = Array.isArray(data) ? data : data?.items || data?.results || [];

  return (
    <PageContainer width="data" className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Search</h1>
      <p className="text-[13px] text-[var(--muted-foreground)]">
        Operators: #label, @assignee, is:bug, is:done, due:today, project:KEY
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, bugs, stickies" />
        <button type="submit" className="px-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-[13px]">
          Search
        </button>
      </form>
      {isFetching ? <p className="text-[13px] text-[var(--muted-foreground)]">Searching…</p> : null}
      {isError ? <p className="text-[13px] text-[var(--danger-text)]">Search failed. Try again.</p> : null}
      <ul className="space-y-2">
        {items.map((item: any) => (
          <li key={item.id} className="rounded-xl border border-[var(--border)] p-3">
            <Link to={item.type === 'BUG' ? '/bugs' : '/tasks'} className="text-[13px] font-semibold hover:underline">
              {item.title || item.body || item.humanId}
            </Link>
            <p className="text-[12px] text-[var(--muted-foreground)]">{item.type || item.kind} {item.humanId || ''}</p>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
