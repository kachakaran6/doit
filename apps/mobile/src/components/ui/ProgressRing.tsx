import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** Progress value from 0.0 to 1.0 */
  progress: number;
  /** Diameter of the circular ring. Default: 72pt */
  size?: number;
  /** Stroke thickness. Default: 8pt */
  strokeWidth?: number;
  /** Whether to use the brand gradient. Default: true */
  gradient?: boolean;
  /** Gradient start color stop. Default: #6E97FF */
  startColor?: string;
  /** Gradient end color stop. Default: #2E48D9 */
  endColor?: string;
  /** Solid color when gradient is disabled. Default: colors.accent */
  color?: string;
  /** Background track color. Default: colors.surface2 */
  trackColor?: string;
  /** Optional content rendered at the optical center (e.g. percentage text) */
  children?: React.ReactNode;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

export const BRAND_GRADIENT_START = '#6E97FF';
export const BRAND_GRADIENT_END = '#2E48D9';

/**
 * ProgressRing: High-Fidelity SVG Circular Progress Primitive (Phase L2)
 *
 * Implements the circular completion indicator for Today hero and stat tiles:
 * - Rounded stroke caps (`strokeLinecap="round"`).
 * - Authentic brand gradient (`#6E97FF` to `#2E48D9`).
 * - Smooth Reanimated progress interpolation over 600ms.
 * - Sized and rotated to begin progress at 12 o'clock (top center).
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 72,
  strokeWidth = 8,
  gradient = true,
  startColor = BRAND_GRADIENT_START,
  endColor = BRAND_GRADIENT_END,
  color,
  trackColor,
  children,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const clampedProgress = Math.min(Math.max(safeProgress, 0), 1);
  const progressAnim = useSharedValue(clampedProgress);

  const radiusVal = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusVal;
  const center = size / 2;

  useEffect(() => {
    progressAnim.value = withTiming(clampedProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, progressAnim]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - circumference * progressAnim.value;
    return {
      strokeDashoffset,
    };
  });

  const resolvedTrackColor = trackColor || colors.surface2;
  const resolvedColor = color || colors.accent;
  const gradientId = `brandGrad-${size}-${strokeWidth}`;

  return (
    <View
      style={[{ width: size, height: size }, styles.container, style]}
      testID={testID}
    >
      <Svg width={size} height={size} style={styles.svg}>
        {gradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={startColor} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>
          </Defs>
        )}

        {/* Background track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radiusVal}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Foreground animated progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radiusVal}
          stroke={gradient ? `url(#${gradientId})` : resolvedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Optional center child (percentage text, icon, fraction) */}
      {children && <View style={styles.centerContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '-90deg' }], // Start at 12 o'clock
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
