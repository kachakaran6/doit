import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import { Screen, LargeHeader, Text, Button } from '../../components/ui';
import { http } from '../../lib/http';
import { useWorkspaceStore } from '../workspace';

export const ProjectContextScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing } = useTheme();
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
      Alert.alert('Saved', 'Project context is available to prompt generation.');
    } catch (err: any) {
      setError(err?.message || 'Could not save.');
    }
  };

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader title="Project context" onBack={() => navigation.goBack()} />
      <View style={{ gap: spacing.md, paddingBottom: 48 }}>
        <Text variant="caption" color="secondary">
          {project?.name || 'No project selected'}. This Markdown is sent to your AI provider only when you generate a solution prompt.
        </Text>
        {updatedAt ? (
          <Text variant="caption" color="secondary">
            Updated {new Date(updatedAt).toLocaleString()}{updatedBy ? ` by ${updatedBy}` : ''} · version {version} · {markdown.length} characters
          </Text>
        ) : null}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search in context"
          placeholderTextColor={colors.textMuted}
          style={{ minHeight: 40, color: colors.textPrimary }}
        />
        {query.trim() ? (
          <Text variant="caption" color="secondary">
            {markdown.toLowerCase().split(query.trim().toLowerCase()).length - 1} matches
          </Text>
        ) : null}
        {error ? <Text variant="caption" color="danger">{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {!markdown && starter ? (
          <Button title="Insert suggested structure" variant="secondary" onPress={() => setMarkdown(starter)} />
        ) : null}
        <Button title={preview ? 'Edit' : 'Preview'} variant="secondary" onPress={() => setPreview((v) => !v)} />
        {preview ? (
          <Text variant="body" style={{ lineHeight: 22 }}>{markdown || 'Nothing to preview.'}</Text>
        ) : (
          <TextInput
            multiline
            value={markdown}
            onChangeText={setMarkdown}
            placeholder="Describe the project, stack, conventions, and constraints."
            placeholderTextColor={colors.textMuted}
            style={{ minHeight: 280, color: colors.textPrimary, textAlignVertical: 'top' }}
          />
        )}
        <Button title="Save context" onPress={save} disabled={markdown === saved} />
        {markdown !== saved ? (
          <Button title="Cancel changes" variant="secondary" onPress={() => setMarkdown(saved)} />
        ) : null}
      </View>
    </Screen>
  );
};
