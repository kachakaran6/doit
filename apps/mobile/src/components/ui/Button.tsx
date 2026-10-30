import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, TextColor } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
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
  style?: ViewStyle;
}

/**
 * Use Button for primary, secondary, danger and ghost actions with standardized tap targets and press feedback.
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
  style,
}) => {
  const { colors, radius, spacing } = useTheme();
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

  const height = sizeHeights[size];

  // Colors per variant
  let bg = colors.accent;
  let borderColor = 'transparent';
  let textColor: TextColor = 'inverse';

  if (variant === 'secondary') {
    bg = colors.surface;
    borderColor = colors.border;
    textColor = 'primary';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = 'primary';
  } else if (variant === 'danger') {
    bg = colors.danger;
    textColor = 'inverse';
  } else if (variant === 'icon') {
    bg = colors.bgSubtle;
    textColor = 'primary';
  }

  if (disabled) {
    bg = colors.bgSubtle;
    borderColor = colors.border;
    textColor = 'tertiary';
  }

  const isIconButton = variant === 'icon';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        style={[
          styles.base,
          {
            height,
            minWidth: isIconButton ? height : height * 1.5,
            paddingHorizontal: isIconButton ? 0 : spacing.lg,
            backgroundColor: bg,
            borderRadius: radius.md,
            borderColor,
            borderWidth: borderColor !== 'transparent' ? 1 : 0,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor === 'inverse' ? colors.bg : colors.textPrimary} />
        ) : (
          <>
            {icon}
            {title && (
              <Text
                variant={size === 'sm' ? 'label' : 'bodyStrong'}
                color={textColor}
                style={icon ? { marginLeft: spacing.sm } : undefined}
              >
                {title}
              </Text>
            )}
          </>
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
  },
});
