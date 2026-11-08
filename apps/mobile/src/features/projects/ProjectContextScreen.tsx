import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import { Screen, LargeHeader, Text, Button, Card, SearchInput } from '../../components/ui';
import { http } from '../../lib/http';
import { useWorkspaceStore } from '../workspace';
import { FileCode, Eye, Edit3, Sparkles, CheckCircle2 } from 'lucide-react-native';

export const ProjectContextScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing, radius } = useTheme();
  const project = useWorkspaceStore((s) => s.activeProject);
  const [markdown, setMarkdown] = useState('');
  const [saved, setSaved] = useState('');
  const [version, setVersion] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [starter, setStarter] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await http.get<any>(`/projects/${project.id}/context`);
      setMarkdown(res.markdown || '');
      setSaved(res.markdown || '');
      setVersion(res.version || 0);
      setUpdatedAt(res.updatedAt);
      setUpdatedBy(res.updatedBy?.name || null);
      setStarter(res.starter || '');
    } catch (err: any) {
      setError(err?.message || 'Could not load project context.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [project?.id]);

  const save = async () => {
    if (!project?.id) return;
    try {
      setError(null);
      const res = await http.put<any>(`/projects/${project.id}/context`, { markdown, version });
      setVersion(res.version);
      setSaved(res.markdown);
      setUpdatedAt(res.updatedAt);
      setUpdatedBy(res.updatedBy?.name || null);
      Alert.alert('Saved', 'Project context saved for AI prompt generation.');
    } catch (err: any) {
      setError(err?.message || 'Could not save context.');
    }
  };

  const isDirty = markdown !== saved;

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader title="Project Context" onBack={() => navigation.goBack()} />
      <View style={{ gap: spacing.md, paddingBottom: 48 }}>
        {/* Info Card */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <FileCode size={18} color={colors.accentText} />
            <Text variant="headline">{project?.name || 'Active Project'}</Text>
          </View>
          <Text variant="caption" color="secondary">
            Structured Markdown describing codebase architecture, conventions, and constraints. Used by the AI prompt builder to ground fixes.
          </Text>
          {updatedAt ? (
            <View style={{ marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.hairline }}>
              <Text variant="caption" color="secondary">
                v{version} · {markdown.length} chars · Updated {new Date(updatedAt).toLocaleDateString()}
                {updatedBy ? ` by ${updatedBy}` : ''}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Search bar */}
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search in context..."
          onClear={() => setQuery('')}
        />
        {query.trim() ? (
          <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
            {markdown.toLowerCase().split(query.trim().toLowerCase()).length - 1} match(es) found
          </Text>
        ) : null}

        {error ? (
          <View style={{ padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.danger + '18' }}>
            <Text variant="caption" color="danger">{error}</Text>
          </View>
        ) : null}

        {loading ? <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.md }} /> : null}

        {/* Action Row */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'space-between' }}>
          {!markdown && starter ? (
            <Button
              title="Insert Suggested Structure"
              variant="secondary"
              onPress={() => setMarkdown(starter)}
            />
          ) : <View />}

          <Button
            title={preview ? 'Edit Mode' : 'Preview Mode'}
            variant="secondary"
            onPress={() => setPreview((v) => !v)}
          />
        </View>

        {/* Visible Text Editor / Preview Card */}
        <View
          style={{
            backgroundColor: colors.surface2,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: spacing.md,
            minHeight: 300,
          }}
        >
          {preview ? (
            <Text variant="body" style={{ lineHeight: 22, color: colors.textPrimary }}>
              {markdown || 'Nothing to preview. Tap Edit Mode to add context.'}
            </Text>
          ) : (
            <TextInput
              multiline
              value={markdown}
              onChangeText={setMarkdown}
              placeholder="Purpose, stack, conventions, file paths, and architecture constraints..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                minHeight: 280,
                color: colors.textPrimary,
                textAlignVertical: 'top',
                fontSize: 14,
                lineHeight: 20,
              }}
            />
          )}
        </View>

        {/* Save Bar */}
        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          <Button
            title={isDirty ? 'Save Context Changes' : 'Saved'}
            variant="primary"
            onPress={save}
            disabled={!isDirty}
          />
          {isDirty ? (
            <Button
              title="Discard Unsaved Changes"
              variant="secondary"
              onPress={() => setMarkdown(saved)}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
};
