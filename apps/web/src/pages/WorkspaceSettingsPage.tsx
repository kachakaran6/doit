import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

const COLORS = ['INDIGO', 'TEAL', 'AMBER', 'ROSE', 'VIOLET'];

export function WorkspaceSettingsPage() {
  const { activeWorkspace, loadWorkspaces, labels, loadLabels } = useWorkspaceStore();
  const { success, error } = useToast();
  const [tab, setTab] = useState<'general' | 'labels' | 'about' | 'roles'>('general');
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('INDIGO');
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => api.system.health(),
    enabled: tab === 'about',
  });

  useEffect(() => {
    setName(activeWorkspace?.name || '');
  }, [activeWorkspace?.id, activeWorkspace?.name]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Workspace settings</h1>
      <div className="flex gap-4 border-b border-[var(--border)] text-[13px]">
        {(['general', 'labels', 'roles', 'about'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`pb-2 border-b-2 ${tab === id ? 'border-[var(--primary)] font-semibold' : 'border-transparent text-[var(--muted-foreground)]'}`}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'general' && activeWorkspace ? (
        <form
          className="space-y-3 max-w-md"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.workspaces.update(activeWorkspace.id, { name });
              await loadWorkspaces();
              success('Workspace updated', name);
            } catch (err: any) {
              error('Could not update workspace', err.message);
            }
          }}
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-[12px] text-[var(--muted-foreground)]">Slug: {activeWorkspace.slug}</p>
          <Button size="sm" type="submit">Save</Button>
        </form>
      ) : null}

      {tab === 'labels' && activeWorkspace ? (
        <div className="space-y-3 max-w-lg">
          <form
            className="flex flex-wrap gap-2 items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.workspaces.createLabel(activeWorkspace.id, { name: labelName.trim(), color: labelColor });
                setLabelName('');
                await loadLabels(activeWorkspace.id);
                success('Label created', labelName);
              } catch (err: any) {
                error('Could not create label', err.message);
              }
            }}
          >
            <Input label="Name" value={labelName} onChange={(e) => setLabelName(e.target.value)} required />
            <select value={labelColor} onChange={(e) => setLabelColor(e.target.value)} className="h-9 rounded-lg border border-[var(--input)] bg-[var(--card)] px-2 text-[13px]">
              {COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
            </select>
            <Button size="sm" type="submit">Add label</Button>
          </form>
          <ul className="space-y-2">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-[13px]">
                <span>{label.name} · {label.color}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await api.workspaces.deleteLabel(label.id);
                      await loadLabels(activeWorkspace.id);
                    } catch (err: any) {
                      error('Could not delete label', err.message);
                    }
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === 'roles' ? (
        <table className="text-[13px] w-full max-w-xl">
          <thead>
            <tr className="text-left text-[var(--muted-foreground)]">
              <th className="py-1">Action</th><th>Owner</th><th>Admin</th><th>Member</th><th>Viewer</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Manage workspace', 'Yes', 'Yes', 'No', 'No'],
              ['Invite people', 'Yes', 'Yes', 'No', 'No'],
              ['Create projects', 'Yes', 'Yes', 'Yes', 'No'],
              ['Edit tasks', 'Yes', 'Yes', 'Yes', 'No'],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-[var(--border)]">
                {row.map((cell) => <td key={cell} className="py-1.5 pr-3">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === 'about' ? (
        <div className="text-[13px] space-y-1">
          <p>API: {health.isLoading ? 'Checking…' : health.isError ? 'Unavailable' : 'Reachable'}</p>
          <p className="text-[var(--muted-foreground)]">This status is for workspace owners and admins. It replaces the overview system card.</p>
        </div>
      ) : null}
    </div>
  );
}
