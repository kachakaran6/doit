import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Screen, LargeHeader, Text, Button, Card, Chip, Switch } from '../../../components/ui';
import { http } from '../../../lib/http';
import { useWorkspaceStore } from '../../workspace';
import { useLabelsQuery } from '../../labels/api/queries';
import { Sliders, FolderKanban, Tag } from 'lucide-react-native';

export const QuickCapturePrefsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing, radius } = useTheme();
  const workspace = useWorkspaceStore((s) => s.activeWorkspace);
  const projects = workspace?.projects ?? [];
  const { data: labels = [] } = useLabelsQuery(workspace?.id);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [defaultLabelIds, setDefaultLabelIds] = useState<string[]>([]);
  const [rememberLastProject, setRememberLastProject] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workspace?.id) return;
    http
      .get<any>(`/me/quick-capture-preferences?workspaceId=${workspace.id}`)
      .then((prefs) => {
        if (!prefs) return;
        setDefaultProjectId(prefs.defaultProjectId || null);
        setDefaultLabelIds(prefs.defaultLabelIds || []);
        setRememberLastProject(prefs.rememberLastProject !== false);
        setShowProjectSelector(prefs.showProjectSelector !== false);
        setLabelsExpanded(Boolean(prefs.labelsExpanded));
      })
      .catch(() => {});
  }, [workspace?.id]);

  const handleSave = async () => {
    if (!workspace?.id) return;
    try {
      setSaving(true);
      await http.put('/me/quick-capture-preferences', {
        workspaceId: workspace.id,
        defaultProjectId,
        defaultLabelIds,
        rememberLastProject,
        showProjectSelector,
        labelsExpanded,
      });
      Alert.alert('Preferences Saved', 'Quick Capture will now use these default settings.');
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save Quick Capture preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader
        title="Quick Capture"
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            (navigation as any).navigate('Settings');
          }
        }}
      />
      <View style={{ gap: spacing.lg, paddingBottom: 48 }}>
        <Text variant="caption" color="secondary">
          Settings configured here apply to Quick Capture inside {workspace?.name || 'this workspace'}.
        </Text>

        {/* Default Project Card */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <FolderKanban size={18} color={colors.accentText} />
            <Text variant="headline">Default Project</Text>
          </View>
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md }}>
            Initial target project when creating tasks, bugs, or stickies.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            <Chip
              label="Auto (Last Used)"
              selected={defaultProjectId === null}
              onPress={() => setDefaultProjectId(null)}
            />
            {projects.map((p) => {
              const selected = defaultProjectId === p.id;
              return (
                <Chip
                  key={p.id}
                  label={p.name}
                  selected={selected}
                  onPress={() => setDefaultProjectId(p.id)}
                />
              );
            })}
          </View>
        </Card>

        {/* Default Labels Card */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Tag size={18} color={colors.accentText} />
            <Text variant="headline">Default Labels</Text>
          </View>
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md }}>
            Labels automatically pre-attached to items created via Quick Capture.
          </Text>

          {labels.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
              {labels.map((label) => {
                const selected = defaultLabelIds.includes(label.id);
                return (
                  <Chip
                    key={label.id}
                    label={label.name}
                    selected={selected}
                    onPress={() => {
                      setDefaultLabelIds((curr) =>
                        curr.includes(label.id) ? curr.filter((id) => id !== label.id) : [...curr, label.id]
                      );
                    }}
                  />
                );
              })}
            </View>
          ) : (
            <View style={{ paddingVertical: spacing.sm }}>
              <Text variant="caption" color="secondary">
                No labels exist in this workspace yet. You can create labels in Project Settings.
              </Text>
            </View>
          )}
        </Card>

        {/* Behavior Toggles Card */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <Sliders size={18} color={colors.accentText} />
            <Text variant="headline">Capture Behavior</Text>
          </View>

          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="bodyStrong">Remember Last Project</Text>
                <Text variant="caption" color="secondary">Automatically pre-select the project you last logged an item to.</Text>
              </View>
              <Switch value={rememberLastProject} onValueChange={setRememberLastProject} />
            </View>

            <View style={{ height: 1, backgroundColor: colors.hairline }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="bodyStrong">Show Project Selector</Text>
                <Text variant="caption" color="secondary">Display project picker affordance on the capture modal.</Text>
              </View>
              <Switch value={showProjectSelector} onValueChange={setShowProjectSelector} />
            </View>

            <View style={{ height: 1, backgroundColor: colors.hairline }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="bodyStrong">Expand Labels by Default</Text>
                <Text variant="caption" color="secondary">Show label tags directly expanded in the modal.</Text>
              </View>
              <Switch value={labelsExpanded} onValueChange={setLabelsExpanded} />
            </View>
          </View>
        </Card>

        {/* Primary Save Button */}
        <Button
          title="Save Preferences"
          variant="primary"
          loading={saving}
          onPress={handleSave}
        />
      </View>
    </Screen>
  );
};
