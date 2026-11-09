import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Image as ImageIcon,
  Bot,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Chip } from '../../../components/ui';
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
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const load = async () => {
    try {
      const res = await http.get<{ prompts: PromptRow[] }>(`/tasks/${taskId}/solution-prompts`);
      const list = res?.prompts || [];
      setPrompts(list);
      if (list[0]) {
        setActiveId(list[0].id);
        setDraft(list[0].promptMarkdown);
        setSelected(list[0].selectedAttachmentIds || []);
      }
    } catch {
      // handled
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
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
      setCollapsed(false);
      await load();
    } catch (err: any) {
      if (String(err?.message || '').toLowerCase().includes('edited')) {
        Alert.alert(
          'Replace edited prompt?',
          'Regenerating creates a new version and keeps the previous one in history.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Regenerate', onPress: () => generate(useTemplate, true) },
          ]
        );
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
      Alert.alert('Saved', 'Prompt updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save the prompt.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    await Clipboard.setStringAsync(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const active = prompts.find((p) => p.id === activeId);
  const hasPrompt = Boolean(draft && draft.trim().length > 0);
  const isDirty = active ? draft !== active.promptMarkdown : false;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
          marginTop: spacing.md,
        },
      ]}
    >
      {/* Header bar */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setCollapsed(!collapsed)}
        style={styles.headerRow}
      >
        <View style={styles.titleWrap}>
          <View style={[styles.iconPill, { backgroundColor: colors.accentSoft || colors.surface2 }]}>
            <Sparkles size={14} color={colors.accent} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text variant="caption" style={styles.sectionTitle}>
              SOLUTION PROMPT
            </Text>
            {hasPrompt && active ? (
              <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                {active.provider || 'saved'} {active.model ? `· ${active.model}` : ''}
              </Text>
            ) : (
              <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                Coding agent instructions
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {hasPrompt && (
            <View style={[styles.badge, { backgroundColor: colors.surface2 }]}>
              <Text variant="caption" color="secondary" style={{ fontSize: 10, fontWeight: '700' }}>
                READY
              </Text>
            </View>
          )}
          {collapsed ? (
            <ChevronDown size={16} color={colors.textSecondary} />
          ) : (
            <ChevronUp size={16} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Body content */}
      {!collapsed && (
        <View style={[styles.body, { borderTopColor: colors.hairline }]}>
          {/* Attachment inclusion row if any attachments exist */}
          {attachments.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text variant="caption" color="secondary" style={{ fontSize: 11, marginBottom: 6 }}>
                Include attachments in prompt context:
              </Text>
              <View style={styles.attachmentChipRow}>
                {attachments.map((att) => {
                  const on = selected.includes(att.id);
                  return (
                    <TouchableOpacity
                      key={att.id}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelected((curr) =>
                          curr.includes(att.id)
                            ? curr.filter((id) => id !== att.id)
                            : [...curr, att.id]
                        )
                      }
                      style={[
                        styles.attachmentChip,
                        {
                          backgroundColor: on ? colors.accent : colors.surface2,
                          borderColor: on ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <ImageIcon
                        size={11}
                        color={on ? colors.accentOnPrimary : colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        variant="caption"
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: on ? colors.accentOnPrimary : colors.textSecondary,
                        }}
                      >
                        {att.kind || 'Image'}
                      </Text>
                      {on && (
                        <Check
                          size={11}
                          color={colors.accentOnPrimary}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Warnings & Errors */}
          {visionNote ? (
            <View style={[styles.callout, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '40' }]}>
              <Text variant="caption" color="warning" style={{ fontSize: 11 }}>
                {visionNote}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.callout, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}>
              <Text variant="caption" color="danger" style={{ fontSize: 11 }}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Action buttons (Assemble & Generate) */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => generate(true)}
              disabled={busy}
              style={[
                styles.smallActionBtn,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                },
              ]}
            >
              <Sparkles size={12} color={colors.accent} style={{ marginRight: 5 }} />
              <Text variant="caption" style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 12 }}>
                Assemble Context
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => generate(false)}
              disabled={busy}
              style={[
                styles.smallActionBtn,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Bot size={12} color={colors.accentOnPrimary} style={{ marginRight: 5 }} />
              <Text variant="caption" style={{ fontWeight: '700', color: colors.accentOnPrimary, fontSize: 12 }}>
                {hasPrompt ? 'Regenerate with AI' : 'Generate with AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {busy && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                Generating solution prompt…
              </Text>
            </View>
          )}

          {/* Prompt Content area - ONLY rendered if prompt exists */}
          {hasPrompt ? (
            <View style={{ marginTop: 10 }}>
              <View
                style={[
                  styles.editorWrap,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                  },
                ]}
              >
                <TextInput
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Solution instructions…"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Utility buttons row */}
              <View style={styles.footerRow}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCopy}
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor: copied ? colors.success + '20' : colors.surface2,
                        borderColor: copied ? colors.success : colors.border,
                      },
                    ]}
                  >
                    {copied ? (
                      <Check size={12} color={colors.success} style={{ marginRight: 4 }} />
                    ) : (
                      <Copy size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    )}
                    <Text
                      variant="caption"
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: copied ? colors.success : colors.textPrimary,
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  {isDirty && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={save}
                      disabled={busy}
                      style={[
                        styles.iconBtn,
                        {
                          backgroundColor: colors.surface2,
                          borderColor: colors.accent,
                        },
                      ]}
                    >
                      <Save size={12} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text variant="caption" style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>
                        Save Edits
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {active && (
                  <Text variant="caption" color="tertiary" style={{ fontSize: 10 }}>
                    {active.isUserEdited ? 'Edited' : 'Auto'} · {new Date(active.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>

              {/* History pill row */}
              {prompts.length > 1 && (
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="caption" color="tertiary" style={{ fontSize: 10, marginRight: 2 }}>
                    History:
                  </Text>
                  {prompts.slice(0, 3).map((p, idx) => (
                    <TouchableOpacity
                      key={p.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        setActiveId(p.id);
                        setDraft(p.promptMarkdown);
                      }}
                      style={[
                        styles.historyChip,
                        {
                          backgroundColor: p.id === activeId ? colors.accentSoft : colors.surface2,
                          borderColor: p.id === activeId ? colors.accent : colors.hairline,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        style={{
                          fontSize: 10,
                          fontWeight: p.id === activeId ? '700' : '500',
                          color: p.id === activeId ? colors.accentText : colors.textSecondary,
                        }}
                      >
                        v{prompts.length - idx}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {/* Helper note */}
          {!hasPrompt && (
            <Text variant="caption" color="tertiary" style={styles.helperText}>
              Assembles project context, issue details, and selected attachments into instructions for agentic coding tools.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  attachmentChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  callout: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  editorWrap: {
    borderWidth: 1,
    padding: 8,
  },
  textInput: {
    minHeight: 80,
    maxHeight: 180,
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  historyChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
});
