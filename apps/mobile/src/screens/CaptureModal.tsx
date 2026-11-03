import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Text, Button, Input, Chip, KeyboardAccessoryBar, AttachmentSection, AttachmentItem } from '../components/ui';
import { http } from '../lib/http';
import {
  DueDatePicker,
  PriorityPicker,
  PriorityValue,
  SeverityPicker,
  SeverityValue,
} from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useKeyboardBar } from '../core/providers/KeyboardProvider';
import { useCreateTaskMutation } from '../features/tasks/api/mutations';
import { useCreateBugMutation } from '../features/bugs/api/mutations';
import { useCreateStickyMutation } from '../features/stickies/api/mutations';
import { useCreateVoiceNoteMutation } from '../features/voice/api/mutations';
import { useWorkspaceStore } from '../features/workspace';
import { overlayService } from '../native/overlay';
import { RootStackParamList } from '../navigation/types';
import {
  X,
  Check,
  Bug,
  CheckSquare,
  Mic,
  StickyNote,
  Square,
  Play,
  RotateCcw,
  Pin,
  Smartphone,
  Sparkles,
} from 'lucide-react-native';

type CaptureRouteProp = RouteProp<RootStackParamList, 'CaptureModal'>;
type CaptureMode = 'task' | 'bug' | 'sticky' | 'voice';

const STICKY_COLORS = [
  { label: 'Amber', value: 'AMBER', hex: '#F59E0B' },
  { label: 'Indigo', value: 'INDIGO', hex: '#7775D8' },
  { label: 'Teal', value: 'TEAL', hex: '#14B8A6' },
  { label: 'Rose', value: 'ROSE', hex: '#F43F5E' },
  { label: 'Violet', value: 'VIOLET', hex: '#8B5CF6' },
];

