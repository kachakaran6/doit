import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useTheme } from '../../../theme/useTheme';
import { useWorkspaceStore, useProjectsQuery } from '../../workspace';
import { useCreateTaskMutation } from '../../tasks/api/mutations';
import { useCreateBugMutation } from '../../bugs/api/mutations';
import { useCreateVoiceNoteMutation } from '../../voice/api/mutations';
import { http } from '../../../lib/http';
import { overlayService } from '../../../native/overlay';
import { AttachmentItem } from '../../../components/ui/AttachmentSection';

import { QuickCaptureHeader } from './QuickCaptureHeader';
import { CaptureTypeSelector, CaptureType } from './CaptureTypeSelector';
import { CaptureDescriptionInput } from './CaptureDescriptionInput';
import { ProjectSelector, ProjectItem } from './ProjectSelector';
import { AssigneeSelector, MemberItem } from './AssigneeSelector';
import { AttachmentActions } from './AttachmentActions';
import { CaptureFooter } from './CaptureFooter';

export interface QuickCaptureModalProps {
  initialMode?: 'task' | 'bug' | 'voice' | 'sticky';
  onDismiss?: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  initialMode = 'task',
  onDismiss,
}) => {
  const navigation = useNavigation();
  const { colors, radius, resolvedTheme } = useTheme();

  // Mode: task or bug (unified primary modes)
  const [mode, setMode] = useState<CaptureType>(initialMode === 'bug' ? 'bug' : 'task');

  // Form State
  const [description, setDescription] = useState('');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshot, setScreenshot] = useState<AttachmentItem | null>(null);

  // Audio recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Workspace & Project state
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const { data: rawProjects = [], isLoading: isLoadingProjects } = useProjectsQuery(activeWorkspace?.id);
  const projects: ProjectItem[] = rawProjects.map((p: any) => ({ id: p.id, name: p.name }));

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<MemberItem[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<string | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Auto-resolve project preselection
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setSelectedProjectId(null);
      return;
    }

    if (selectedProjectId && projects.some((p) => p.id === selectedProjectId)) {
      return;
    }

    if (activeProject?.id && projects.some((p) => p.id === activeProject.id)) {
      setSelectedProjectId(activeProject.id);
      return;
    }

    if (projects.length === 1 && projects[0]) {
      setSelectedProjectId(projects[0].id);
      return;
    }

    // Try last used project preference
    if (activeWorkspace?.id) {
      http
        .get<any>(`/me/quick-capture-preferences?workspaceId=${activeWorkspace.id}`)
        .then((prefs) => {
          if (!prefs) return;
          const allowed = new Set(projects.map((p) => p.id));
          const preferred = prefs.rememberLastProject
            ? prefs.lastProjectId || prefs.defaultProjectId
            : prefs.defaultProjectId;
          if (preferred && allowed.has(preferred)) {
            setSelectedProjectId(preferred);
          }
        })
        .catch(() => {});
    }
  }, [activeWorkspace?.id, projects, activeProject?.id]);

  // Fetch project members whenever selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'default') {
      setProjectMembers([]);
      setSelectedAssigneeId(null);
      setDefaultAssigneeId(null);
      return;
    }

    let cancelled = false;
    setIsLoadingMembers(true);
    http
      .get<any>(`/projects/${selectedProjectId}/members`)
      .then((res) => {
        if (cancelled || !res) return;
        const members: MemberItem[] = (res.members || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          avatarUrl: m.avatarUrl,
        }));
        setProjectMembers(members);

        const defId = res.defaultAssigneeId || null;
        setDefaultAssigneeId(defId);
        if (defId && members.some((m) => m.id === defId)) {
          setSelectedAssigneeId(defId);
        } else if (members.length > 0) {
          setSelectedAssigneeId(members[0]?.id ?? null);
        } else {
          setSelectedAssigneeId(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjectMembers([]);
          setSelectedAssigneeId(null);
          setDefaultAssigneeId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMembers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
      if (sound) sound.unloadAsync().catch(() => {});
    };
  }, [recording, sound]);

  // Mutations
  const pId = selectedProjectId || activeProject?.id || projects[0]?.id || 'default';
  const createTask = useCreateTaskMutation(pId);
  const createBug = useCreateBugMutation(pId);
  const createVoiceNote = useCreateVoiceNoteMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close handler
  const handleClose = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    } else {
      navigation.goBack();
    }
  }, [navigation, onDismiss]);

  // Screenshot capture handler
  const handleTakeScreenshot = async () => {
    try {
      setIsCapturingScreenshot(true);
      const hasConsent = await overlayService.hasScreenshotPermission();
      if (!hasConsent) {
        const granted = await overlayService.requestScreenshotPermission();
        if (!granted) {
          Alert.alert('Permission Denied', 'Screen capture permission is required to take screenshots.');
          setIsCapturingScreenshot(false);
          return;
        }
      }

      const result = await overlayService.captureCleanScreenshot();
      setScreenshot({
        uri: result.uri,
        name: result.name || `screenshot_${Date.now()}.jpg`,
        sizeBytes: result.sizeBytes || 1024,
        mimeType: result.mimeType || 'image/jpeg',
      });
    } catch (e: any) {
      Alert.alert('Capture Error', e?.message || 'Failed to capture screenshot');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone Permission', 'Microphone permission is required to record voice notes.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setRecordedAudioUri(null);
      setRecordingDurationMs(0);

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        setRecordingDurationMs(Date.now() - startTime);
      }, 200);
    } catch (err: any) {
      Alert.alert('Recording Error', err?.message || 'Could not start audio recording.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;
    try {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedAudioUri(uri);
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err: any) {
      Alert.alert('Recording Error', err?.message || 'Could not stop recording.');
    }
  };

  const handlePlayAudio = async () => {
    if (!recordedAudioUri) return;
    try {
      if (sound) {
        if (isPlayingAudio) {
          await sound.pauseAsync();
          setIsPlayingAudio(false);
        } else {
          await sound.playAsync();
          setIsPlayingAudio(true);
        }
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedAudioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlayingAudio(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (sound) {
      await sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setRecordedAudioUri(null);
    setRecordingDurationMs(0);
    setIsPlayingAudio(false);
    setIsRecording(false);
  };

  // Submission validation
  const isSubmitDisabled =
    !description.trim() ||
    !selectedProjectId ||
    selectedProjectId === 'default' ||
    !selectedAssigneeId ||
    isSubmitting;

  // Submit handler
  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      setIsSubmitting(true);
      let createdId: string | null = null;

      if (mode === 'bug') {
        const res: any = await createBug.mutateAsync({
          title: description.trim(),
          description: description.trim(),
          severity: 'MAJOR',
          projectId: selectedProjectId || undefined,
          assigneeId: selectedAssigneeId || undefined,
          telemetry: {
            platform: Platform.OS,
            version: Platform.Version,
            appVersion: '0.1.0',
            package: 'com.samyukt.doit',
          },
        });
        createdId = res?.task?.id || res?.id || null;
      } else {
        const res: any = await createTask.mutateAsync({
          title: description.trim(),
          description: description.trim(),
          projectId: selectedProjectId || undefined,
          assigneeId: selectedAssigneeId || undefined,
          priority: 'MEDIUM',
        });
        createdId = res?.task?.id || res?.id || null;
      }

      // Upload screenshot if attached
      if (createdId && screenshot) {
        try {
          const normalizedMime =
            !screenshot.mimeType || screenshot.mimeType === 'image/jpg'
              ? 'image/jpeg'
              : screenshot.mimeType;
          const sizeBytes = screenshot.sizeBytes && screenshot.sizeBytes > 0 ? screenshot.sizeBytes : 1024;
          const initRes = await http.post<{ uploadId: string; putUrl: string; key: string }>(
            '/uploads/init',
            {
              contentType: normalizedMime,
              sizeBytes,
              purpose: mode === 'bug' ? 'BUG' : 'TASK',
            }
          );
          const putTarget = initRes.putUrl.startsWith('/')
            ? `${http.getBaseUrl()}${initRes.putUrl}`
            : initRes.putUrl;
          await overlayService.uploadFile(screenshot.uri, putTarget, normalizedMime);
          await http.post(`/uploads/${initRes.uploadId}/complete`, { taskId: createdId });
        } catch (uploadErr) {
          console.warn('[QuickCapture] Screenshot upload error:', uploadErr);
        }
      }

      // Attach voice note if recorded
      if (recordedAudioUri) {
        try {
          await createVoiceNote.mutateAsync({
            uri: recordedAudioUri,
            durationMs: recordingDurationMs || 3000,
            language: 'en-IN',
          });
        } catch (voiceErr) {
          console.warn('[QuickCapture] Voice note upload error:', voiceErr);
        }
      }

      // Save preference for last used project
      if (activeWorkspace?.id && selectedProjectId && selectedProjectId !== 'default') {
        http
          .put('/me/quick-capture-preferences', {
            workspaceId: activeWorkspace.id,
            lastProjectId: selectedProjectId,
          })
          .catch(() => {});
      }

      handleClose();
    } catch (err: any) {
      Alert.alert('Submit Failed', err?.message || 'Failed to submit capture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(screenWidth - 32, 400);

  const scrim = resolvedTheme === 'dark' ? 'rgba(5,6,10,0.78)' : 'rgba(16,18,28,0.46)';

  return (
    <View style={[styles.backdrop, { backgroundColor: scrim }]}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.modalCard,
              {
                width: modalWidth,
                backgroundColor: colors.surface1,
                borderColor: colors.accent,
                borderRadius: 28,
              },
            ]}
          >
            <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardContent}
            >
              <QuickCaptureHeader onClose={handleClose} />

              {/* Task / Bug Segmented Selector */}
              <CaptureTypeSelector type={mode} onChangeType={setMode} />

              {/* Multiline Description Input */}
              <CaptureDescriptionInput
                value={description}
                onChangeText={setDescription}
                placeholder="What do you want to capture?"
              />

              {/* Project Dropdown */}
              <ProjectSelector
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                isLoading={isLoadingProjects}
              />

              {/* Assignee Dropdown */}
              <AssigneeSelector
                members={projectMembers}
                selectedAssigneeId={selectedAssigneeId}
                defaultAssigneeId={defaultAssigneeId}
                onSelectAssignee={setSelectedAssigneeId}
                isLoading={isLoadingMembers}
              />

              {/* Attachments: Screenshot & Voice Recording */}
              <AttachmentActions
                screenshot={screenshot}
                onTakeScreenshot={handleTakeScreenshot}
                onRemoveScreenshot={() => setScreenshot(null)}
                isCapturingScreenshot={isCapturingScreenshot}
                isRecording={isRecording}
                recordingDurationMs={recordingDurationMs}
                recordedAudioUri={recordedAudioUri}
                isPlayingAudio={isPlayingAudio}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onPlayAudio={handlePlayAudio}
                onDeleteAudio={handleDeleteAudio}
              />

              {/* Footer: Cancel & Submit */}
              <CaptureFooter
                onCancel={handleClose}
                onSubmit={handleSubmit}
                isSubmitDisabled={isSubmitDisabled}
                isSubmitting={isSubmitting}
              />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    borderWidth: 1.5,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 18,
    overflow: 'hidden',
  },
  accentBar: {
    height: 6,
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
});
