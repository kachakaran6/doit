import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  Text as RNText,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button title string */
  title?: string;
  /** Borderless variant. Default: 'primary' */
  variant?: ButtonVariant;
  /** Button size. Default: 'md' */
  size?: ButtonSize;
  /** Press handler */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state displaying activity spinner */
  loading?: boolean;
  /** Icon: accepts both LucideIcon component and ReactNode element */
  icon?: React.ReactNode | LucideIcon;
  /** Icon placement relative to title. Default: 'left' */
  iconPosition?: 'left' | 'right';
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Whether the button stretches to fill available width */
  fullWidth?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom children override */
  children?: React.ReactNode;
  /** Test identifier */
  testID?: string;
}

const SIZE_CONFIG = {
  sm: { height: 36, radius: 10, paddingH: 12, iconSize: 14, fontSize: 13, lineHeight: 18 },
  md: { height: 44, radius: 14, paddingH: 16, iconSize: 16, fontSize: 15, lineHeight: 20 },
  lg: { height: 52, radius: 16, paddingH: 20, iconSize: 18, fontSize: 16, lineHeight: 22 },
};

/**
 * Button: Borderless Action Primitive (Phase L2)
 *
 * Implements Apple-grade borderless action physics:
 * - 5 variants: primary, secondary, subtle (tinted), danger, ghost.
 * - 3 sizes: sm (36), md (44), lg (52) with size-specific continuous radii (10/14/16).
 * - Reanimated 0.97 spring press scale with zero 1px borders.
 * - Supports both ReactNode and LucideIcon component types.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  accessibilityLabel,
  fullWidth = false,
  style,
  children,
  testID,
}) => {
  const { colors, spacing } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const config = SIZE_CONFIG[size];

  // Resolve borderless colors strictly from tokens
  let bg = colors.accent;
  let textColor = colors.accentOnPrimary;

  if (variant === 'secondary') {
    bg = colors.surface2;
    textColor = colors.textPrimary;
  } else if (variant === 'subtle') {
    bg = colors.accentSoft;
    textColor = colors.accentText;
  } else if (variant === 'danger') {
    bg = colors.danger;
    textColor = colors.accentOnPrimary;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = colors.textPrimary;
  }

  if (disabled) {
    bg = variant === 'ghost' ? 'transparent' : colors.surface2;
    textColor = colors.textMuted;
  }

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent size={config.iconSize} color={textColor} strokeWidth={2} />;
  };

  const iconElement = renderIcon();

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && { width: '100%' },
        style,
      ]}
      testID={testID}
    >
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        style={[
          styles.base,
          {
            height: config.height,
            paddingHorizontal: config.paddingH,
            backgroundColor: bg,
            borderRadius: config.radius,
            borderWidth: 0, // Strict ban on 1px borders
            opacity: disabled ? 0.45 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : children ? (
          children
        ) : (
          <View style={styles.content}>
            {iconElement && iconPosition === 'left' && (
              <View style={title ? { marginRight: spacing.sm } : undefined}>
                {iconElement}
              </View>
            )}

            {title && (
              <RNText
                style={[
                  styles.titleText,
                  {
                    color: textColor,
                    fontSize: config.fontSize,
                    lineHeight: config.lineHeight,
                  },
                ]}
              >
                {title}
              </RNText>
            )}

            {iconElement && iconPosition === 'right' && (
              <View style={title ? { marginLeft: spacing.sm } : undefined}>
                {iconElement}
              </View>
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
  titleText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
