import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Bug, StickyNote } from 'lucide-react';

export type CreateType = 'task' | 'bug' | 'sticky';

export function CreateModal({
  open,
  onClose,
  initialType = 'task',
}: {
  open: boolean;
  onClose: () => void;
  initialType?: CreateType;
}) {
  const { activeProject, projects } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [type, setType] = useState<CreateType>(initialType);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [severity, setSeverity] = useState('MAJOR');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setType(initialType);
    if (activeProject?.id && !selectedProjectId) {
      setSelectedProjectId(activeProject.id);
    }
  }, [initialType, activeProject]);

  const pId = selectedProjectId || activeProject?.id || projects[0]?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!pId) {
      error('No project available', 'Please select or create a project first.');
      return;
    }

    try {
      setLoading(true);
      if (type === 'task') {
        await api.tasks.create(pId, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
        });
        success('Task created', title.trim());
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else if (type === 'bug') {
        await api.bugs.create(pId, {
          title: title.trim(),
          description: description.trim() || undefined,
          severity,
        });
        success('Bug reported', title.trim());
        queryClient.invalidateQueries({ queryKey: ['bugs'] });
      } else {
        await api.stickies.create(pId, {
          body: title.trim(),
          isPinned,
        });
        success('Sticky note added', title.trim().slice(0, 30));
        queryClient.invalidateQueries({ queryKey: ['stickies'] });
      }

      // Reset and close
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      error('Failed to create item', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === 'task' ? 'New task' : type === 'bug' ? 'Report a bug' : 'New sticky note'}
      description="Created items sync instantly to your mobile app and teammates."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="flex rounded-lg bg-[var(--muted)] p-1">
          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
              type === 'task'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setType('bug')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
              type === 'bug'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Bug</span>
          </button>
          <button
            type="button"
            onClick={() => setType('sticky')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
              type === 'sticky'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Sticky</span>
          </button>
        </div>

        {/* Project Selector if multiple */}
        {projects.length > 1 && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">
              Project
            </label>
            <select
              value={pId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title / Content */}
        <Input
          label={type === 'sticky' ? 'Note text' : 'Title'}
          placeholder={
            type === 'task'
              ? 'e.g. Redesign navigation bar'
              : type === 'bug'
                ? 'e.g. Crash when rotating device'
                : 'Write your thoughts here…'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />

        {/* Description for Task and Bug */}
        {type !== 'sticky' && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">
              Description (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add details, reproduction steps, or context…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>
        )}

        {/* Priority for Task */}
        {type === 'task' && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="NONE">No priority</option>
            </select>
          </div>
        )}

        {/* Severity for Bug */}
        {type === 'bug' && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
              <option value="TRIVIAL">Trivial</option>
            </select>
          </div>
        )}

        {/* Sticky Pin */}
        {type === 'sticky' && (
          <label className="flex items-center gap-2 text-[13px] text-[var(--foreground)] cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <span>Pin sticky to top of board</span>
          </label>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            <span>{type === 'task' ? 'Create task' : type === 'bug' ? 'Submit report' : 'Save note'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
