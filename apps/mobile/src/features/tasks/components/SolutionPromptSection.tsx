import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Sparkles, Copy, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button } from '../../../components/ui';
import { http } from '../../../lib/http';

interface PromptRow {
  id: string;
  promptMarkdown: string;
  generationStatus: string;
  provider?: string | null;
  model?: string | null;
  isUserEdited: boolean;
  createdAt: string;
  selectedAttachmentIds?: string[];
  visionWarning?: string | null;
}

export const SolutionPromptSection: React.FC<{
  taskId: string;
  attachments?: { id: string; kind?: string; mimeType?: string }[];
}> = ({ taskId, attachments = [] }) => {
  const { colors, spacing, radius } = useTheme();
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visionNote, setVisionNote] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const res = await http.get<{ prompts: PromptRow[] }>(`/tasks/${taskId}/solution-prompts`);
    const list = res?.prompts || [];
    setPrompts(list);
    if (list[0]) {
      setActiveId(list[0].id);
      setDraft(list[0].promptMarkdown);
      setSelected(list[0].selectedAttachmentIds || []);
    }
    setLoaded(true);
  };

  React.useEffect(() => {
    load().catch(() => setLoaded(true));
  }, [taskId]);

  const generate = async (useTemplate: boolean, force = false) => {
    try {
      setBusy(true);
      setError(null);
      const created = await http.post<PromptRow>(`/tasks/${taskId}/solution-prompts/generate`, {
        selectedAttachmentIds: selected,
        useTemplate,
        force,
      });
      setActiveId(created.id);
      setDraft(created.promptMarkdown);
      setVisionNote(created.visionWarning || null);
      await load();
    } catch (err: any) {
      if (String(err?.message || '').toLowerCase().includes('edited')) {
        Alert.alert('Replace edited prompt?', 'Regenerating creates a new version and keeps the previous one in history.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Regenerate', onPress: () => generate(useTemplate, true) },
        ]);
        return;
      }
      setError(err?.message || 'Could not generate a prompt.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!activeId) return;
    try {
      setBusy(true);
      await http.patch(`/solution-prompts/${activeId}`, { promptMarkdown: draft });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not save the prompt.');
    } finally {
      setBusy(false);
    }
  };

  const active = prompts.find((p) => p.id === activeId);

  return (
    <View style={{ marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface1 }}>
      <Text variant="label">Solution prompt</Text>
      <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
        Copy-ready instructions for a coding agent. AI generation sends this task, project context, and selected images to your provider and may incur charges.
      </Text>
      {attachments.map((att) => {
        const on = selected.includes(att.id);
        return (
          <Button
            key={att.id}
            title={`${on ? 'Included' : 'Include'} ${att.kind || 'file'}`}
            variant={on ? 'primary' : 'secondary'}
            onPress={() => setSelected((curr) => (curr.includes(att.id) ? curr.filter((id) => id !== att.id) : [...curr, att.id]))}
            style={{ marginTop: 8 }}
          />
        );
      })}
      {visionNote ? <Text variant="caption" color="warning" style={{ marginTop: 8 }}>{visionNote}</Text> : null}
      {error ? <Text variant="caption" color="danger" style={{ marginTop: 8 }}>{error}</Text> : null}
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} /> : null}
      <View style={{ gap: 8, marginTop: 12 }}>
        <Button title="Assemble from task" variant="secondary" icon={<Sparkles size={16} color={colors.accent} />} onPress={() => generate(true)} />
        <Button title="Generate with AI" variant="primary" onPress={() => generate(false)} />
      </View>
      <TextInput
        multiline
        value={draft}
        onChangeText={setDraft}
        placeholder={loaded ? 'No prompt yet.' : 'Loading prompts…'}
        placeholderTextColor={colors.textMuted}
        style={{
          minHeight: 160,
          marginTop: 12,
          color: colors.textPrimary,
          textAlignVertical: 'top',
        }}
      />
      {active ? (
        <Text variant="caption" color="secondary" style={{ marginTop: 6 }}>
          {active.provider || 'saved'} {active.model || ''} · {active.isUserEdited ? 'edited' : active.generationStatus} · {new Date(active.createdAt).toLocaleString()}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Save" variant="secondary" onPress={save} />
        <Button
          title="Copy"
          variant="secondary"
          icon={<Copy size={16} color={colors.textSecondary} />}
          onPress={async () => {
            await Clipboard.setStringAsync(draft);
            Alert.alert('Copied', 'The solution prompt is on the clipboard.');
          }}
        />
        <Button
          title="Regenerate"
          variant="secondary"
          icon={<RefreshCw size={16} color={colors.textSecondary} />}
          onPress={() => generate(false)}
        />
      </View>
      {prompts.length > 1 ? (
        <View style={{ marginTop: 12 }}>
          <Text variant="caption" color="secondary">History</Text>
          {prompts.map((p) => (
            <Button
              key={p.id}
              title={`${new Date(p.createdAt).toLocaleString()} · ${p.provider || 'saved'}`}
              variant="secondary"
              onPress={() => {
                setActiveId(p.id);
                setDraft(p.promptMarkdown);
              }}
              style={{ marginTop: 6 }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};
