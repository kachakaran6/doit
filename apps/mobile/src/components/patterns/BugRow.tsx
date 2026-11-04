import React from 'react';
import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui';
import { Bug, Smartphone, Image as ImageIcon } from 'lucide-react-native';

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
  reporter,
  createdAt,
  onPress,
  onLongPress,
}) => {
  const { colors, spacing, radius } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const severityColor =
    severity === 'CRITICAL'
      ? colors.danger
      : severity === 'MAJOR'
      ? colors.warning
      : severity === 'MINOR'
      ? colors.warning
      : colors.textTertiary;

  const severityBg =
    severity === 'CRITICAL'
      ? colors.danger + '18'
      : severity === 'MAJOR'
      ? colors.warning + '18'
      : severity === 'MINOR'
      ? colors.warning + '18'
      : colors.surface2;

  const isResolved = status === 'RESOLVED' || status === 'VERIFIED';
  const statusColor = isResolved ? colors.success : colors.accentText;
  const statusBg = isResolved ? colors.success + '18' : colors.surface2;

  // Format relative time if given
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginVertical: 4 }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface1,
            borderRadius: radius.lg,
            padding: spacing.md,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${humanId} ${title}`}
      >
        {/* Left: 48px rounded 10 screenshot thumbnail or tonal icon */}
        <View
          style={[
            styles.thumbnailBox,
            {
              backgroundColor: colors.surface2,
              borderRadius: 10,
            },
          ]}
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : hasAttachment ? (
            <ImageIcon size={20} color={colors.accentText} />
          ) : (
            <Bug size={20} color={severityColor} />
          )}
        </View>

        {/* Center: Info */}
        <View style={styles.contentCol}>
          {/* Top meta row */}
          <View style={styles.topMetaRow}>
            <Text variant="caption" color="secondary" style={styles.humanId}>
              {humanId}
            </Text>
            {formattedTime ? (
              <Text variant="caption" color="tertiary" style={styles.dotSeparator}>
                • {formattedTime}
              </Text>
            ) : null}
            {reporter ? (
              <Text variant="caption" color="tertiary" style={styles.dotSeparator}>
                • {reporter}
              </Text>
            ) : null}
          </View>

          {/* Title */}
          <Text variant="bodyStrong" numberOfLines={2} style={styles.titleText}>
            {title}
          </Text>

          {/* Bottom badge row: severity + device */}
          <View style={styles.bottomMetaRow}>
            <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <Text variant="caption" style={{ color: severityColor, fontWeight: '600', fontSize: 11 }}>
                {severity}
              </Text>
            </View>

            {deviceInfo ? (
              <View style={[styles.deviceBadge, { backgroundColor: colors.surface2 }]}>
                <Smartphone size={11} color={colors.textTertiary} />
                <Text
                  variant="caption"
                  color="tertiary"
                  numberOfLines={1}
                  style={{ marginLeft: 3, fontSize: 11, maxWidth: 120 }}
                >
                  {deviceInfo}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Right: State badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text variant="caption" style={{ color: statusColor, fontWeight: '600', fontSize: 11 }}>
            {status === 'IN_PROGRESS' ? 'In Progress' : status === 'RESOLVED' ? 'Resolved' : status === 'VERIFIED' ? 'Verified' : 'Triaged'}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailImage: {
    width: 48,
    height: 48,
  },
  contentCol: {
    flex: 1,
    marginRight: 8,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  humanId: {
    fontWeight: '600',
    fontSize: 12,
  },
  dotSeparator: {
    marginLeft: 4,
    fontSize: 11,
  },
  titleText: {
    marginVertical: 2,
    lineHeight: 18,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
