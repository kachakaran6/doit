import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string | number;
  onBack?: () => void;
  trailing?: React.ReactNode;
  rightAction?: React.ReactNode; // Backward compatibility alias
}

/**
 * P-02 ScreenHeader:
 * 06-COMPOSITION.md §6.8
 * - Eyebrow: textMuted, project key + name
 * - Title: h1 30/600, tracking -0.6
 * - Subtitle: bodySmall 13, textSecondary — human words/count
 * - Trailing: segmented control, avatar, or single button centre-aligned with the title block
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  eyebrow,
  subtitle,
  badge,
  onBack,
  trailing,
  rightAction,
}) => {
  const { colors, spacing, radius } = useTheme();
  const trailingContent = trailing || rightAction;

  return (
    <View style={[styles.container, { marginBottom: spacing.lg, marginTop: spacing.xs }]}>
      <View style={styles.leftRow}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surfaceRaised, // L2
                borderRadius: radius.sm,
                marginRight: spacing.md,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.titleColumn}>
          {eyebrow && (
            <Text variant="eyebrow" color="muted" style={{ marginBottom: 2 }}>
              {eyebrow.toUpperCase()}
            </Text>
          )}

          <View style={styles.titleRow}>
            <Text variant="h1" color="primary">
              {title}
            </Text>

            {badge !== undefined && (
              <View
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: colors.surfaceRaised,
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

          {subtitle && (
            <Text variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Trailing slot centre-aligned with the title block */}
      {trailingContent && (
        <View style={styles.trailingContainer}>
          {trailingContent}
        </View>
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
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    height: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  trailingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
