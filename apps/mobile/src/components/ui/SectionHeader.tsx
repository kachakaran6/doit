import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  count?: number;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * SectionHeader standardizes 18-20px headings across lists, feeds, and dashboards.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  actionText,
  onAction,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.sm, marginTop: spacing.lg }, style]}>
      <View style={styles.titleRow}>
        <Text variant="h2" style={styles.titleText}>
          {title}
        </Text>
        {count !== undefined && (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: colors.surfaceRaised,
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
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text variant="label" color="accent" style={styles.actionText}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionText: {
    fontWeight: '500',
  },
});
