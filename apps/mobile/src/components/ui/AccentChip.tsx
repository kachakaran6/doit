import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface AccentChipProps {
  label: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * P-01 AccentChip:
 * Dimensions: 32 tall, pill radius (999)
 * 12px colour swatch + label
 * Selected: filled L3 (surfaceOverlay) + accent text
 * Unselected: filled L2 (surfaceRaised) + textSecondary
 */
export const AccentChip: React.FC<AccentChipProps> = ({
  label,
  color,
  selected = false,
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
        accessibilityLabel={`${label} accent`}
        style={[
          styles.base,
          {
            height: 32,
            backgroundColor: bg,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            borderWidth: isFocused ? 1 : 0,
            borderColor: isFocused ? colors.accent : 'transparent',
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: color,
              borderRadius: radius.pill,
            },
          ]}
        />
        <Text variant="label" color={textColor} style={{ marginLeft: spacing.sm }}>
          {label}
        </Text>
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
  swatch: {
    width: 12,
    height: 12,
  },
});

