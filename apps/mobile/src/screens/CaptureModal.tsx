import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Input, Chip } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { RootStackParamList } from '../navigation/types';

type CaptureRouteProp = RouteProp<RootStackParamList, 'CaptureModal'>;

export const CaptureModal: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CaptureRouteProp>();
  const initialMode = route.params?.initialMode ?? 'task';

  const [mode, setMode] = useState<'task' | 'bug' | 'voice'>(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const handleSave = () => {
    // In P11/P12 full capture state integration
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text variant="h1">
            {mode === 'bug' ? 'Report Bug' : mode === 'voice' ? 'Voice Capture' : 'Quick Capture'}
          </Text>
          <Button title="Close" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
        </View>

        {/* Mode Selector */}
        <View style={[styles.modeRow, { gap: spacing.sm, marginVertical: spacing.md }]}>
          <Chip
            label="Task"
            selected={mode === 'task'}
            onPress={() => setMode('task')}
          />
          <Chip
            label="Bug"
            selected={mode === 'bug'}
            onPress={() => setMode('bug')}
          />
          <Chip
            label="Voice Note"
            selected={mode === 'voice'}
            onPress={() => setMode('voice')}
          />
        </View>

        {/* Inputs */}
        <View style={[styles.inputGroup, { gap: spacing.md, marginTop: spacing.md }]}>
          <Input
            label={mode === 'bug' ? 'Issue Summary' : 'Task Title'}
            placeholder={mode === 'bug' ? 'e.g. Crash on checkout button click' : 'e.g. Finish design review'}
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Details (Markdown)"
            placeholder="Additional notes, reproduction steps, or context..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Priority Selector for Task/Bug */}
        <View style={[styles.priorityGroup, { marginTop: spacing.lg }]}>
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
            Priority
          </Text>
          <View style={[styles.modeRow, { gap: spacing.xs }]}>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
              <Chip
                key={p}
                label={p}
                selected={priority === p}
                onPress={() => setPriority(p)}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { gap: spacing.md, marginTop: spacing['2xl'] }]}>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.actionBtn}
            onPress={() => navigation.goBack()}
          />
          <Button
            title={mode === 'bug' ? 'Submit Bug' : 'Save Task'}
            variant="primary"
            style={styles.actionBtn}
            disabled={!title.trim()}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inputGroup: {
    width: '100%',
  },
  priorityGroup: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
  },
});
