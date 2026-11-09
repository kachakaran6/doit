import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShadcnSelect } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Sparkles, Bot, ExternalLink, Check, ShieldCheck } from 'lucide-react';

const OPENROUTER_MODEL_OPTIONS = [
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Recommended)' },
  { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Fast & Light)' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (High intelligence)' },
  { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Advanced reasoning)' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Fast & multimodal)' },
  { value: 'google/gemini-pro-1.5', label: 'Gemini 1.5 Pro (2M context)' },
  { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (Open weights)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (OpenRouter)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (OpenRouter)' },
  { value: 'qwen/qwen-2.5-coder-32b-instruct', label: 'Qwen 2.5 Coder 32B (Code focused)' },
  { value: '__custom__', label: 'Custom OpenRouter Model ID…' },
];

const OPENAI_MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & economical)' },
  { value: 'gpt-4o', label: 'GPT-4o (Flagship multimodal)' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
];

export function AiProviderSettings() {
  const { success, error } = useToast();
  const [provider, setProvider] = useState<'openrouter' | 'openai'>('openrouter');
  const [model, setModel] = useState<string>('anthropic/claude-3.5-sonnet');
  const [customModel, setCustomModel] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => api.ai.list(),
  });

  // Find credential for currently selected provider
  const currentCred = data?.credentials?.find(
    (c: any) => c.provider?.toLowerCase() === provider.toLowerCase()
  );

  useEffect(() => {
    if (currentCred) {
      const isKnown =
        provider === 'openrouter'
          ? OPENROUTER_MODEL_OPTIONS.some((o) => o.value === currentCred.model)
          : OPENAI_MODEL_OPTIONS.some((o) => o.value === currentCred.model);

      if (isKnown) {
        setModel(currentCred.model);
        setCustomModel('');
      } else if (provider === 'openrouter') {
        setModel('__custom__');
        setCustomModel(currentCred.model);
      } else {
        setModel(currentCred.model);
      }
      setEnabled(currentCred.enabled);
    } else {
      setModel(
        provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o-mini'
      );
      setCustomModel('');
      setEnabled(true);
    }
  }, [provider, currentCred]);

  const effectiveModel = model === '__custom__' ? customModel.trim() : model;

  const handleSave = async () => {
    if (!effectiveModel) {
      error('Model required', 'Please select or enter an AI model name.');
      return;
    }
    try {
      setSaving(true);
      await api.ai.save(effectiveModel, apiKey.trim() || undefined, enabled, provider);
      setApiKey('');
      await refetch();
      success('Provider saved', `${provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'} credentials updated.`);
    } catch (err: any) {
      error('Could not save provider', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await api.ai.test(provider);
      await refetch();
      success('Connected successfully', `${provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'} API key verified.`);
    } catch (err: any) {
      error('Connection test failed', err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = async () => {
    try {
      await api.ai.remove(provider);
      await refetch();
      setApiKey('');
      success('Removed', `${provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'} key removed.`);
    } catch (err: any) {
      error('Could not remove provider', err.message);
    }
  };

  const modelOptions = provider === 'openrouter' ? OPENROUTER_MODEL_OPTIONS : OPENAI_MODEL_OPTIONS;

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[var(--primary)]" />
              <span>AI Provider Configuration</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Configure personal AI credentials for instant task solution analysis, prompt synthesis, and vision debugging.
            </CardDescription>
          </div>

          {/* Provider Pill Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setProvider('openrouter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                provider === 'openrouter'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>OpenRouter</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-semibold">
                Popular
              </span>
            </button>
            <button
              type="button"
              onClick={() => setProvider('openai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                provider === 'openai'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <span>OpenAI</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-w-xl">
        {/* Provider Banner */}
        {provider === 'openrouter' ? (
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[12px] text-[var(--muted-foreground)] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--foreground)]">OpenRouter Unified API: </span>
              Access Claude 3.5 Sonnet, DeepSeek V3/R1, Gemini 2.0 Flash, Llama 3.3, and 200+ models with a single API key.
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--primary)] font-medium ml-1.5 hover:underline"
              >
                <span>Get an OpenRouter key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[12px] text-[var(--muted-foreground)] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--foreground)]">Direct OpenAI API: </span>
              Connect directly with your official OpenAI API key for GPT-4o and GPT-4.1.
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--primary)] font-medium ml-1.5 hover:underline"
              >
                <span>Get an OpenAI key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Status of saved key */}
        <div className="text-[12px] text-[var(--muted-foreground)]">
          {currentCred ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--success-text)]/10 text-[var(--success-text)] font-medium">
              <Check className="w-3 h-3" />
              <span>
                Saved key: ••••{currentCred.keyHint} · {currentCred.status}
              </span>
            </span>
          ) : (
            <span>No personal key saved for {provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'}.</span>
          )}
        </div>

        {/* API Key Input */}
        <Input
          label={`${provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'} API Key`}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            currentCred
              ? '•••••••••••••••••••••••• (Leave blank to keep saved key)'
              : provider === 'openrouter'
                ? 'sk-or-v1-...'
                : 'sk-proj-...'
          }
        />

        {/* Model Selection with ShadcnSelect */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-[var(--foreground)]">
            AI Model
          </label>
          <ShadcnSelect
            value={model}
            onChange={(val) => setModel(val)}
            options={modelOptions}
            placeholder="Select model…"
          />
        </div>

        {/* Custom Model input if custom option selected */}
        {model === '__custom__' && provider === 'openrouter' && (
          <div className="space-y-1 animate-in fade-in-50 duration-150">
            <Input
              label="Custom OpenRouter Model Identifier"
              placeholder="e.g. mistralai/mistral-large-2407 or x-ai/grok-beta"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              helperText="Enter any model identifier available in the openrouter.ai/models directory."
            />
          </div>
        )}

        {/* Enabled Checkbox */}
        <label className="flex items-center gap-2.5 text-[13px] text-[var(--foreground)] cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-[var(--border)] accent-[var(--primary)]"
          />
          <span>Enable this provider for prompt generation</span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save configuration
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTest}
            loading={testing}
            disabled={!currentCred && !apiKey.trim()}
          >
            Test connection
          </Button>
          {currentCred && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="text-[var(--danger-text)] hover:bg-[var(--danger-surface)]"
            >
              Remove
            </Button>
          )}
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    setDefaultProjectId(prefs.defaultProjectId || '');
    setDefaultLabelIds(prefs.defaultLabelIds || []);
    setRememberLastProject(prefs.rememberLastProject);
    setShowProjectSelector(prefs.showProjectSelector);
    setLabelsExpanded(prefs.labelsExpanded);
  }, [prefs]);

  const projectOptions = [
    { value: '', label: 'None (Ask each time)' },
    ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.key})` })),
  ];

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>Quick capture defaults</CardTitle>
        <CardDescription>Configure task capture defaults for {activeWorkspace?.name || 'this workspace'}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        {/* Default Project using ShadcnSelect */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-[var(--foreground)]">
            Default project
          </label>
          <ShadcnSelect
            value={defaultProjectId}
            onChange={(val) => setDefaultProjectId(val)}
            options={projectOptions}
            placeholder="Select default project…"
          />
        </div>

        {/* Labels Multi-select */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-[var(--foreground)]">
            Default labels
          </label>
          <div className="flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <span className="text-[12px] text-[var(--muted-foreground)]">No labels defined in this workspace.</span>
            ) : (
              labels.map((label) => {
                const on = defaultLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() =>
                      setDefaultLabelIds((curr) =>
                        curr.includes(label.id) ? curr.filter((id) => id !== label.id) : [...curr, label.id]
                      )
                    }
                    className={`text-[12px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      on
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-text)] font-semibold'
                        : 'border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {label.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1 text-[13px]">
          <label className="flex items-center gap-2.5 text-[var(--foreground)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberLastProject}
              onChange={(e) => setRememberLastProject(e.target.checked)}
              className="rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <span>Remember last selected project</span>
          </label>
          <label className="flex items-center gap-2.5 text-[var(--foreground)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showProjectSelector}
              onChange={(e) => setShowProjectSelector(e.target.checked)}
              className="rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <span>Show project selector in quick capture modal</span>
          </label>
          <label className="flex items-center gap-2.5 text-[var(--foreground)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={labelsExpanded}
              onChange={(e) => setLabelsExpanded(e.target.checked)}
              className="rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <span>Expand labels by default</span>
          </label>
        </div>

        <div className="pt-2">
          <Button
            size="sm"
            loading={saving}
            onClick={async () => {
              if (!workspaceId) return;
              try {
                setSaving(true);
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
              } finally {
                setSaving(false);
              }
            }}
          >
            Save defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
