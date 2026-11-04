import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';

export type CardVariant = 'surface1' | 'surface2' | 'surface3';

export type LegacySurfaceLevel =
  | 'L0'
  | 'L1'
  | 'L2'
  | 'L3'
  | 0
  | 1
  | 2
  | 3
  | 'surface'
  | 'surfaceRaised'
  | 'surfaceOverlay';

export interface CardProps {
  /** Card children */
  children: React.ReactNode;
  /** Tonal surface level: surface1 (default), surface2, or surface3 */
  variant?: CardVariant;
  /** Backward-compatible alias for variant */
  level?: LegacySurfaceLevel;
  /** Continuous corner radius. Default: 20 (radius.card) */
  borderRadius?: number;
  /** Internal padding. Default: 16 (spacing.cardPadding) */
  padding?: number;
  /** Press handler; renders interactive Pressable with 0.97 scale when provided */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** 1px subtle top highlight for dark mode. Default: true */
  highlight?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility role */
  accessibilityRole?: AccessibilityRole;
  /** Accessibility state */
  accessibilityState?: AccessibilityState;
}

/**
 * Card: Borderless Tonal Container (Phase L2)
 *
 * Enforces the design system's absolute ban on 1px borders:
 * - Depth achieved via 8% surface luminance ramp (canvas -> surface1 -> surface2 -> surface3).
 * - Light mode: soft elevation shadow (`elevation.cardLight`) on white surface.
 * - Dark mode: tonal surface with 1px subtle top highlight (`colors.highlight`).
 * - Interactive: 0.97 damped spring press scale when `onPress` is supplied.
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface1',
  level,
  borderRadius,
  padding = 16,
  onPress,
  onLongPress,
  disabled = false,
  highlight = true,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
}) => {
  const { colors, radius, elevation, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const scale = useSharedValue(1);

  // Map legacy level to variant if provided
  let effectiveVariant = variant;
  if (level !== undefined) {
    if (level === 'L0' || level === 0) {
      effectiveVariant = 'surface1';
    } else if (level === 'L2' || level === 2 || level === 'surfaceRaised') {
      effectiveVariant = 'surface2';
    } else if (level === 'L3' || level === 3 || level === 'surfaceOverlay') {
      effectiveVariant = 'surface3';
    } else {
      effectiveVariant = 'surface1';
    }
  }

  // Resolve background color strictly from tokens
  let bgColor: string;
  if (isDark) {
    if (effectiveVariant === 'surface2') {
      bgColor = colors.surface2;
    } else if (effectiveVariant === 'surface3') {
      bgColor = colors.surface3;
    } else {
      bgColor = colors.surface1;
    }
  } else {
    if (effectiveVariant === 'surface2') {
      bgColor = colors.surface2;
    } else if (effectiveVariant === 'surface3') {
      bgColor = colors.surface3;
    } else {
      bgColor = colors.white;
    }
  }

  const effectiveRadius = borderRadius ?? radius.card;

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1.0, { damping: 15, stiffness: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyles: StyleProp<ViewStyle> = [
    styles.base,
    {
      backgroundColor: bgColor,
      borderRadius: effectiveRadius,
      padding,
      borderWidth: 0, // Strict zero 1px borders
    },
    !isDark && elevation.cardLight,
    style,
  ];

  const highlightElement = highlight && isDark && (
    <View
      pointerEvents="none"
      style={[
        styles.highlightLine,
        {
          backgroundColor: colors.highlight,
          borderTopLeftRadius: effectiveRadius,
          borderTopRightRadius: effectiveRadius,
        },
      ]}
    />
  );

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, styles.animatedWrapper]}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          onLongPress={disabled ? undefined : onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityRole={accessibilityRole ?? 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled, ...accessibilityState }}
          style={containerStyles}
          testID={testID}
        >
          {highlightElement}
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      {highlightElement}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    width: '100%',
  },
  base: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  highlightLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
