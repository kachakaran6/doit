import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, Eye, FileText, Download } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../../theme/useTheme';
import { TaskAttachment } from '../../features/tasks/types';

interface AttachmentGalleryProps {
  title?: string;
  attachments?: TaskAttachment[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  title = 'ATTACHMENTS',
  attachments = [],
}) => {
  const { colors, spacing, radius, elevation } = useTheme();
  const [selectedAttachment, setSelectedAttachment] = useState<TaskAttachment | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDisplayUrl = (att: TaskAttachment): string | null => {
    return att.url || att.thumbUrl || null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          variant="caption"
          color="tertiary"
          style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 }}
        >
          {title}
        </Text>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Text variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
            {attachments.length}
          </Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {attachments.map((att, idx) => {
          const displayUrl = getDisplayUrl(att);
          const isImage = att.kind === 'IMAGE' || att.mimeType?.startsWith('image/');
          const isError = imageErrors[att.id];
          const isLoading = imageLoadingStates[att.id];

          return (
            <TouchableOpacity
              key={att.id || idx}
              activeOpacity={0.85}
              style={[
                styles.thumbnailCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  ...elevation.e1,
                },
              ]}
              onPress={() => {
                if (displayUrl) {
                  setSelectedAttachment(att);
                }
              }}
            >
              {isImage && displayUrl && !isError ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: displayUrl }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                    onLoadStart={() =>
                      setImageLoadingStates((prev) => ({ ...prev, [att.id]: true }))
                    }
                    onLoadEnd={() =>
                      setImageLoadingStates((prev) => ({ ...prev, [att.id]: false }))
                    }
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [att.id]: true }))
                    }
                  />
                  {isLoading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color={colors.accent} />
                    </View>
                  )}
                  {/* Tap to view hint overlay */}
                  <View style={styles.viewBadge}>
                    <Eye size={12} color="#FFF" />
                  </View>
                </View>
              ) : (
                <View style={styles.fileFallback}>
                  <FileText size={28} color={colors.textTertiary} />
                  <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 4 }}>
                    {att.mimeType || 'Attachment'}
                  </Text>
                </View>
              )}

              {/* Meta footer */}
              <View style={[styles.metaFooter, { borderTopColor: colors.border }]}>
                <Text variant="caption" color="secondary" numberOfLines={1} style={{ flex: 1, fontSize: 11 }}>
                  {att.storageKey?.split('/').pop() || `attachment_${idx + 1}`}
                </Text>
                {att.sizeBytes > 0 && (
                  <Text variant="caption" color="tertiary" style={{ fontSize: 10, marginLeft: 4 }}>
                    {formatFileSize(att.sizeBytes)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={Boolean(selectedAttachment)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAttachment(null)}
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.modalBackdrop}>
          <StatusBar backgroundColor="#0A0B0D" barStyle="light-content" />

          {/* Top Bar */}
          <View style={styles.modalTopBar}>
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ color: '#FFF', fontWeight: '700' }} numberOfLines={1}>
                {selectedAttachment?.storageKey?.split('/').pop() || 'Screenshot'}
              </Text>
              <Text variant="caption" style={{ color: '#9EA3AE', fontSize: 11 }}>
                {formatFileSize(selectedAttachment?.sizeBytes)} • {selectedAttachment?.mimeType || 'image/jpeg'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedAttachment(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Image View */}
          <View style={styles.modalImageContainer}>
            {selectedAttachment && getDisplayUrl(selectedAttachment) ? (
              <Image
                source={{ uri: getDisplayUrl(selectedAttachment)! }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  thumbnailCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#121417',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fileFallback: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  metaFooter: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#202227',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1E23',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
