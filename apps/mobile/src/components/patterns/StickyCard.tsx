import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui';
import { Pin, ArrowRightCircle } from 'lucide-react-native';

export interface StickyCardProps {
  id: string;
  body: string;
  color?: string;
  isPinned?: boolean;
  convertedTaskId?: string | null;
  onPress?: () => void;
  onLongPress?: () => void;
  onConvert?: () => void;
}

export const StickyCard: React.FC<StickyCardProps> = ({
  id,
  body,
  color,
  isPinned = false,
  convertedTaskId,
  onPress,
  onLongPress,
  onConvert,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();

  // Deterministic tilt between -2deg and +2deg based on id hash
  const rotationDeg = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const val = (Math.abs(hash) % 40) / 10 - 2; // -2.0 to +1.9 deg
    return `${val.toFixed(1)}deg`;
  }, [id]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: isPinned ? colors.accent : colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          transform: [{ rotate: rotationDeg }],
          ...elevation.e2,
        },
      ]}
    >
      {/* Header: Pin status */}
      <View style={styles.topRow}>
        {isPinned ? (
          <Pin size={14} color={colors.accentText} />
        ) : (
          <View style={{ width: 14 }} />
        )}

        {convertedTaskId && (
          <View style={[styles.convertedTag, { backgroundColor: colors.accentContainer, borderRadius: radius.sm }]}>
            <ArrowRightCircle size={10} color={colors.accentText} />
            <Text variant="caption" color="accent" style={{ fontSize: 9, marginLeft: 2 }}>
              Task
            </Text>
          </View>
        )}
      </View>

      <Text variant="body" numberOfLines={6} style={{ marginTop: spacing.xs }}>
        {body}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
    margin: 4,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convertedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
