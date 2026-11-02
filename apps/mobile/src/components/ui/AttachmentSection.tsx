import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, Image as ImageIcon, X, Paperclip } from 'lucide-react-native';
import { Text } from './Text';
import { useTheme } from '../../theme/useTheme';
import { overlayService } from '../../native/overlay';

export interface AttachmentItem {
  uri: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export interface AttachmentSectionProps {
  attachments: AttachmentItem[];
  onAddAttachment: (item: AttachmentItem) => void;
  onRemoveAttachment: (index: number) => void;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const { colors, spacing, radius } = useTheme();
  const [loading, setLoading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCaptureScreen = async () => {
    try {
      setLoading(true);
      const hasConsent = await overlayService.hasScreenshotPermission();
      if (!hasConsent) {
        const granted = await overlayService.requestScreenshotPermission();
        if (!granted) {
          Alert.alert('Permission Denied', 'Screen capture permission is required to take screenshots.');
          setLoading(false);
          return;
        }
      }

      const result = await overlayService.captureCleanScreenshot();
      onAddAttachment({
        uri: result.uri,
        name: result.name || `screenshot_${Date.now()}.jpg`,
        sizeBytes: result.sizeBytes,
        mimeType: result.mimeType || 'image/jpeg',
      });
    } catch (e: any) {
      Alert.alert('Capture Error', e?.message || 'Failed to capture screenshot');
    } finally {
      setLoading(false);
    }
  };

  const handlePickGallery = async () => {
    try {
      setLoading(true);
      const result = await overlayService.pickImageFromGallery();
      onAddAttachment({
        uri: result.uri,
        name: result.name || `image_${Date.now()}.jpg`,
        sizeBytes: result.sizeBytes,
        mimeType: result.mimeType || 'image/jpeg',
      });
    } catch (e: any) {
      if (e?.message !== 'User cancelled image selection') {
        Alert.alert('Selection Error', e?.message || 'Failed to select image');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Paperclip size={14} color={colors.textSecondary} />
          <Text variant="caption" style={[styles.title, { color: colors.textSecondary }]}>
            ATTACHMENTS ({attachments.length})
          </Text>
        </View>
        {loading && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
          ]}
          onPress={handleCaptureScreen}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Camera size={15} color={colors.accent} />
          <Text variant="caption" style={[styles.actionText, { color: colors.textPrimary }]}>
            Capture Screen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
          ]}
          onPress={handlePickGallery}
          disabled={loading}
          activeOpacity={0.7}
        >
          <ImageIcon size={15} color={colors.accent} />
          <Text variant="caption" style={[styles.actionText, { color: colors.textPrimary }]}>
            Choose Image
          </Text>
        </TouchableOpacity>
      </View>

      {attachments.length > 0 && (
        <View style={styles.attachmentsList}>
          {attachments.map((item, index) => (
            <View
              key={`${item.uri}-${index}`}
              style={[
                styles.attachmentItem,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              <View style={styles.metaCol}>
                <Text
                  variant="caption"
                  style={[styles.fileName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  {formatFileSize(item.sizeBytes)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveAttachment(index)}
                style={[styles.removeButton, { backgroundColor: colors.surface }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontWeight: '600',
  },
  attachmentsList: {
    marginTop: 10,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    gap: 10,
  },
  thumbnail: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontWeight: '600',
  },
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
