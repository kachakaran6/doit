import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShadcnSelect } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Bug, StickyNote, User, Folder } from 'lucide-react';

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
  const { activeProject, projects, activeWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [type, setType] = useState<CreateType>(initialType);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [severity, setSeverity] = useState('MAJOR');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [labelQuery, setLabelQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const pId = selectedProjectId || activeProject?.id || projects[0]?.id;

  const { data: projectMembersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['project-members', pId],
    queryFn: () => (pId ? api.projects.members(pId) : null),
    enabled: open && Boolean(pId) && type !== 'sticky',
  });

  // Whenever project members data updates or project changes, auto-select default assignee
  React.useEffect(() => {
    if (projectMembersData?.defaultAssigneeId) {
      setSelectedAssigneeId(projectMembersData.defaultAssigneeId);
    } else {
      setSelectedAssigneeId('');
    }
  }, [pId, projectMembersData?.defaultAssigneeId]);

  const { data: labels = [] } = useQuery({
    queryKey: ['labels', activeWorkspace?.id],
    queryFn: () => (activeWorkspace?.id ? api.workspaces.labels(activeWorkspace.id) : []),
    enabled: open && Boolean(activeWorkspace?.id),
  });

  React.useEffect(() => {
    setType(initialType);
    if (!open || !activeWorkspace?.id) return;
    api.quickCapture
      .get(activeWorkspace.id)
      .then((prefs) => {
        const allowed = new Set(projects.map((p) => p.id));
        const preferred = prefs?.rememberLastProject ? prefs.lastProjectId || prefs.defaultProjectId : prefs?.defaultProjectId;
        if (preferred && allowed.has(preferred)) setSelectedProjectId(preferred);
        else if (activeProject?.id) setSelectedProjectId(activeProject.id);
        if (Array.isArray(prefs?.defaultLabelIds)) {
          const known = new Set(labels.map((l) => l.id));
          setSelectedLabelIds(prefs.defaultLabelIds.filter((id: string) => known.size === 0 || known.has(id)));
        }
      })
      .catch(() => {
        if (activeProject?.id) setSelectedProjectId(activeProject.id);
      });
  }, [initialType, activeProject, open, activeWorkspace?.id]);

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
          labelIds: selectedLabelIds,
          assigneeId: selectedAssigneeId || undefined,
        });
        success('Task created', title.trim());
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else if (type === 'bug') {
        await api.bugs.create(pId, {
          title: title.trim(),
          description: description.trim() || undefined,
          severity,
          labelIds: selectedLabelIds,
          assigneeId: selectedAssigneeId || undefined,
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

        {type !== 'sticky' && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">Labels</label>
            <input
              value={labelQuery}
              onChange={(e) => setLabelQuery(e.target.value)}
              placeholder="Search labels"
              className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 text-[13px]"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {labels.filter((l) => l.name.toLowerCase().includes(labelQuery.trim().toLowerCase())).map((label) => {
                const on = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => setSelectedLabelIds((curr) => (curr.includes(label.id) ? curr.filter((id) => id !== label.id) : [...curr, label.id]))}
                    className={`text-[12px] px-2 py-1 rounded-md border ${on ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}
                  >
                    {label.name}
                  </button>
                );
              })}
              {labels.length === 0 ? <span className="text-[12px] text-[var(--muted-foreground)]">No labels in this workspace.</span> : null}
            </div>
          </div>
        )}

        {/* Project & Assignee Selectors */}
        {type !== 'sticky' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Project Selection (Mandatory) */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--foreground)]">
                <Folder className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span>Project <span className="text-[var(--destructive)]">*</span></span>
              </label>
              <ShadcnSelect
                value={pId || ''}
                onChange={(val) => {
                  setSelectedProjectId(val);
                  setSelectedAssigneeId('');
                }}
                options={projects.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.key})`,
                }))}
              />
            </div>

            {/* Assignee Selection (Mandatory) */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--foreground)]">
                <User className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span>Assignee <span className="text-[var(--destructive)]">*</span></span>
                {projectMembersData?.defaultAssigneeId && selectedAssigneeId === projectMembersData.defaultAssigneeId && (
                  <span className="text-[10px] font-semibold text-[var(--primary)] bg-[var(--primary-soft)] px-1.5 py-0.5 rounded-full ml-auto">
                    Default
                  </span>
                )}
              </label>
              <ShadcnSelect
                value={selectedAssigneeId || 'unassigned'}
                onChange={(val) => setSelectedAssigneeId(val === 'unassigned' ? '' : val)}
                options={[
                  { value: 'unassigned', label: loadingMembers ? 'Loading assignees...' : 'Select Assignee' },
                  ...(projectMembersData?.members || []).map((m) => ({
                    value: m.id,
                    label: `${m.name}${m.id === projectMembersData?.defaultAssigneeId ? ' (Default)' : ''}`,
                  })),
                ]}
              />
            </div>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--foreground)]">
              <Folder className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span>Project</span>
            </label>
            <ShadcnSelect
              value={pId || ''}
              onChange={setSelectedProjectId}
              options={projects.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.key})`,
              }))}
            />
          </div>
        ) : null}

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
            <ShadcnSelect
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'URGENT', label: 'Urgent' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
                { value: 'NONE', label: 'No priority' },
              ]}
            />
          </div>
        )}

        {/* Severity for Bug */}
        {type === 'bug' && (
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[var(--foreground)]">
              Severity
            </label>
            <ShadcnSelect
              value={severity}
              onChange={setSeverity}
              options={[
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'MAJOR', label: 'Major' },
                { value: 'MINOR', label: 'Minor' },
                { value: 'TRIVIAL', label: 'Trivial' },
              ]}
            />
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
          <Button
            type="submit"
            size="sm"
            loading={loading}
            disabled={loading || !title.trim() || !pId}
          >
            <span>{type === 'task' ? 'Create task' : type === 'bug' ? 'Submit report' : 'Save note'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
