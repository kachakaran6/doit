import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { TaskAttachment } from '@/lib/types';

export function SolutionPromptPanel({
  taskId,
  attachments = [],
}: {
  taskId: string;
  attachments?: TaskAttachment[];
}) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [visionNote, setVisionNote] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['solution-prompts', taskId],
    queryFn: () => api.ai.prompts(taskId),
  });

  const prompts = data?.prompts || [];
  const shown = draft || (activeId ? '' : prompts[0]?.promptMarkdown || '');

  const generate = async (useTemplate: boolean, force = false) => {
    try {
      setBusy(true);
      const created = await api.ai.generate(taskId, {
        selectedAttachmentIds: selected,
        useTemplate,
        force,
      });
      setActiveId(created.id);
      setDraft(created.promptMarkdown);
      setVisionNote(created.visionWarning || null);
      await queryClient.invalidateQueries({ queryKey: ['solution-prompts', taskId] });
      success(useTemplate ? 'Prompt assembled' : 'Prompt generated', created.model || created.provider || '');
    } catch (err: any) {
      const message = err?.message || 'Could not generate a prompt.';
      if (/edited/i.test(message) && !force) {
        if (window.confirm('This prompt was edited. Generate a new version anyway?')) {
          await generate(useTemplate, true);
        }
        return;
      }
      error('Prompt', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-2">
      <div className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
        Solution prompt
      </div>
      <p className="text-[12px] text-[var(--muted-foreground)]">
        AI generation sends this task, its project context, and the attachments you select. It may incur provider charges. Assembling from the task does not call a provider.
      </p>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => {
            const on = selected.includes(att.id);
            return (
              <button
                key={att.id}
                type="button"
                onClick={() => setSelected((curr) => (curr.includes(att.id) ? curr.filter((id) => id !== att.id) : [...curr, att.id]))}
                className={`text-[12px] px-2 py-1 rounded-md border ${on ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}
              >
                {on ? 'Included' : 'Include'} {att.kind}
              </button>
            );
          })}
        </div>
      )}
      {visionNote ? <p className="text-[12px] text-[var(--danger-text)]">{visionNote}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => generate(true)}>
          Assemble from task
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={() => generate(false)}>
          Generate with AI
        </Button>
      </div>
      <textarea
        rows={10}
        value={shown}
        onChange={(e) => {
          setDraft(e.target.value);
          if (!activeId && prompts[0]) setActiveId(prompts[0].id);
        }}
        className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[13px] text-[var(--foreground)]"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={async () => {
            const id = activeId || prompts[0]?.id;
            if (!id) return;
            await api.ai.updatePrompt(id, shown);
            success('Saved', 'Manual edits are kept until you confirm a regenerate.');
            queryClient.invalidateQueries({ queryKey: ['solution-prompts', taskId] });
          }}
        >
          Save edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(shown);
            success('Copied', 'Paste this into your coding agent.');
          }}
        >
          Copy
        </Button>
      </div>
      {prompts.length > 0 && (
        <div className="space-y-1">
          <div className="text-[12px] text-[var(--muted-foreground)]">History</div>
          {prompts.map((p: any) => (
            <button
              key={p.id}
              type="button"
              className="block text-left text-[12px] text-[var(--foreground)] underline"
              onClick={() => {
                setActiveId(p.id);
                setDraft(p.promptMarkdown);
              }}
            >
              {new Date(p.createdAt).toLocaleString()} · {p.provider || 'saved'} {p.model || ''} {p.isUserEdited ? '· edited' : ''}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
