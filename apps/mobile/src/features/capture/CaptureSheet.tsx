import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Sheet, Text, Button, Input, Chip } from '../../components/ui';
import {
  DueDatePicker,
  PriorityPicker,
  PriorityValue,
  SeverityPicker,
  SeverityValue,
} from '../../components/patterns';
import { useCreateTaskMutation } from '../tasks/api/mutations';
import { useCreateBugMutation } from '../bugs/api/mutations';
import { DeviceContextCollector } from '../../lib/device';
import { Mic, Paperclip, Check } from 'lucide-react-native';

export interface CaptureSheetProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'task' | 'bug' | 'voice';
  screenshotUri?: string | null;
  appUnderTest?: string;
}

export const CaptureSheet: React.FC<CaptureSheetProps> = ({
  visible,
  onClose,
  initialMode = 'task',
  screenshotUri = null,
  appUnderTest,
}) => {
  const { colors, spacing, radius } = useTheme();

  const [mode, setMode] = useState<'task' | 'bug'>(initialMode === 'bug' ? 'bug' : 'task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityValue>('MEDIUM');
  const [severity, setSeverity] = useState<SeverityValue>('MAJOR');
  const [isRecording, setIsRecording] = useState(initialMode === 'voice');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const checkScale = useRef(new Animated.Value(0)).current;

  const createTask = useCreateTaskMutation('default');
  const createBug = useCreateBugMutation('default');

  const handleSubmit = async () => {
    if (!title.trim()) return;

    if (mode === 'bug') {
      const telemetry = await DeviceContextCollector.collectContext(
        appUnderTest ? { appUnderTest } : undefined
      );
      await createBug.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        severity,
        telemetry,
      });
    } else {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
    }

    // 600ms success checkmark overlay per §Requirements
    setIsSubmitted(true);
    Animated.spring(checkScale, {
      toValue: 1,
      damping: 12,
      stiffness: 140,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsSubmitted(false);
      checkScale.setValue(0);
      setTitle('');
      setDescription('');
      onClose();
    }, 600);
  };

  const isSaving = createTask.isPending || createBug.isPending;

  return (
    <Sheet visible={visible} onClose={onClose} detent={0.9} title={mode === 'bug' ? 'Report Defect' : 'Quick Task'}>
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 64 }}>
          {/* Mode Switcher */}
          <View style={[styles.modeRow, { gap: spacing.xs }]}>
            <Chip
              label="Task"
              selected={mode === 'task'}
              onPress={() => setMode('task')}
            />
            <Chip
              label="Bug Report"
              selected={mode === 'bug'}
              onPress={() => setMode('bug')}
            />
            {appUnderTest && (
              <Chip
                label={`App: ${appUnderTest}`}
                selected
              />
            )}
          </View>

          {/* Screenshot attached if present from shake / session */}
          {screenshotUri && (
            <View style={[styles.screenshotPreview, { borderColor: colors.border, borderRadius: radius.md }]}>
              <Paperclip size={14} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ marginLeft: spacing.xs }}>
                Screenshot Attached (Auto-Captured)
              </Text>
            </View>
          )}

          {/* Title Input */}
          <Input
            label={mode === 'bug' ? 'Issue Summary' : 'Task Title'}
            placeholder={mode === 'bug' ? 'e.g. Crash on checkout button' : 'e.g. Prepare presentation'}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Voice recording strip */}
          <View
            style={[
              styles.voiceBar,
              {
                backgroundColor: isRecording ? colors.accentSoft : colors.bgSubtle,
                borderColor: isRecording ? colors.accent : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
              },
            ]}
          >
            <Button
              title={isRecording ? 'Listening...' : 'Voice Dictate'}
              variant={isRecording ? 'primary' : 'ghost'}
              size="sm"
              icon={<Mic size={16} color={isRecording ? colors.accentOnPrimary : colors.accentText} />}
              onPress={() => setIsRecording(!isRecording)}
            />
            <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: spacing.sm }}>
              {isRecording ? 'Speak now... AI will structure bug steps' : 'Tap to speak voice note'}
            </Text>
          </View>

          {/* Details / Markdown Input */}
          <Input
            label="Details (Markdown)"
            placeholder="Additional notes, reproduction steps, or context..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Single-tap Pickers */}
          {mode === 'task' ? (
            <View style={{ gap: spacing.sm }}>
              <DueDatePicker value={dueDate} onChange={setDueDate} />
              <PriorityPicker value={priority} onChange={setPriority} />
            </View>
          ) : (
            <SeverityPicker value={severity} onChange={setSeverity} />
          )}

          <View style={{ marginTop: spacing.md }}>
            <Button
              title={mode === 'bug' ? 'Submit Bug' : 'Create Task'}
              variant="primary"
              fullWidth
              disabled={!title.trim()}
              loading={isSaving}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>

        {/* 600 ms Success Checkmark Overlay */}
        {isSubmitted && (
          <View style={[styles.successOverlay, { backgroundColor: colors.overlay }]}>
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: colors.success,
                  borderRadius: radius.pill,
                  transform: [{ scale: checkScale }],
                },
              ]}
            >
              <Check size={48} color={colors.surface} />
            </Animated.View>
          </View>
        )}
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  screenshotPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 8,
  },
  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  checkCircle: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
