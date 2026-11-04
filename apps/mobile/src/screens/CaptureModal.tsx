import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Switch,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import {
  Text,
  Button,
  Chip,
  AttachmentItem,
  AttachmentSection,
} from '../components/ui';
import { http } from '../lib/http';
import {
  PriorityValue,
  SeverityValue,
} from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useCreateTaskMutation } from '../features/tasks/api/mutations';
import { useCreateBugMutation } from '../features/bugs/api/mutations';
import { useCreateStickyMutation } from '../features/stickies/api/mutations';
import { useCreateVoiceNoteMutation } from '../features/voice/api/mutations';
import { useWorkspaceStore } from '../features/workspace';
import { overlayService } from '../native/overlay';
import { RootStackParamList } from '../navigation/types';
import {
  X,
  Bug,
  CheckSquare,
  Mic,
  StickyNote,
  Square,
  Play,
  RotateCcw,
  Pin,
  Calendar,
  Flag,
  Tag,
  Paperclip,
  Send,
  Plus,
  AlignLeft,
  ChevronDown,
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

/**
 * Phase L5 / Milestone M5 New Item Sheet:
 * Aligned with docs/03-screen-redesign-specs.md §5:
 * - Bottom sheet with detents (compact ≈ 45%, expanded ≈ 92%), grabber, glass/surface2 top.
 * - Top: segmented control Task · Bug · Sticky · Voice.
 * - Title field is the hero: large placeholder "What needs doing?", auto-focused, underline-free.
 * - "Add details" collapsed row → expands description.
 * - Keyboard accessory bar is the sole controller for properties: Due, Priority, Label, Mic + Create.
 * - Chosen values show as filled tonal chips under the title.
 */
export const CaptureModal: React.FC = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CaptureRouteProp>();
  const initialMode = (route.params?.initialMode as CaptureMode) ?? 'task';

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  // Form State
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Property states
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityValue>('MEDIUM');
  const [severity, setSeverity] = useState<SeverityValue>('MAJOR');
  const [stickyColor, setStickyColor] = useState('AMBER');
  const [isPinned, setIsPinned] = useState(false);

  // Popover selector states
  const [activePicker, setActivePicker] = useState<'due' | 'priority' | 'severity' | null>(null);

  // Voice recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordDurationMs, setRecordDurationMs] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState<'en-IN' | 'hi-IN' | 'auto'>('en-IN');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const createTask = useCreateTaskMutation(projectId);
  const createBug = useCreateBugMutation(projectId);
  const createSticky = useCreateStickyMutation(projectId);
  const createVoiceNote = useCreateVoiceNoteMutation();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
      if (sound) sound.unloadAsync().catch(() => {});
    };
  }, [recording, sound]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Microphone permission is required for voice capture.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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
      setErrorMessage(err.message || 'Failed to start recording.');
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
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to stop recording.');
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
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedUri }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to play audio.');
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

  const isSaving =
    createTask.isPending ||
    createBug.isPending ||
    createSticky.isPending ||
    createVoiceNote.isPending ||
    isUploadingAttachments;

  const isSubmitDisabled = isSaving || (mode === 'voice' ? !recordedUri : !title.trim());

  const handleSave = async () => {
    if (mode === 'voice') {
      if (!recordedUri) {
        setErrorMessage('Please record an audio clip before saving.');
        return;
      }
    } else {
      if (!title.trim()) {
        setErrorMessage('Please enter what needs doing.');
        return;
      }
    }

    setErrorMessage(null);

    try {
      let createdId: string | null = null;

      if (mode === 'bug') {
        const res: any = await createBug.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          severity,
          telemetry: {
            platform: Platform.OS,
            version: Platform.Version,
            appVersion: '0.1.0',
            package: 'com.samyukt.doit',
          },
        });
        createdId = res?.task?.id || res?.id || null;
      } else if (mode === 'sticky') {
        const fullBody = description.trim() ? `${title.trim()}\n${description.trim()}` : title.trim();
        await createSticky.mutateAsync({
          body: fullBody,
          color: stickyColor,
          pinned: isPinned,
        });
      } else if (mode === 'voice') {
        await createVoiceNote.mutateAsync({
          uri: recordedUri!,
          durationMs: recordDurationMs || 1000,
          language: voiceLanguage,
        });
      } else {
        const dueAtIso = dueDate ? new Date(dueDate).toISOString() : undefined;
        const res: any = await createTask.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueAtIso,
          priority,
        });
        createdId = res?.task?.id || res?.id || null;
      }

      if (createdId && attachments.length > 0) {
        setIsUploadingAttachments(true);
        for (const item of attachments) {
          try {
            const normalizedMime = !item.mimeType || item.mimeType === 'image/jpg' ? 'image/jpeg' : item.mimeType;
            const sizeBytes = item.sizeBytes && item.sizeBytes > 0 ? item.sizeBytes : 1024;
            const initRes = await http.post<{ uploadId: string; putUrl: string; key: string }>('/uploads/init', {
              contentType: normalizedMime,
              sizeBytes,
              purpose: mode === 'bug' ? 'BUG' : 'TASK',
            });
            const putTarget = initRes.putUrl.startsWith('/') ? `${http.getBaseUrl()}${initRes.putUrl}` : initRes.putUrl;
            await overlayService.uploadFile(item.uri, putTarget, normalizedMime);
            await http.post(`/uploads/${initRes.uploadId}/complete`, { taskId: createdId });
          } catch (uploadErr) {
            console.warn('[CaptureModal] Attachment upload error:', uploadErr);
          }
        }
        setIsUploadingAttachments(false);
      }

      navigation.goBack();
    } catch (err: any) {
      setIsUploadingAttachments(false);
      setErrorMessage(err.message || 'Failed to save.');
    }
  };

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.backdrop, { backgroundColor: colors.canvas }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Bottom sheet container */}
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface1 }]}>
          {/* Grabber Bar */}
          <View style={styles.grabberRow}>
            <View style={[styles.grabber, { backgroundColor: colors.surface3 }]} />
          </View>

          {/* Top Segmented Mode Control + Close */}
          <View style={[styles.topRow, { paddingHorizontal: spacing.screenMargin }]}>
            <View style={[styles.segmentedControl, { backgroundColor: colors.surface2, borderRadius: radius.pill }]}>
              <TouchableOpacity
                onPress={() => setMode('task')}
                style={[
                  styles.segmentBtn,
                  mode === 'task' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <CheckSquare size={13} color={mode === 'task' ? colors.accentText : colors.textTertiary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'task' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'task' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Task
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('bug')}
                style={[
                  styles.segmentBtn,
                  mode === 'bug' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <Bug size={13} color={mode === 'bug' ? colors.accentText : colors.textTertiary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'bug' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'bug' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Bug
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('sticky')}
                style={[
                  styles.segmentBtn,
                  mode === 'sticky' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <StickyNote size={13} color={mode === 'sticky' ? colors.accentText : colors.textTertiary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'sticky' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'sticky' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Sticky
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('voice')}
                style={[
                  styles.segmentBtn,
                  mode === 'voice' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <Mic size={13} color={mode === 'voice' ? colors.accentText : colors.textTertiary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'voice' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'voice' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Voice
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={[styles.closeCircle, { backgroundColor: colors.surface2 }]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss sheet"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Error notice */}
          {errorMessage ? (
            <View style={[styles.errorNotice, { backgroundColor: colors.danger + '18', marginHorizontal: spacing.screenMargin }]}>
              <Text variant="caption" color="danger">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: spacing.screenMargin, paddingTop: spacing.md, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {mode === 'voice' ? (
              /* Voice Recording Surface */
              <View style={styles.voiceSection}>
                <Text variant="h1" style={styles.timerDisplay}>
                  {formatTimer(recordDurationMs)}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing.lg }}>
                  {isRecording
                    ? 'Recording audio... Tap stop when finished'
                    : recordedUri
                    ? 'Voice memo ready. Tap Create to save.'
                    : 'Tap microphone to start speaking'}
                </Text>

                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[
                    styles.bigMicBtn,
                    {
                      backgroundColor: isRecording ? colors.danger : colors.accent,
                    },
                  ]}
                >
                  {isRecording ? <Square size={28} color="#FFF" /> : <Mic size={32} color={colors.accentOnPrimary} />}
                </TouchableOpacity>

                {recordedUri && !isRecording && (
                  <View style={[styles.voiceControlsRow, { gap: spacing.md, marginTop: spacing.lg }]}>
                    <Button
                      title={isPlaying ? 'Pause' : 'Play back'}
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
            ) : (
              /* Hero Title + Details */
              <View>
                {/* Hero Title Field: large placeholder, underline-free */}
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={
                    mode === 'bug'
                      ? 'What bug occurred?'
                      : mode === 'sticky'
                      ? 'Note thought or task...'
                      : 'What needs doing?'
                  }
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  style={[
                    styles.heroInput,
                    {
                      color: colors.textPrimary,
                      fontSize: 20,
                      fontWeight: '600',
                    },
                  ]}
                  multiline={mode === 'sticky'}
                />

                {/* Selected Property Chips directly under title */}
                <View style={[styles.activePropsRow, { gap: 6, marginVertical: spacing.sm }]}>
                  {dueDate && (
                    <Chip
                      label={dueDate}
                      selected
                      size="sm"
                      onClose={() => setDueDate(null)}
                      leadingIcon={<Calendar size={12} color={colors.accentText} />}
                    />
                  )}
                  {priority !== 'MEDIUM' && (
                    <Chip
                      label={priority}
                      selected
                      size="sm"
                      onClose={() => setPriority('MEDIUM')}
                      leadingIcon={<Flag size={12} color={colors.accentText} />}
                    />
                  )}
                  {mode === 'bug' && (
                    <Chip
                      label={severity}
                      selected
                      size="sm"
                      leadingIcon={<Bug size={12} color={colors.accentText} />}
                    />
                  )}
                </View>

                {/* Sticky Color picker */}
                {mode === 'sticky' && (
                  <View style={[styles.stickyColorsRow, { gap: 8, marginVertical: spacing.sm }]}>
                    {STICKY_COLORS.map((c) => (
                      <TouchableOpacity
                        key={c.value}
                        onPress={() => setStickyColor(c.value)}
                        style={[
                          styles.colorSwatch,
                          {
                            backgroundColor: c.hex,
                            transform: [{ scale: stickyColor === c.value ? 1.2 : 1 }],
                          },
                        ]}
                      />
                    ))}
                    <TouchableOpacity
                      onPress={() => setIsPinned(!isPinned)}
                      style={[
                        styles.pinPill,
                        {
                          backgroundColor: isPinned ? colors.accent : colors.surface2,
                          borderRadius: radius.pill,
                        },
                      ]}
                    >
                      <Pin size={12} color={isPinned ? colors.accentOnPrimary : colors.textSecondary} />
                      <Text
                        variant="caption"
                        style={{
                          marginLeft: 4,
                          fontSize: 11,
                          color: isPinned ? colors.accentOnPrimary : colors.textSecondary,
                        }}
                      >
                        Pin
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Collapsible Details Row */}
                {!showDetails ? (
                  <TouchableOpacity
                    onPress={() => setShowDetails(true)}
                    style={styles.addDetailsBtn}
                  >
                    <AlignLeft size={14} color={colors.textTertiary} />
                    <Text variant="caption" color="secondary" style={{ marginLeft: 6, fontWeight: '500' }}>
                      Add description or notes...
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add extra details, acceptance criteria, steps..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    style={[
                      styles.detailsInput,
                      {
                        backgroundColor: colors.surface2,
                        borderRadius: radius.md,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                )}
              </View>
            )}

            {mode !== 'voice' && (
              <View style={{ marginTop: spacing.md }}>
                <AttachmentSection
                  attachments={attachments}
                  onAddAttachment={(item) => setAttachments((prev) => [...prev, item])}
                  onRemoveAttachment={(idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                />
              </View>
            )}

            {/* Quick Popover Property Selectors */}
            {activePicker === 'due' && (
              <View style={[styles.miniPickerBox, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
                <Text variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '600' }}>
                  DUE DATE
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Chip
                    label="Today"
                    size="sm"
                    onPress={() => {
                      setDueDate(new Date().toISOString().split('T')[0] ?? null);
                      setActivePicker(null);
                    }}
                  />
                  <Chip
                    label="Tomorrow"
                    size="sm"
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setDueDate(d.toISOString().split('T')[0] ?? null);
                      setActivePicker(null);
                    }}
                  />
                  <Chip
                    label="Next Week"
                    size="sm"
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDueDate(d.toISOString().split('T')[0] ?? null);
                      setActivePicker(null);
                    }}
                  />
                </View>
              </View>
            )}

            {activePicker === 'priority' && (
              <View style={[styles.miniPickerBox, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
                <Text variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '600' }}>
                  PRIORITY
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as PriorityValue[]).map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="sm"
                      selected={priority === p}
                      onPress={() => {
                        setPriority(p);
                        setActivePicker(null);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {activePicker === 'severity' && (
              <View style={[styles.miniPickerBox, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
                <Text variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '600' }}>
                  SEVERITY
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'] as SeverityValue[]).map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="sm"
                      selected={severity === s}
                      onPress={() => {
                        setSeverity(s);
                        setActivePicker(null);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Keyboard Accessory Bar: Sole controller for properties & create */}
          <View style={[styles.accessoryBar, { backgroundColor: colors.surface2, borderTopColor: 'transparent' }]}>
            <View style={[styles.accessoryChips, { gap: 6 }]}>
              {mode === 'task' && (
                <>
                  <TouchableOpacity
                    onPress={() => setActivePicker(activePicker === 'due' ? null : 'due')}
                    style={[styles.propBtn, { backgroundColor: colors.surface3, borderRadius: radius.pill }]}
                  >
                    <Calendar size={13} color={colors.textSecondary} />
                    <Text variant="caption" color="secondary" style={styles.propBtnText}>
                      Due
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActivePicker(activePicker === 'priority' ? null : 'priority')}
                    style={[styles.propBtn, { backgroundColor: colors.surface3, borderRadius: radius.pill }]}
                  >
                    <Flag size={13} color={colors.textSecondary} />
                    <Text variant="caption" color="secondary" style={styles.propBtnText}>
                      Priority
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {mode === 'bug' && (
                <TouchableOpacity
                  onPress={() => setActivePicker(activePicker === 'severity' ? null : 'severity')}
                  style={[styles.propBtn, { backgroundColor: colors.surface3, borderRadius: radius.pill }]}
                >
                  <Bug size={13} color={colors.textSecondary} />
                  <Text variant="caption" color="secondary" style={styles.propBtnText}>
                    Severity
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Accent Create Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitDisabled}
              style={[
                styles.createBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.pill,
                  opacity: isSubmitDisabled ? 0.45 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create item"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.accentOnPrimary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    variant="caption"
                    style={{
                      color: colors.accentOnPrimary,
                      fontWeight: '700',
                      marginRight: 4,
                    }}
                  >
                    Create
                  </Text>
                  <Send size={13} color={colors.accentOnPrimary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
  },
  grabberRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 3,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorNotice: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  heroInput: {
    paddingVertical: 12,
    borderWidth: 0,
    textAlignVertical: 'top',
  },
  activePropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stickyColorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  addDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  detailsInput: {
    borderWidth: 0,
    marginTop: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    minHeight: 80,
  },
  miniPickerBox: {
    padding: 10,
    marginTop: 12,
  },
  accessoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0,
  },
  accessoryChips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  propBtnText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  bigMicBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  voiceControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
