import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  leadingIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * P-01 Chip:
 * Dimensions: 32 tall, pill radius (999)
 * 5 States: rest, pressed (scale 0.97/90ms), focused, selected, disabled
 * Selected: filled L3 (surfaceOverlay) + accent text — NO accent borders!
 * Unselected: filled L2 (surfaceRaised) + textSecondary
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  count,
  leadingIcon,
  onPress,
  disabled = false,
}) => {
  const { colors, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  // Selected: filled L3 + accent text (04-COLOUR-AS-INFORMATION.md §4.2)
  // Unselected: filled L2 + textSecondary
  const bg = selected ? colors.surfaceOverlay : colors.surfaceRaised;
  const textColor = selected ? 'accent' : 'secondary';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={`${label}${count !== undefined ? `, ${count}` : ''}`}
        style={[
          styles.base,
          {
            height: 32,
            backgroundColor: bg,
            borderRadius: radius.pill, // 999
            paddingHorizontal: spacing.md,
            borderWidth: isFocused ? 1 : 0,
            borderColor: isFocused ? colors.accent : 'transparent',
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        {leadingIcon && <View style={{ marginRight: spacing.xs }}>{leadingIcon}</View>}
        <Text variant="label" color={textColor}>
          {label}
        </Text>
        {count !== undefined && (
          <View style={{ marginLeft: spacing.xs, opacity: 0.85 }}>
            <Text variant="caption" color={textColor}>
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
