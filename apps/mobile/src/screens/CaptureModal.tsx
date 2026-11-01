import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Input, Chip, KeyboardAccessoryBar } from '../components/ui';
import { DueDatePicker, PriorityPicker, PriorityValue, SeverityPicker, SeverityValue } from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useKeyboardBar } from '../core/providers/KeyboardProvider';
import { useCreateTaskMutation } from '../features/tasks/api/mutations';
import { useCreateBugMutation } from '../features/bugs/api/mutations';
import { useCreateStickyMutation } from '../features/stickies/api/mutations';
import { useWorkspaceStore } from '../features/workspace';
import { RootStackParamList } from '../navigation/types';
import { X, Check, Bug, CheckSquare, Mic, StickyNote } from 'lucide-react-native';

type CaptureRouteProp = RouteProp<RootStackParamList, 'CaptureModal'>;

export const CaptureModal: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CaptureRouteProp>();
  const initialMode = route.params?.initialMode ?? 'task';

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const [mode, setMode] = useState<'task' | 'bug' | 'voice' | 'sticky'>(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriorityState] = useState<PriorityValue>('MEDIUM');
  const [severity, setSeverityState] = useState<SeverityValue>('MAJOR');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setKeyboardContext, setOnAction, setActiveValue } = useKeyboardBar();

  const createTask = useCreateTaskMutation(projectId);
  const createBug = useCreateBugMutation(projectId);
  const createSticky = useCreateStickyMutation(projectId);

  const setPriority = (p: PriorityValue) => {
    setPriorityState(p);
    setActiveValue('priority', p);
  };

  const setSeverity = (s: SeverityValue) => {
    setSeverityState(s);
    setActiveValue('severity', s);
  };

  // State ref for stable listener execution
  const stateRef = useRef({
    mode,
    title,
    description,
    dueDate,
    priority,
    severity,
    projectId,
  });

  stateRef.current = {
    mode,
    title,
    description,
    dueDate,
    priority,
    severity,
    projectId,
  };

  const handleSave = useCallback(async () => {
    const current = stateRef.current;
    if (!current.title.trim()) {
      setErrorMessage(
        current.mode === 'sticky'
          ? 'Please enter your note text.'
          : 'Please enter a title or issue summary.'
      );
      return;
    }
    setErrorMessage(null);

    try {
      if (current.mode === 'bug') {
        await createBug.mutateAsync({
          title: current.title.trim(),
          description: current.description.trim() || undefined,
          severity: current.severity,
        });
      } else if (current.mode === 'sticky') {
        const fullBody = current.description.trim()
          ? `${current.title.trim()}\n${current.description.trim()}`
          : current.title.trim();
        await createSticky.mutateAsync({
          body: fullBody,
        });
      } else {
        const dueAtIso = current.dueDate ? new Date(current.dueDate).toISOString() : undefined;
        await createTask.mutateAsync({
          title: current.title.trim(),
          description: current.description.trim() || undefined,
          dueDate: dueAtIso,
          priority: current.priority,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save. Please try again.');
    }
  }, [createBug, createTask, createSticky, navigation]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Stable keyboard listener registered once
  useEffect(() => {
    setOnAction((actionId, payload) => {
      if (actionId === 'due_date') {
        const d = new Date();
        if (payload === 'tomorrow') d.setDate(d.getDate() + 1);
        setDueDate(d.toISOString().split('T')[0] ?? null);
      } else if (actionId === 'pick_priority') {
        setPriorityState((prev) => {
          const next = prev === 'LOW' ? 'MEDIUM' : prev === 'MEDIUM' ? 'HIGH' : prev === 'HIGH' ? 'URGENT' : 'LOW';
          setActiveValue('priority', next);
          return next;
        });
      } else if (actionId === 'pick_severity') {
        setSeverityState((prev) => {
          const next = prev === 'CRITICAL' ? 'MAJOR' : prev === 'MAJOR' ? 'MINOR' : prev === 'MINOR' ? 'TRIVIAL' : 'CRITICAL';
          setActiveValue('severity', next);
          return next;
        });
      } else if (actionId === 'send') {
        handleSaveRef.current();
      }
    });

    return () => setOnAction(undefined);
  }, [setOnAction, setActiveValue]);

  const isSaving = createTask.isPending || createBug.isPending || createSticky.isPending;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: 96,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text
              variant="caption"
              color="secondary"
              style={styles.headerSubtitle}
            >
              {activeProject ? `${activeProject.key} • ${activeProject.name}` : 'QUICK CAPTURE'}
            </Text>
            <Text variant="h1" style={{ marginTop: 2, fontWeight: '700' }}>
              {mode === 'bug'
                ? 'Report Bug'
                : mode === 'sticky'
                ? 'New Sticky Note'
                : mode === 'voice'
                ? 'Voice Capture'
                : 'New Task'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.closeBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.sm,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close capture"
          >
            <X size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Mode Selector Chips */}
        <View style={[styles.modeRow, { gap: spacing.xs, marginBottom: spacing.lg }]}>
          <Chip
            label="Task"
            selected={mode === 'task'}
            leadingIcon={<CheckSquare size={13} color={mode === 'task' ? colors.accentText : colors.textTertiary} />}
            onPress={() => {
              setMode('task');
              setKeyboardContext('task_title');
            }}
          />
          <Chip
            label="Bug"
            selected={mode === 'bug'}
            leadingIcon={<Bug size={13} color={mode === 'bug' ? colors.accentText : colors.textTertiary} />}
            onPress={() => {
              setMode('bug');
              setKeyboardContext('bug_desc');
            }}
          />
          <Chip
            label="Sticky"
            selected={mode === 'sticky'}
            leadingIcon={<StickyNote size={13} color={mode === 'sticky' ? colors.accentText : colors.textTertiary} />}
            onPress={() => {
              setMode('sticky');
              setKeyboardContext('sticky_body');
            }}
          />
          <Chip
            label="Voice"
            selected={mode === 'voice'}
            leadingIcon={<Mic size={13} color={mode === 'voice' ? colors.accentText : colors.textTertiary} />}
            onPress={() => setMode('voice')}
          />
        </View>

        {errorMessage && (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.danger,
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={{ gap: spacing.md }}>
          <Input
            label={mode === 'bug' ? 'Issue Summary' : mode === 'sticky' ? 'Note Content' : 'Task Title'}
            placeholder={
              mode === 'bug'
                ? 'e.g. App crashes when tapping checkout'
                : mode === 'sticky'
                ? 'e.g. Remember to check S3 bucket CORS policy'
                : 'e.g. Review pull request for auth'
            }
            value={title}
            onChangeText={(txt) => {
              setTitle(txt);
              if (errorMessage) setErrorMessage(null);
            }}
            onFocus={() =>
              setKeyboardContext(mode === 'bug' ? 'bug_desc' : mode === 'sticky' ? 'sticky_body' : 'task_title')
            }
            autoFocus
          />

          {mode !== 'sticky' && (
            <Input
              label="Description & Context"
              placeholder={
                mode === 'bug'
                  ? 'Steps to reproduce:\n1. Open app\n2. Navigate to...\n3. Observe crash'
                  : 'Add acceptance criteria, links, or notes...'
              }
              value={description}
              onChangeText={setDescription}
              onFocus={() => setKeyboardContext(mode === 'bug' ? 'bug_desc' : 'task_desc')}
              multiline
              numberOfLines={4}
            />
          )}
        </View>

        {/* Context Pickers */}
        {mode !== 'sticky' && (
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
        )}

        {/* Action Buttons */}
        <View style={[styles.actionRow, { gap: spacing.md, marginTop: spacing['2xl'] }]}>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.actionBtn}
            onPress={() => navigation.goBack()}
          />
          <Button
            title={mode === 'bug' ? 'Submit Bug' : mode === 'sticky' ? 'Save Sticky' : 'Create Task'}
            variant="primary"
            style={styles.actionBtn}
            disabled={!title.trim()}
            loading={isSaving}
            icon={<Check size={16} color={colors.accentOnPrimary} />}
            onPress={handleSave}
          />
        </View>
      </ScrollView>

      {/* Contextual Keyboard Accessory Bar */}
      <KeyboardAccessoryBar onSend={handleSave} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorCard: {
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
  },
});
