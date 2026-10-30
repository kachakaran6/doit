import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  leadingIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Use Chip for compact filter options, tags, or label pills with selectable state.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  count,
  leadingIcon,
  onPress,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  const bg = selected ? colors.accentSoft : colors.bgSubtle;
  const borderColor = selected ? colors.accent : colors.border;
  const textColor = selected ? 'accent' : 'secondary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}${count !== undefined ? `, ${count}` : ''}`}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
        },
        style,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      {leadingIcon}
      <Text
        variant="label"
        color={textColor}
        style={leadingIcon ? { marginLeft: spacing.xs } : undefined}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          variant="caption"
          color={textColor}
          style={{ marginLeft: spacing.xs, opacity: 0.8 }}
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
