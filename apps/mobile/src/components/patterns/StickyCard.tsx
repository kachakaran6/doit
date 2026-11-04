import React from 'react';
import { View, StyleSheet, Pressable, DimensionValue } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui';
import { Pin, ArrowRightCircle } from 'lucide-react-native';
import { accents } from '@doit/tokens';

export interface StickyCardProps {
  id: string;
  body: string;
  color?: string;
  isPinned?: boolean;
  convertedTaskId?: string | null;
  onPress?: () => void;
  onLongPress?: () => void;
  onConvert?: () => void;
  width?: DimensionValue;
  height?: DimensionValue;
  numberOfLines?: number;
}

export const StickyCard: React.FC<StickyCardProps> = ({
  id,
  body,
  color = 'AMBER',
  isPinned = false,
  convertedTaskId,
  onPress,
  onLongPress,
  onConvert,
  width,
  height,
  numberOfLines = 3,
}) => {
  const { colors, spacing, radius, mode } = useTheme();

  // Token-based sticky tints: 18% alpha on dark, solid pastel soft tints on light
  const tintColor = React.useMemo(() => {
    const c = (color || 'AMBER').toUpperCase();
    if (c === 'INDIGO') return accents.indigo.primary;
    if (c === 'TEAL') return accents.teal.primary;
    if (c === 'ROSE') return accents.rose.primary;
    if (c === 'VIOLET') return accents.violet.primary;
    return accents.amber.primary;
  }, [color]);

  const cardBg = mode === 'dark' ? `${tintColor}22` : `${tintColor}18`;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderRadius: radius.lg,
          padding: spacing.md,
          width,
          height,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Sticky note: ${body}`}
    >
      <View style={styles.topRow}>
        <View style={[styles.tintBar, { backgroundColor: tintColor }]} />
        <View style={styles.topActions}>
          {isPinned && <Pin size={13} color={tintColor} />}
          {convertedTaskId && (
            <View style={[styles.convertedTag, { backgroundColor: `${colors.success}26`, borderRadius: radius.pill }]}>
              <ArrowRightCircle size={10} color={colors.success} />
              <Text variant="caption" style={{ color: colors.success, fontSize: 10, marginLeft: 3, fontWeight: '600' }}>
                Task
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text
        variant="body"
        numberOfLines={numberOfLines}
        style={{ marginTop: spacing.sm, color: colors.textPrimary, lineHeight: 20 }}
      >
        {body}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    justifyContent: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tintBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  convertedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
