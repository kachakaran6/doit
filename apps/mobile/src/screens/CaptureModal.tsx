import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Input, Chip, KeyboardAccessoryBar } from '../components/ui';
import { DueDatePicker, PriorityPicker, PriorityValue, SeverityPicker, SeverityValue } from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useKeyboardBar } from '../core/providers/KeyboardProvider';
import { useCreateTaskMutation } from '../features/tasks/api/mutations';
import { useCreateBugMutation } from '../features/bugs/api/mutations';
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
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityValue>('MEDIUM');
  const [severity, setSeverity] = useState<SeverityValue>('MAJOR');

  const { setKeyboardContext, setOnAction, setActiveValue } = useKeyboardBar();

  const createTask = useCreateTaskMutation('default');
  const createBug = useCreateBugMutation('default');

  useEffect(() => {
    setActiveValue('priority', priority);
    setActiveValue('severity', severity);
  }, [priority, severity, setActiveValue]);

  useEffect(() => {
    setOnAction((actionId, payload) => {
      if (actionId === 'due_date') {
        const d = new Date();
        if (payload === 'tomorrow') d.setDate(d.getDate() + 1);
        setDueDate(d.toISOString().split('T')[0] ?? null);
      } else if (actionId === 'pick_priority') {
        setPriority((prev) => (prev === 'LOW' ? 'MEDIUM' : prev === 'MEDIUM' ? 'HIGH' : prev === 'HIGH' ? 'URGENT' : 'LOW'));
      } else if (actionId === 'pick_severity') {
        setSeverity((prev) => (prev === 'CRITICAL' ? 'MAJOR' : prev === 'MAJOR' ? 'MINOR' : prev === 'MINOR' ? 'TRIVIAL' : 'CRITICAL'));
      } else if (actionId === 'send') {
        handleSave();
      }
    });

    return () => setOnAction(undefined);
  }, [title, description, priority, severity, dueDate]);

  const handleSave = async () => {
    if (!title.trim()) return;

    if (mode === 'bug') {
      await createBug.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        severity,
      });
    } else {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
    }

    navigation.goBack();
  };

  const isSaving = createTask.isPending || createBug.isPending;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg, paddingBottom: 80 }]}>
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
            onPress={() => {
              setMode('task');
              setKeyboardContext('task_title');
            }}
          />
          <Chip
            label="Bug"
            selected={mode === 'bug'}
            onPress={() => {
              setMode('bug');
              setKeyboardContext('bug_desc');
            }}
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
            onFocus={() => setKeyboardContext(mode === 'bug' ? 'bug_desc' : 'task_title')}
            autoFocus
          />

          <Input
            label="Details (Markdown)"
            placeholder="Additional notes, reproduction steps, or context..."
            value={description}
            onChangeText={setDescription}
            onFocus={() => setKeyboardContext(mode === 'bug' ? 'bug_desc' : 'task_desc')}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Single-tap Pickers */}
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {mode === 'task' ? (
            <>
              <DueDatePicker value={dueDate} onChange={setDueDate} />
              <PriorityPicker value={priority} onChange={setPriority} />
            </>
          ) : (
            <SeverityPicker value={severity} onChange={setSeverity} />
          )}
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
            loading={isSaving}
            onPress={handleSave}
          />
        </View>
      </ScrollView>

      {/* P14 Contextual Keyboard Accessory Bar */}
      <KeyboardAccessoryBar onSend={handleSave} />
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
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
  },
});
