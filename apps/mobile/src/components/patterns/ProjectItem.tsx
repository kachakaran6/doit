import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui/Text';
import { Folder, ChevronRight } from 'lucide-react-native';

export interface ProjectItemProps {
  id: string;
  name: string;
  keyName: string;
  taskCount?: number;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Standardized Project item row matching Linear project lists.
 */
export const ProjectItem: React.FC<ProjectItemProps> = ({
  id,
  name,
  keyName,
  taskCount,
  isSelected = false,
  onPress,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.surfaceRaised : colors.surface,
          borderColor: isSelected ? colors.borderStrong : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          marginBottom: spacing.xs,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Project ${name}`}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.sm,
              marginRight: spacing.md,
            },
          ]}
        >
          <Folder size={16} color={isSelected ? colors.accentText : colors.textSecondary} />
        </View>

        <View style={styles.textWrapper}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="caption" color="tertiary" style={{ marginTop: 1 }}>
            {keyName}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {taskCount !== undefined && (
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.pill,
                marginRight: spacing.sm,
              },
            ]}
          >
            <Text variant="caption" color="secondary" style={styles.countText}>
              {taskCount}
            </Text>
          </View>
        )}
        <ChevronRight size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textWrapper: {
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
