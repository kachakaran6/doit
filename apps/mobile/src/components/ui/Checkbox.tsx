import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Vibration,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface CheckboxProps {
  /** Checked completion state */
  checked: boolean;
  /** Primary callback with next boolean state */
  onChange?: (checked: boolean) => void;
  /** Backward-compatible press callback */
  onPress?: () => void;
  /** Visual diameter. Default: 22pt */
  size?: number;
  /** Optional label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

const CHECK_PATH_LENGTH = 14;

/**
 * Checkbox: 22px Circular Animated Completion Primitive (Phase L2)
 *
 * Resolves Defect E1 (heavy square checkboxes):
 * - Circular 22px completion control (`borderRadius: 11`) with 44x44pt touch target.
 * - 180ms sequence bounce: 1.0 -> 0.85 (60ms) -> 1.05 (70ms) -> 1.0 (50ms).
 * - SVG checkmark path stroke draw over 140ms.
 * - Tactile haptic pulse (`Vibration.vibrate(15)`).
 * - Supports both `onChange` and `onPress` for zero-regression backward compatibility.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  onPress,
  size = 22,
  label,
  disabled = false,
  accessibilityLabel = 'Toggle completion',
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const strokeOffset = useSharedValue(checked ? 0 : CHECK_PATH_LENGTH);

  useEffect(() => {
    if (checked) {
      // 180ms sequence bounce: 1.0 -> 0.85 -> 1.05 -> 1.0
      scale.value = withSequence(
        withTiming(0.85, { duration: 60, easing: Easing.out(Easing.quad) }),
        withTiming(1.05, { duration: 70, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 50, easing: Easing.inOut(Easing.quad) })
      );
      strokeOffset.value = withTiming(0, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      });
    } else {
      scale.value = withTiming(1.0, { duration: 100 });
      strokeOffset.value = withTiming(CHECK_PATH_LENGTH, { duration: 100 });
    }
  }, [checked, scale, strokeOffset]);

  const handleToggle = (e?: any) => {
    e?.stopPropagation?.();
    if (disabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(15);
      } else {
        Vibration.vibrate(10);
      }
    } catch {
      // Silently fall back
    }
    const nextState = !checked;
    if (onChange) onChange(nextState);
    if (onPress) onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }));

  const circleRadius = size / 2;

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.hitArea, style]}
      testID={testID}
      hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
    >
      <Animated.View
        style={[
          styles.visual,
          {
            width: size,
            height: size,
            borderRadius: circleRadius,
            backgroundColor: checked ? colors.accent : colors.surface2,
            borderColor: checked ? colors.accent : colors.hairline,
            borderWidth: checked ? 0 : 1.5,
            opacity: disabled ? 0.4 : 1,
          },
          animatedStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <AnimatedPath
            d="M 6.5 11.2 L 9.5 14.2 L 15.5 8.2"
            fill="none"
            stroke={colors.accentOnPrimary}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_PATH_LENGTH}
            animatedProps={animatedCheckProps}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