export const CaptureModal: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CaptureRouteProp>();
  const initialMode = (route.params?.initialMode as CaptureMode) ?? 'task';

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  // Common Form States
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Task-specific
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriorityState] = useState<PriorityValue>('MEDIUM');

  // Bug-specific
  const [severity, setSeverityState] = useState<SeverityValue>('MAJOR');

  // Sticky-specific
  const [stickyColor, setStickyColor] = useState('AMBER');
  const [isPinned, setIsPinned] = useState(false);

  // Voice-specific
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordDurationMs, setRecordDurationMs] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState<'en-IN' | 'hi-IN' | 'auto'>('en-IN');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { setKeyboardContext, setOnAction, setActiveValue } = useKeyboardBar();

  // Mutations
  const createTask = useCreateTaskMutation(projectId);
  const createBug = useCreateBugMutation(projectId);
  const createSticky = useCreateStickyMutation(projectId);
  const createVoiceNote = useCreateVoiceNoteMutation();

  const setPriority = (p: PriorityValue) => {
    setPriorityState(p);
    setActiveValue('priority', p);
  };

  const setSeverity = (s: SeverityValue) => {
    setSeverityState(s);
    setActiveValue('severity', s);
  };

  // Ensure activeProject is populated
  useEffect(() => {
    if (!activeProject) {
      useWorkspaceStore.getState().fetchAndInitializeWorkspaces().catch(() => {});
    }
  }, [activeProject]);

  // Clean up sound and recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [recording, sound]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Microphone permission is required to capture voice notes.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setRecordedUri(null);
      setRecordDurationMs(0);

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordDurationMs(Date.now() - startTime);
      }, 200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start voice recording.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to stop voice recording.');
    }
  };

  const playRecordedAudio = async () => {
    if (!recordedUri) return;
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to play recorded audio.');
    }
  };

  const resetRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sound) {
      await sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setRecordedUri(null);
    setRecordDurationMs(0);
    setIsPlaying(false);
    setIsRecording(false);
  };

  // State ref for stable keyboard listener execution
  const stateRef = useRef({
    mode,
    title,
    description,
    dueDate,
    priority,
    severity,
    stickyColor,
    isPinned,
    recordedUri,
    recordDurationMs,
    voiceLanguage,
    projectId,
    attachments,
  });

  stateRef.current = {
    mode,
    title,
    description,
    dueDate,
    priority,
    severity,
    stickyColor,
    isPinned,
    recordedUri,
    recordDurationMs,
    voiceLanguage,
    projectId,
    attachments,
  };

  const handleSave = useCallback(async () => {
    const current = stateRef.current;

    if (current.mode === 'voice') {
      if (!current.recordedUri) {
        setErrorMessage('Please record an audio clip before saving.');
        return;
      }
    } else {
      if (!current.title.trim()) {
        setErrorMessage(
          current.mode === 'sticky'
            ? 'Please enter your note text.'
            : current.mode === 'bug'
            ? 'Please enter an issue summary.'
            : 'Please enter a task title.'
        );
        return;
      }
    }

    setErrorMessage(null);

    try {
      let createdId: string | null = null;

      if (current.mode === 'bug') {
        const res: any = await createBug.mutateAsync({
          title: current.title.trim(),
          description: current.description.trim() || undefined,
          severity: current.severity,
          telemetry: {
            platform: Platform.OS,
            version: Platform.Version,
            appVersion: '0.1.0',
            package: 'com.samyukt.doit',
          },
        });
        createdId = res?.task?.id || res?.id || null;
      } else if (current.mode === 'sticky') {
        const fullBody = current.description.trim()
          ? `${current.title.trim()}\n${current.description.trim()}`
          : current.title.trim();
        await createSticky.mutateAsync({
          body: fullBody,
          color: current.stickyColor,
          pinned: current.isPinned,
        });
      } else if (current.mode === 'voice') {
        await createVoiceNote.mutateAsync({
          uri: current.recordedUri!,
          durationMs: current.recordDurationMs || 1000,
          language: current.voiceLanguage,
        });
      } else {
        const dueAtIso = current.dueDate ? new Date(current.dueDate).toISOString() : undefined;
        const res: any = await createTask.mutateAsync({
          title: current.title.trim(),
          description: current.description.trim() || undefined,
          dueDate: dueAtIso,
          priority: current.priority,
        });
        createdId = res?.task?.id || res?.id || null;
      }

      if (createdId && current.attachments.length > 0) {
        setIsUploadingAttachments(true);
        for (const item of current.attachments) {
          try {
            const normalizedMime =
              !item.mimeType || item.mimeType === 'image/jpg' ? 'image/jpeg' : item.mimeType;
            const sizeBytes = item.sizeBytes && item.sizeBytes > 0 ? item.sizeBytes : 1024;

            const initRes = await http.post<{ uploadId: string; putUrl: string; key: string }>('/uploads/init', {
              contentType: normalizedMime,
              sizeBytes,
              purpose: current.mode === 'bug' ? 'BUG' : 'TASK',
            });
            const putTarget = initRes.putUrl.startsWith('/') ? `${http.getBaseUrl()}${initRes.putUrl}` : initRes.putUrl;
            await overlayService.uploadFile(item.uri, putTarget, normalizedMime);
            await http.post(`/uploads/${initRes.uploadId}/complete`, {
              taskId: createdId,
              bugId: current.mode === 'bug' ? createdId : undefined,
            });
          } catch (uploadErr) {
            console.warn('[CaptureModal] Attachment upload error:', uploadErr);
          }
        }
        setIsUploadingAttachments(false);
      }

      navigation.goBack();
    } catch (err: any) {
      setIsUploadingAttachments(false);
      setErrorMessage(err.message || 'Failed to save. Please try again.');
    }
  }, [createBug, createTask, createSticky, createVoiceNote, navigation]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Keyboard toolbar listener
  useEffect(() => {
    setOnAction((actionId, payload) => {
      if (actionId === 'due_date') {
        const d = new Date();
        if (payload === 'tomorrow') d.setDate(d.getDate() + 1);
        setDueDate(d.toISOString().split('T')[0] ?? null);
      } else if (actionId === 'pick_priority') {
        setPriorityState((prev) => {
          const next =
            prev === 'LOW'
              ? 'MEDIUM'
              : prev === 'MEDIUM'
              ? 'HIGH'
              : prev === 'HIGH'
              ? 'URGENT'
              : 'LOW';
          setActiveValue('priority', next);
          return next;
        });
      } else if (actionId === 'pick_severity') {
        setSeverityState((prev) => {
          const next =
            prev === 'CRITICAL'
              ? 'MAJOR'
              : prev === 'MAJOR'
              ? 'MINOR'
              : prev === 'MINOR'
              ? 'TRIVIAL'
              : 'CRITICAL';
          setActiveValue('severity', next);
          return next;
        });
      } else if (actionId === 'send') {
        handleSaveRef.current();
      }
    });

    return () => setOnAction(undefined);
  }, [setOnAction, setActiveValue]);

  const isSaving =
    createTask.isPending ||
    createBug.isPending ||
    createSticky.isPending ||
    createVoiceNote.isPending ||
    isUploadingAttachments;

  const isSubmitDisabled =
    isSaving ||
    (mode === 'voice' ? !recordedUri : !title.trim());

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
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
                style={styles.headerKicker}
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

          {/* Mode Selector Pill Row */}
          <View style={[styles.modeRow, { gap: spacing.xs, marginBottom: spacing.lg }]}>
            <Chip
              label="Task"
              selected={mode === 'task'}
              leadingIcon={
                <CheckSquare
                  size={13}
                  color={mode === 'task' ? colors.accentText : colors.textTertiary}
                />
              }
              onPress={() => {
                setMode('task');
                setKeyboardContext('task_title');
              }}
            />
            <Chip
              label="Bug"
              selected={mode === 'bug'}
              leadingIcon={
                <Bug
                  size={13}
                  color={mode === 'bug' ? colors.accentText : colors.textTertiary}
                />
              }
              onPress={() => {
                setMode('bug');
                setKeyboardContext('bug_desc');
              }}
            />
            <Chip
              label="Sticky"
              selected={mode === 'sticky'}
              leadingIcon={
                <StickyNote
                  size={13}
                  color={mode === 'sticky' ? colors.accentText : colors.textTertiary}
                />
              }
              onPress={() => {
                setMode('sticky');
                setKeyboardContext('sticky_body');
              }}
            />
            <Chip
              label="Voice"
              selected={mode === 'voice'}
              leadingIcon={
                <Mic
                  size={13}
                  color={mode === 'voice' ? colors.accentText : colors.textTertiary}
                />
              }
              onPress={() => setMode('voice')}
            />
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

          {/* Form Content by Mode */}
          {mode === 'voice' ? (
            <View style={{ gap: spacing.lg }}>
              {/* Voice Recording Widget */}
              <View
                style={[
                  styles.voiceContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    padding: spacing.xl,
                    alignItems: 'center',
                  },
                ]}
              >
                <Text variant="h1" style={{ fontSize: 36, fontWeight: '700', marginBottom: spacing.xs }}>
                  {formatTimer(recordDurationMs)}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing.lg }}>
                  {isRecording
                    ? 'Recording audio... Tap stop when finished'
                    : recordedUri
                    ? 'Audio recorded. Ready to save or play.'
                    : 'Tap microphone to start voice recording'}
                </Text>

                {/* Big Mic / Record Button */}
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[
                    styles.micButton,
                    {
                      backgroundColor: isRecording ? colors.danger : colors.accent,
                      borderColor: isRecording ? colors.danger : colors.accent,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? (
                    <Square size={28} color="#FFFFFF" />
                  ) : (
                    <Mic size={32} color={colors.accentOnPrimary} />
                  )}
                </TouchableOpacity>

                {/* Playback & Reset Controls */}
                {recordedUri && !isRecording && (
                  <View style={[styles.voiceControls, { marginTop: spacing.lg, gap: spacing.md }]}>
                    <Button
                      title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                      variant="secondary"
                      size="sm"
                      icon={<Play size={14} color={colors.accentText} />}
                      onPress={playRecordedAudio}
                    />
                    <Button
                      title="Re-record"
                      variant="ghost"
                      size="sm"
                      icon={<RotateCcw size={14} color={colors.textSecondary} />}
                      onPress={resetRecording}
                    />
                  </View>
                )}
              </View>

              {/* Language Selection */}
              <View>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
                  Audio Language
                </Text>
                <View style={[styles.chipRow, { gap: spacing.xs }]}>
                  <Chip
                    label="English (India)"
                    selected={voiceLanguage === 'en-IN'}
                    onPress={() => setVoiceLanguage('en-IN')}
                  />
                  <Chip
                    label="Hindi (India)"
                    selected={voiceLanguage === 'hi-IN'}
                    onPress={() => setVoiceLanguage('hi-IN')}
                  />
                  <Chip
                    label="Auto Detect"
                    selected={voiceLanguage === 'auto'}
                    onPress={() => setVoiceLanguage('auto')}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {/* Primary Input */}
              <Input
                label={
                  mode === 'bug'
                    ? 'Issue Summary'
                    : mode === 'sticky'
                    ? 'Note Content'
                    : 'Task Title'
                }
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
                  setKeyboardContext(
                    mode === 'bug' ? 'bug_desc' : mode === 'sticky' ? 'sticky_body' : 'task_title'
                  )
                }
                multiline={mode === 'sticky'}
                numberOfLines={mode === 'sticky' ? 5 : 1}
                autoFocus
              />

              {/* Description Input for Task & Bug */}
              {mode !== 'sticky' && (
                <Input
                  label={mode === 'bug' ? 'Steps to Reproduce & Notes' : 'Description & Context'}
                  placeholder={
                    mode === 'bug'
                      ? '1. Open app\n2. Navigate to screen\n3. Observe crash'
                      : 'Add acceptance criteria, links, or notes...'
                  }
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => setKeyboardContext(mode === 'bug' ? 'bug_desc' : 'task_desc')}
                  multiline
                  numberOfLines={4}
                />
              )}

              {/* Sticky-Specific Options */}
              {mode === 'sticky' && (
                <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
                  {/* Color Accent Picker */}
                  <View>
                    <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
                      Sticky Accent Color
                    </Text>
                    <View style={[styles.chipRow, { gap: spacing.xs }]}>
                      {STICKY_COLORS.map((c) => (
                        <TouchableOpacity
                          key={c.value}
                          onPress={() => setStickyColor(c.value)}
                          style={[
                            styles.colorPill,
                            {
                              backgroundColor: colors.surface,
                              borderColor: stickyColor === c.value ? c.hex : colors.border,
                              borderWidth: stickyColor === c.value ? 2 : 1,
                              borderRadius: radius.pill,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: c.hex, borderRadius: radius.pill },
                            ]}
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: stickyColor === c.value ? colors.textPrimary : colors.textSecondary,
                              fontWeight: stickyColor === c.value ? '700' : '400',
                            }}
                          >
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Pin to Top Switch */}
                  <View
                    style={[
                      styles.switchRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Pin size={16} color={isPinned ? colors.accentText : colors.textSecondary} />
                      <View style={{ marginLeft: spacing.sm }}>
                        <Text variant="label" style={{ fontWeight: '600' }}>
                          Pin to Top
                        </Text>
                        <Text variant="caption" color="secondary">
                          Keep this sticky note at the top of your workspace
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={isPinned}
                      onValueChange={setIsPinned}
                      trackColor={{ false: colors.border, true: colors.accent }}
                    />
                  </View>
                </View>
              )}

              {/* Bug-Specific Telemetry Card */}
              {mode === 'bug' && (
                <View
                  style={[
                    styles.deviceBadge,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                    },
                  ]}
                >
                  <Smartphone size={14} color={colors.textSecondary} />
                  <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
                    Environment: Android {Platform.Version} • com.samyukt.doit
                  </Text>
                </View>
              )}

              {/* Pickers for Task & Bug */}
              {mode === 'task' && (
                <View style={{ marginTop: spacing.sm, gap: spacing.md }}>
                  <DueDatePicker value={dueDate} onChange={setDueDate} />
                  <PriorityPicker value={priority} onChange={setPriority} />
                </View>
              )}

              {mode === 'bug' && (
                <View style={{ marginTop: spacing.sm }}>
                  <SeverityPicker value={severity} onChange={setSeverity} />
                </View>
              )}
            </View>
          )}

          {/* Attachment Section across all capture modes */}
          <AttachmentSection
            attachments={attachments}
            onAddAttachment={(item) => setAttachments((prev) => [...prev, item])}
            onRemoveAttachment={(index) =>
              setAttachments((prev) => prev.filter((_, i) => i !== index))
            }
          />

          {/* Bottom Action Row */}
          <View style={[styles.actionRow, { gap: spacing.md, marginTop: spacing['2xl'] }]}>
            <View style={styles.actionBtn}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => navigation.goBack()}
              />
            </View>
            <View style={styles.actionBtn}>
              <Button
                title={
                  mode === 'bug'
                    ? 'Submit Bug'
                    : mode === 'sticky'
                    ? 'Save Sticky Note'
                    : mode === 'voice'
                    ? 'Save Voice Note'
                    : 'Create Task'
                }
                variant="primary"
                disabled={isSubmitDisabled}
                loading={isSaving}
                icon={
                  isSaving ? undefined : (
                    <Check size={16} color={colors.accentOnPrimary} />
                  )
                }
                onPress={handleSave}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Contextual Keyboard Accessory Bar (Task, Bug, Sticky) */}
      {mode !== 'voice' && <KeyboardAccessoryBar onSend={handleSave} />}
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
  headerKicker: {
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
  voiceContainer: {
    borderWidth: 1,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});
