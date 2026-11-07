import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Search, Eye, Edit3, Sparkles } from 'lucide-react';

export function ProjectContextPanel({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName?: string;
  onClose?: () => void;
}) {
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
      onClose?.();
    },
    onError: (err: Error) => error('Could not save context', err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--muted-foreground)]">
        <span>
          {projectName || 'Project'} · {markdown.length}
          {data?.maxChars ? ` / ${data.maxChars}` : ''} characters
          {data?.updatedAt ? ` · updated ${new Date(data.updatedAt).toLocaleDateString()}` : ''}
          {data?.updatedBy?.name ? ` by ${data.updatedBy.name}` : ''}
        </span>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => setPreview((v) => !v)}
          className="gap-1.5"
        >
          {preview ? (
            <>
              <Edit3 className="w-3 h-3" />
              <span>Edit Markdown</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter or search context…"
          className="h-8.5 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-8.5 pr-3 text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
        {query.trim() ? (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted-foreground)]">
            {markdown.toLowerCase().split(query.trim().toLowerCase()).length - 1} match(es)
          </span>
        ) : null}
      </div>

      {isLoading ? <p className="text-[12px] text-[var(--muted-foreground)]">Loading context…</p> : null}

      {!markdown && data?.starter ? (
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => setMarkdown(data.starter)}
          className="gap-1 text-[var(--primary-text)]"
        >
          <Sparkles className="w-3 h-3" />
          <span>Insert suggested structure</span>
        </Button>
      ) : null}

      {preview ? (
        <div className="min-h-[260px] max-h-[400px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5 text-[13px] text-[var(--foreground)] font-mono whitespace-pre-wrap leading-relaxed">
          {markdown || 'Nothing saved yet.'}
        </div>
      ) : (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] p-3 text-[13px] text-[var(--foreground)] font-mono leading-relaxed placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          placeholder="Purpose, tech stack, architecture conventions, file paths, and rules for coding agents…"
        />
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setMarkdown(data?.markdown || '');
            onClose?.();
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => save.mutate()}
          loading={save.isPending}
          disabled={markdown === (data?.markdown || '')}
        >
          Save context
        </Button>
      </div>
    </div>
  );
}
