import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];

export function AiProviderSettings() {
  const { success, error } = useToast();
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const { data, refetch } = useQuery({ queryKey: ['ai-providers'], queryFn: () => api.ai.list() });
  const row = data?.credentials?.[0];

  useEffect(() => {
    if (row?.model) setModel(row.model);
    if (row) setEnabled(row.enabled);
  }, [row?.model, row?.enabled]);

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>AI provider</CardTitle>
        <CardDescription>{data?.notice}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[13px] text-[var(--muted-foreground)]">
          {row ? `Saved key ••••${row.keyHint} · ${row.status}` : 'No personal key saved.'}
        </p>
        <Input label="API key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={row ? 'Leave blank to keep the saved key' : 'sk-...'} />
        <label className="block text-[13px] font-medium">Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 text-[13px]">
          {MODELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled
        </label>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              try {
                await api.ai.save(model, apiKey.trim() || undefined, enabled);
                setApiKey('');
                await refetch();
                success('Saved', 'The key is stored encrypted and is not returned.');
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
                await api.ai.test();
                await refetch();
                success('Connected', 'The provider accepted this key.');
              } catch (err: any) {
                error('Test failed', err.message);
              }
            }}
          >
            Test connection
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await api.ai.remove();
              await refetch();
            }}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickCaptureSettings() {
  const { activeWorkspace, projects } = useWorkspaceStore();
  const { success, error } = useToast();
  const workspaceId = activeWorkspace?.id;
  const { data: labels = [] } = useQuery({
    queryKey: ['labels', workspaceId],
    queryFn: () => (workspaceId ? api.workspaces.labels(workspaceId) : []),
    enabled: Boolean(workspaceId),
  });
  const { data: prefs } = useQuery({
    queryKey: ['quick-capture', workspaceId],
    queryFn: () => api.quickCapture.get(workspaceId!),
    enabled: Boolean(workspaceId),
  });
  const [defaultProjectId, setDefaultProjectId] = useState<string>('');
  const [defaultLabelIds, setDefaultLabelIds] = useState<string[]>([]);
  const [rememberLastProject, setRememberLastProject] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    setDefaultProjectId(prefs.defaultProjectId || '');
    setDefaultLabelIds(prefs.defaultLabelIds || []);
    setRememberLastProject(prefs.rememberLastProject);
    setShowProjectSelector(prefs.showProjectSelector);
    setLabelsExpanded(prefs.labelsExpanded);
  }, [prefs]);

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>Quick capture</CardTitle>
        <CardDescription>Defaults stay inside {activeWorkspace?.name || 'this workspace'}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block text-[13px] font-medium">Default project</label>
        <select value={defaultProjectId} onChange={(e) => setDefaultProjectId(e.target.value)} className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 text-[13px]">
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => {
            const on = defaultLabelIds.includes(label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => setDefaultLabelIds((curr) => (curr.includes(label.id) ? curr.filter((id) => id !== label.id) : [...curr, label.id]))}
                className={`text-[12px] px-2 py-1 rounded-md border ${on ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}
              >
                {label.name}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={rememberLastProject} onChange={(e) => setRememberLastProject(e.target.checked)} /> Remember last project</label>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={showProjectSelector} onChange={(e) => setShowProjectSelector(e.target.checked)} /> Show project selector</label>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={labelsExpanded} onChange={(e) => setLabelsExpanded(e.target.checked)} /> Expand labels by default</label>
        <Button
          size="sm"
          onClick={async () => {
            if (!workspaceId) return;
            try {
              await api.quickCapture.save({
                workspaceId,
                defaultProjectId: defaultProjectId || null,
                defaultLabelIds,
                rememberLastProject,
                showProjectSelector,
                labelsExpanded,
              });
              success('Saved', 'Quick capture defaults updated.');
            } catch (err: any) {
              error('Could not save', err.message);
            }
          }}
        >
          Save defaults
        </Button>
      </CardContent>
    </Card>
  );
}
