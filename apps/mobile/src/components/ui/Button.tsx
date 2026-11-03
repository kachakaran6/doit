import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

/**
 * P-01 Button:
 * Variants: primary | secondary | ghost | danger
 * Sizes: sm (36) | md (44) | lg (52)
 * Radius: 16 (radius.md)
 * 5 States: rest, pressed (scale 0.97/90ms), focused, disabled, loading
 * Strict token compliance — callers cannot pass custom style overrides.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const { colors, radius, spacing, mode } = useTheme();
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

  const sizeHeights: Record<ButtonSize, number> = {
    sm: 36,
    md: 44,
    lg: 52,
  };

  const sizePadding: Record<ButtonSize, number> = {
    sm: spacing.md, // 12
    md: spacing.lg, // 16
    lg: spacing.xl, // 20
  };

  const height = sizeHeights[size];
  const paddingHorizontal = sizePadding[size];

  // Base background and text colors
  let bg = colors.accent;
  let textColor: 'inverse' | 'primary' | 'secondary' | 'danger' | 'muted' = 'inverse';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = colors.surfaceRaised; // L2 for interactive cards/buttons
    textColor = 'primary';
    borderWidth = 0;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = 'primary';
  } else if (variant === 'danger') {
    bg = colors.danger;
    textColor = 'inverse';
  }

  // State: Focused
  if (isFocused) {
    borderWidth = 1;
    borderColor = colors.accent;
  }

  // State: Disabled
  if (disabled) {
    bg = colors.surfaceRaised;
    textColor = 'muted';
    borderWidth = 0;
  }

  const textVariant = size === 'sm' ? 'label' : 'bodyStrong';

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { width: '100%' },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        style={[
          styles.base,
          {
            height,
            paddingHorizontal,
            backgroundColor: bg,
            borderRadius: radius.md, // 16
            borderWidth,
            borderColor,
            opacity: disabled ? 0.45 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={textColor === 'inverse' ? '#FFFFFF' : colors.textPrimary}
            size={size === 'sm' ? 'small' : 'small'}
          />
        ) : (
          <View style={styles.content}>
            {icon && <View style={title ? { marginRight: spacing.sm } : undefined}>{icon}</View>}
            {title && (
              <Text variant={textVariant} color={textColor}>
                {title}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
