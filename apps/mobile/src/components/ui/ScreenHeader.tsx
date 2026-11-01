import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { ChevronLeft } from 'lucide-react-native';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * ScreenHeader enforces consistent 24px screen headings, perfect horizontal alignment,
 * back button ergonomics, and optional right action buttons.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  badge,
  onBack,
  rightAction,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }, style]}>
      <View style={styles.leftRow}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.sm,
                marginRight: spacing.md,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={styles.titleColumn}>
          {subtitle && (
            <Text
              variant="caption"
              color="secondary"
              style={[styles.subtitle, { marginBottom: spacing.xs }]}
            >
              {subtitle}
            </Text>
          )}
          <View style={styles.titleWithBadge}>
            <Text variant="h1" numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
            {badge !== undefined && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                <Text variant="caption" color="secondary" style={styles.badgeText}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {rightAction && <View style={styles.rightActionWrapper}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rightActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});
