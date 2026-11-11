import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Project, WorkspaceMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewProjectDialog } from '@/components/layout/NewProjectDialog';

export function ProjectsPage() {
  const { activeWorkspace, projects, setActiveProject, loadProjects } = useWorkspaceStore();
  const { success, error } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultAssigneeId, setDefaultAssigneeId] = useState('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [confirmKey, setConfirmKey] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    api.workspaces
      .members(activeWorkspace.id)
      .then((m) => setMembers(m || []))
      .catch(() => setMembers([]));
  }, [activeWorkspace?.id]);

  const refresh = async () => {
    if (activeWorkspace?.id) await loadProjects(activeWorkspace.id);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const openSettings = (project: Project) => {
    setSelected(project);
    setName(project.name);
    setDescription(project.description || '');
    setDefaultAssigneeId(project.defaultAssigneeId || '');
    setConfirmKey('');
  };

  return (
    <PageContainer width="data" className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </span>
        <Button size="sm" onClick={() => setOpen(true)}>New project</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => {
              setActiveProject(project);
              openSettings(project);
            }}
            className="text-left rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--border-strong)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{project.name}</span>
              <span className="font-mono text-[12px] text-[var(--muted-foreground)]">{project.key}</span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--muted-foreground)] line-clamp-2">
              {project.description || 'No description'}
            </p>
            {project.defaultAssignee && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                <span>Default: <strong className="font-medium text-[var(--foreground)]">{project.defaultAssignee.name}</strong></span>
              </div>
            )}
          </button>
        ))}
        {projects.length === 0 ? (
          <p className="text-[13px] text-[var(--muted-foreground)]">No projects yet. Create the first one.</p>
        ) : null}
      </div>

      {selected ? (
        <section className="rounded-xl border border-[var(--border)] p-4 space-y-3 max-w-xl">
          <h2 className="font-semibold">Project settings · {selected.key}</h2>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="block text-[13px] font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-[13px]"
          />
          <div className="space-y-1">
            <label className="block text-[13px] font-medium">Default Assignee</label>
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
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const updated = await api.projects.update(selected.id, {
                    name,
                    description,
                    defaultAssigneeId: defaultAssigneeId || null,
                  });
                  success('Saved', updated.name);
                  await refresh();
                } catch (err: any) {
                  error('Could not save', err.message);
                }
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await api.projects.update(selected.id, { archived: !selected.isArchived });
                  success(selected.isArchived ? 'Restored' : 'Archived', selected.name);
                  await refresh();
                } catch (err: any) {
                  error('Could not update archive state', err.message);
                }
              }}
            >
              {selected.isArchived ? 'Unarchive' : 'Archive'}
            </Button>
          </div>
          <div className="border-t border-[var(--border)] pt-3 space-y-2">
            <p className="text-[12px] text-[var(--muted-foreground)]">
              Type {selected.key} to delete this project and its tasks.
            </p>
            <Input value={confirmKey} onChange={(e) => setConfirmKey(e.target.value)} placeholder={selected.key} />
            <Button
              size="sm"
              variant="danger"
              disabled={confirmKey !== selected.key}
              onClick={async () => {
                try {
                  await api.projects.delete(selected.id);
                  success('Deleted', selected.name);
                  setSelected(null);
                  await refresh();
                } catch (err: any) {
                  error('Could not delete', err.message);
                }
              }}
            >
              Delete project
            </Button>
          </div>
        </section>
      ) : null}
      <NewProjectDialog open={open} onClose={() => setOpen(false)} />
    </PageContainer>
  );
}
