import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  count?: number;
  actionText?: string;
  onAction?: () => void;
  eyebrow?: boolean;
}

/**
 * P-01 SectionHeader:
 * - Eyebrow or Heading title
 * - Count pill: 20 tall, radius 10, L2 (surfaceRaised) background
 * - Optional action link in accent text (04-COLOUR-AS-INFORMATION.md §4.2)
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  actionText,
  onAction,
  eyebrow = true,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.sm, marginTop: spacing.lg }]}>
      <View style={styles.titleRow}>
        <Text
          variant={eyebrow ? 'label' : 'h2'}
          color={eyebrow ? 'secondary' : 'primary'}
          style={eyebrow ? styles.eyebrowText : undefined}
        >
          {eyebrow ? title.toUpperCase() : title}
        </Text>

        {count !== undefined && (
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: colors.surfaceRaised, // L2
                borderRadius: radius.pill,
                marginLeft: spacing.sm,
              },
            ]}
          >
            <Text variant="caption" color="secondary" style={styles.countText}>
              {count}
            </Text>
          </View>
        )}
      </View>

      {actionText && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text variant="label" color="accent">
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  countPill: {
    height: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
});
