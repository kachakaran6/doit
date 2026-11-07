import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function ProjectContextPanel({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [markdown, setMarkdown] = useState('');
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['project-context', projectId],
    queryFn: () => api.context.get(projectId),
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (data) setMarkdown(data.markdown || '');
  }, [data?.version, projectId]);

  const save = useMutation({
    mutationFn: () => api.context.save(projectId, markdown, data?.version || 0),
    onSuccess: () => {
      success('Context saved', 'Prompt generation can use this project context.');
      queryClient.invalidateQueries({ queryKey: ['project-context', projectId] });
    },
    onError: (err: Error) => error('Could not save context', err.message),
  });

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--foreground)]">Project context</h2>
          <p className="text-[12px] text-[var(--muted-foreground)]">
            {projectName || 'Project'} · {markdown.length}
            {data?.maxChars ? ` / ${data.maxChars}` : ''} characters
            {data?.updatedAt ? ` · updated ${new Date(data.updatedAt).toLocaleString()}` : ''}
            {data?.updatedBy?.name ? ` by ${data.updatedBy.name}` : ''}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setPreview((v) => !v)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in context"
        className="h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-[13px]"
      />
      {query.trim() ? (
        <p className="text-[12px] text-[var(--muted-foreground)]">
          {markdown.toLowerCase().split(query.trim().toLowerCase()).length - 1} match(es)
        </p>
      ) : null}
      {isLoading ? <p className="text-[12px] text-[var(--muted-foreground)]">Loading context…</p> : null}
      {!markdown && data?.starter ? (
        <Button type="button" size="sm" variant="outline" onClick={() => setMarkdown(data.starter)}>
          Insert suggested structure
        </Button>
      ) : null}
      {preview ? (
        <pre className="whitespace-pre-wrap text-[13px] text-[var(--foreground)] font-sans">{markdown || 'Nothing saved yet.'}</pre>
      ) : (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[13px] text-[var(--foreground)]"
          placeholder="Purpose, stack, conventions, paths, and constraints."
        />
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setMarkdown(data?.markdown || '')} disabled={markdown === (data?.markdown || '')}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={() => save.mutate()} loading={save.isPending} disabled={markdown === (data?.markdown || '')}>
          Save context
        </Button>
      </div>
    </section>
  );
}
