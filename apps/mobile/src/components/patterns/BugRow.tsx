import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui';
import { Smartphone, Image as ImageIcon } from 'lucide-react-native';

export interface BugRowProps {
  id: string;
  humanId: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
  status: 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';
  deviceInfo?: string;
  hasAttachment?: boolean;
  thumbnailUrl?: string | null;
  reporter?: string;
  createdAt?: string;
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
  thumbnailUrl,
  createdAt,
  onPress,
  onLongPress,
}) => {
  const { colors, radius } = useTheme();

  const severityColor =
    severity === 'CRITICAL'
      ? colors.danger
      : severity === 'MAJOR'
      ? colors.warning
      : severity === 'MINOR'
      ? '#EAB308'
      : colors.textTertiary;

  const severityBg =
    severity === 'CRITICAL'
      ? colors.danger + '18'
      : severity === 'MAJOR'
      ? colors.warning + '18'
      : severity === 'MINOR'
      ? '#EAB30818'
      : colors.surface2;

  const isResolved = status === 'RESOLVED' || status === 'VERIFIED';

  const formattedTime = React.useMemo(() => {
    if (!createdAt) return '';
    try {
      const diffMs = Date.now() - new Date(createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  }, [createdAt]);

  const statusLabel =
    status === 'IN_PROGRESS'
      ? 'In Progress'
      : status === 'RESOLVED'
      ? 'Resolved'
      : status === 'VERIFIED'
      ? 'Verified'
      : 'Triaged';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.surface2 : colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${humanId}: ${title}. Severity: ${severity}. Status: ${status}`}
    >
      {/* Left indicator / thumbnail */}
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={[styles.thumbnail, { borderRadius: radius.xs }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.dotBox,
            {
              backgroundColor: severityBg,
              borderRadius: radius.xs,
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: severityColor }]} />
        </View>
      )}

      {/* Main content */}
      <View style={styles.centerCol}>
        {/* Top metadata line */}
        <View style={styles.topMeta}>
          <Text variant="caption" style={[styles.humanId, { color: colors.textSecondary }]}>
            {humanId}
          </Text>
          {formattedTime ? (
            <Text variant="caption" color="tertiary" style={styles.metaSub}>
              • {formattedTime}
            </Text>
          ) : null}
          {deviceInfo ? (
            <View style={styles.deviceRow}>
              <Smartphone size={10} color={colors.textTertiary} />
              <Text variant="caption" color="tertiary" numberOfLines={1} style={styles.deviceText}>
                {deviceInfo}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <Text
          variant="body"
          numberOfLines={2}
          style={[
            styles.title,
            { color: colors.textPrimary },
            isResolved ? { opacity: 0.55, textDecorationLine: 'line-through' } : undefined,
          ]}
        >
          {title}
        </Text>
      </View>

      {/* Right: compact severity & status */}
      <View style={styles.rightCol}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isResolved ? colors.success + '18' : colors.surface2,
            },
          ]}
        >
          <Text
            variant="caption"
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: isResolved ? colors.success : colors.textSecondary,
            }}
          >
            {statusLabel}
          </Text>
        </View>

        {hasAttachment && !thumbnailUrl ? (
          <ImageIcon size={12} color={colors.textTertiary} style={{ marginTop: 4 }} />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  thumbnail: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  dotBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerCol: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 2,
  },
  humanId: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaSub: {
    fontSize: 11,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  deviceText: {
    fontSize: 10,
    maxWidth: 90,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
