import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary';

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel: string;
}

/**
 * P-01 IconButton:
 * Dimensions: 40x40, radius 12 (radius.sm)
 * Variants: ghost | secondary | primary
 * 5 States: rest, pressed (scale 0.97/90ms), focused, disabled, loading
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}) => {
  const { colors, radius } = useTheme();
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

  let bg = 'transparent';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = colors.surfaceRaised; // L2
  } else if (variant === 'primary') {
    bg = colors.accent;
  }

  if (isFocused) {
    borderWidth = 1;
    borderColor = colors.accent;
  }

  if (disabled) {
    bg = variant === 'ghost' ? 'transparent' : colors.surfaceRaised;
    borderWidth = 0;
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        style={[
          styles.base,
          {
            backgroundColor: bg,
            borderRadius: radius.sm, // 12
            borderWidth,
            borderColor,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#FFFFFF' : colors.textPrimary}
            size="small"
          />
        ) : (
          icon
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

