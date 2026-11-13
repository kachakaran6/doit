import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, Mic, Square, Play, Pause, Trash2, X, Check } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { AttachmentItem } from '../../../components/ui/AttachmentSection';

export interface AttachmentActionsProps {
  screenshot: AttachmentItem | null;
  onTakeScreenshot: () => void;
  onRemoveScreenshot: () => void;
  isCapturingScreenshot: boolean;

  isRecording: boolean;
  recordingDurationMs: number;
  recordedAudioUri: string | null;
  isPlayingAudio: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayAudio: () => void;
  onDeleteAudio: () => void;
}

export const AttachmentActions: React.FC<AttachmentActionsProps> = ({
  screenshot,
  onTakeScreenshot,
  onRemoveScreenshot,
  isCapturingScreenshot,
  isRecording,
  recordingDurationMs,
  recordedAudioUri,
  isPlayingAudio,
  onStartRecording,
  onStopRecording,
  onPlayAudio,
  onDeleteAudio,
}) => {
  const { colors, radius } = useTheme();

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 2 Side-by-Side Action Buttons */}
      <View style={styles.buttonRow}>
        {/* Screenshot Button */}
        <TouchableOpacity
          onPress={onTakeScreenshot}
          disabled={isCapturingScreenshot || Boolean(screenshot)}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface2,
              borderColor: screenshot ? colors.accent : colors.hairline,
              borderRadius: radius.md,
            },
            Boolean(screenshot) && { backgroundColor: colors.accentSoft },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Capture Screenshot"
        >
          {isCapturingScreenshot ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : screenshot ? (
            <Check size={15} color={colors.accentText} strokeWidth={2.5} />
          ) : (
            <Camera size={15} color={colors.textSecondary} strokeWidth={2} />
          )}
          <Text
            variant="body"
            style={[
              styles.buttonText,
              {
                color: screenshot ? colors.accentText : colors.textSecondary,
                fontWeight: screenshot ? '600' : '500',
              },
            ]}
          >
            {screenshot ? 'Screenshot added' : 'Screenshot'}
          </Text>
        </TouchableOpacity>

        {/* Record Voice Button */}
        <TouchableOpacity
          onPress={isRecording ? onStopRecording : onStartRecording}
          disabled={Boolean(recordedAudioUri) && !isRecording}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface2,
              borderColor: isRecording
                ? colors.danger
                : recordedAudioUri
                ? colors.accent
                : colors.hairline,
              borderRadius: radius.md,
            },
            isRecording && { backgroundColor: colors.danger + '18' },
            Boolean(recordedAudioUri) && !isRecording && { backgroundColor: colors.accentSoft },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Record Voice"
        >
          {isRecording ? (
            <Square size={13} color={colors.danger} fill={colors.danger} />
          ) : recordedAudioUri ? (
            <Check size={15} color={colors.accentText} strokeWidth={2.5} />
          ) : (
            <Mic size={15} color={colors.textSecondary} strokeWidth={2} />
          )}
          <Text
            variant="body"
            style={[
              styles.buttonText,
              {
                color: isRecording
                  ? colors.danger
                  : recordedAudioUri
                  ? colors.accentText
                  : colors.textSecondary,
                fontWeight: isRecording || recordedAudioUri ? '600' : '500',
              },
            ]}
          >
            {isRecording ? 'Stop recording' : recordedAudioUri ? 'Audio attached' : 'Record voice'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screenshot Preview Chip (when screenshot is attached) */}
      {screenshot && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.hairline,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.previewLeft}>
            <Image source={{ uri: screenshot.uri }} style={[styles.thumbnail, { borderRadius: radius.xs }]} />
            <View style={styles.previewInfo}>
              <Text variant="caption" numberOfLines={1} style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {screenshot.name || 'Screenshot'}
              </Text>
              <Text variant="caption" style={{ color: colors.textTertiary, fontSize: 11 }}>
                {(screenshot.sizeBytes / 1024).toFixed(0)} KB · Ready to upload
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onRemoveScreenshot}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.removeButton, { backgroundColor: colors.surface3, borderRadius: radius.pill }]}
          >
            <X size={13} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      {/* Live Voice Recording Strip (when recording is in progress) */}
      {isRecording && (
        <View
          style={[
            styles.recordingStrip,
            {
              backgroundColor: colors.danger + '14',
              borderColor: colors.danger + '40',
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.recordingLeft}>
            <View style={[styles.pulsingDot, { backgroundColor: colors.danger, borderRadius: radius.pill }]} />
            <Text variant="body" style={[styles.recordingTimer, { color: colors.danger }]}>
              {formatTimer(recordingDurationMs)}
            </Text>
            <Text variant="caption" style={{ color: colors.textTertiary }}>
              Recording...
            </Text>
          </View>
          <TouchableOpacity
            onPress={onStopRecording}
            style={[styles.stopButton, { backgroundColor: colors.danger, borderRadius: radius.sm }]}
            activeOpacity={0.8}
          >
            <Square size={11} color="#FFF" fill="#FFF" />
            <Text style={styles.stopButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Audio Playback & Review Strip (when audio clip is recorded) */}
      {recordedAudioUri && !isRecording && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.hairline,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.previewLeft}>
            <TouchableOpacity
              onPress={onPlayAudio}
              style={[styles.playButton, { backgroundColor: colors.accent, borderRadius: radius.pill }]}
              activeOpacity={0.8}
            >
              {isPlayingAudio ? (
                <Pause size={13} color={colors.accentOnPrimary} fill={colors.accentOnPrimary} />
              ) : (
                <Play size={13} color={colors.accentOnPrimary} fill={colors.accentOnPrimary} />
              )}
            </TouchableOpacity>
            <View style={styles.previewInfo}>
              <Text variant="caption" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                Voice Memo
              </Text>
              <Text variant="caption" style={{ color: colors.textTertiary, fontSize: 11 }}>
                {formatTimer(recordingDurationMs || 3000)} · Tap to review
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onDeleteAudio}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.removeButton, { backgroundColor: colors.surface3, borderRadius: radius.pill }]}
          >
            <Trash2 size={13} color={colors.danger} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderWidth: 1,
    gap: 6,
    minHeight: 40,
  },
  buttonText: {
    fontSize: 13,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    marginTop: 8,
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  thumbnail: {
    width: 32,
    height: 32,
    backgroundColor: '#000',
  },
  previewInfo: {
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
  },
  recordingTimer: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
