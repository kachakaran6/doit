import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, Vibration } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface KeyboardChipProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const KeyboardChip: React.FC<KeyboardChipProps> = ({
  label,
  value,
  icon,
  selected = false,
  onPress,
  accessibilityLabel,
}) => {
  const { colors, radius, spacing } = useTheme();
  const flashAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Vibration.vibrate(10);
    // 150 ms flash animation per §3.4
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 75,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 75,
        useNativeDriver: false,
      }),
    ]).start();

    onPress();
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [selected ? colors.accentSoft : colors.bgSubtle, colors.accentSoft],
  });

  const spokenLabel = accessibilityLabel || (value ? `${label}, ${value}` : label);

  return (
    <Animated.View style={{ backgroundColor, borderRadius: radius.sm }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={spokenLabel}
        style={[
          styles.chip,
          {
            borderColor: selected ? colors.accent : colors.border,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.sm + 2,
            paddingVertical: spacing.xs,
          },
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        {icon}
        <Text
          variant="caption"
          color={selected ? 'accent' : 'secondary'}
          style={icon ? { marginLeft: 4 } : undefined}
        >
          {value ? `${label}: ${value}` : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 32,
  },
});
