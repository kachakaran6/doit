import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { WorkspaceMember } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeWorkspace, loadProjects, setActiveProject } = useWorkspaceStore();
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<string>('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id || !open) return;
    api.workspaces
      .members(activeWorkspace.id)
      .then((m) => setMembers(m || []))
      .catch(() => setMembers([]));
  }, [activeWorkspace?.id, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) return;
    try {
      setLoading(true);
      const project = await api.projects.create(activeWorkspace.id, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        defaultAssigneeId: defaultAssigneeId || null,
      });
      await loadProjects(activeWorkspace.id);
      setActiveProject(project);
      success('Project created', project.name);
      setName('');
      setKey('');
      setDefaultAssigneeId('');
      onClose();
    } catch (err: any) {
      error('Could not create project', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New project" description="Projects stay inside the current workspace.">
      <form onSubmit={submit} className="space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        <Input
          label="Key"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          required
          minLength={2}
          maxLength={5}
          placeholder="GEN"
        />
        <div className="space-y-1">
          <label className="block text-[13px] font-medium text-[var(--foreground)]">
            Default Assignee (Optional)
          </label>
          <select
            value={defaultAssigneeId}
            onChange={(e) => setDefaultAssigneeId(e.target.value)}
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--foreground)]"
          >
            <option value="">No default assignee</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.name || m.user?.email || m.userId} ({m.role})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
