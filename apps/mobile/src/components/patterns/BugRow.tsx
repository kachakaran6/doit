import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { AlertTriangle, Smartphone, Paperclip } from 'lucide-react-native';

export interface BugRowProps {
  id: string;
  humanId: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
  status: 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';
  deviceInfo?: string;
  hasAttachment?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const BugRow: React.FC<BugRowProps> = ({
  humanId,
  title,
  severity,
  status,
  deviceInfo,
  hasAttachment,
  onPress,
  onLongPress,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();

  const severityColor =
    severity === 'CRITICAL'
      ? colors.danger
      : severity === 'MAJOR'
      ? colors.warning
      : severity === 'MINOR'
      ? colors.accentText
      : colors.textTertiary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          ...elevation.e1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
          <Text variant="caption" color="secondary" style={styles.humanId}>
            {humanId}
          </Text>
          <Text
            variant="caption"
            style={{ color: severityColor, fontWeight: '700', marginLeft: spacing.xs }}
          >
            {severity}
          </Text>
        </View>
        <Chip label={status} selected={status === 'RESOLVED' || status === 'VERIFIED'} />
      </View>

      <Text variant="bodyStrong" numberOfLines={2} style={{ marginTop: spacing.xs }}>
        {title}
      </Text>

      {/* Meta: device info + attachment badge */}
      {(deviceInfo || hasAttachment) && (
        <View style={[styles.metaRow, { gap: spacing.sm, marginTop: spacing.xs }]}>
          {deviceInfo && (
            <View style={styles.metaItem}>
              <Smartphone size={12} color={colors.textTertiary} />
              <Text variant="caption" color="tertiary" style={{ marginLeft: 4 }}>
                {deviceInfo}
              </Text>
            </View>
          )}

          {hasAttachment && (
            <View style={styles.metaItem}>
              <Paperclip size={12} color={colors.textTertiary} />
              <Text variant="caption" color="tertiary" style={{ marginLeft: 2 }}>
                Screenshot
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  humanId: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
