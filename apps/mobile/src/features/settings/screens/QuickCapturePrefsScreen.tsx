import React, { useEffect, useState } from 'react';
import { View, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Screen, LargeHeader, Text, Button } from '../../../components/ui';
import { http } from '../../../lib/http';
import { useWorkspaceStore } from '../../workspace';
import { useLabelsQuery } from '../../labels/api/queries';

export const QuickCapturePrefsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { spacing } = useTheme();
  const workspace = useWorkspaceStore((s) => s.activeWorkspace);
  const projects = workspace?.projects ?? [];
  const { data: labels = [] } = useLabelsQuery(workspace?.id);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [defaultLabelIds, setDefaultLabelIds] = useState<string[]>([]);
  const [rememberLastProject, setRememberLastProject] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(false);

  useEffect(() => {
    if (!workspace?.id) return;
    http
      .get<any>(`/me/quick-capture-preferences?workspaceId=${workspace.id}`)
      .then((prefs) => {
        setDefaultProjectId(prefs.defaultProjectId);
        setDefaultLabelIds(prefs.defaultLabelIds || []);
        setRememberLastProject(prefs.rememberLastProject);
        setShowProjectSelector(prefs.showProjectSelector);
        setLabelsExpanded(prefs.labelsExpanded);
      })
      .catch(() => {});
  }, [workspace?.id]);

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader title="Quick capture" onBack={() => navigation.goBack()} />
      <View style={{ gap: spacing.md, paddingBottom: 48 }}>
        <Text variant="caption" color="secondary">
          Defaults apply only inside {workspace?.name || 'the current workspace'}.
        </Text>
        <Text variant="label">Default project</Text>
        <Button title={defaultProjectId ? 'Clear default' : 'No default'} variant="secondary" onPress={() => setDefaultProjectId(null)} />
        {projects.map((p) => (
          <Button
            key={p.id}
            title={p.name}
            variant={defaultProjectId === p.id ? 'primary' : 'secondary'}
            onPress={() => setDefaultProjectId(p.id)}
          />
        ))}
        <Text variant="label">Default labels</Text>
        {labels.map((label) => {
          const on = defaultLabelIds.includes(label.id);
          return (
            <Button
              key={label.id}
              title={label.name}
              variant={on ? 'primary' : 'secondary'}
              onPress={() =>
                setDefaultLabelIds((curr) => (curr.includes(label.id) ? curr.filter((id) => id !== label.id) : [...curr, label.id]))
              }
            />
          );
        })}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="body">Remember last project</Text>
          <Switch value={rememberLastProject} onValueChange={setRememberLastProject} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="body">Show project selector</Text>
          <Switch value={showProjectSelector} onValueChange={setShowProjectSelector} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="body">Expand labels</Text>
          <Switch value={labelsExpanded} onValueChange={setLabelsExpanded} />
        </View>
        <Button
          title="Save"
          onPress={async () => {
            if (!workspace?.id) return;
            try {
              await http.put('/me/quick-capture-preferences', {
                workspaceId: workspace.id,
                defaultProjectId,
                defaultLabelIds,
                rememberLastProject,
                showProjectSelector,
                labelsExpanded,
              });
              Alert.alert('Saved', 'Quick capture will use these defaults.');
            } catch (err: any) {
              Alert.alert('Could not save', err?.message || 'Try again.');
            }
          }}
        />
      </View>
    </Screen>
  );
};
