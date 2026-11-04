import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  Text as RNText,
} from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

export interface LargeHeaderProps {
  /** Screen title (sentence case) */
  title: string;
  /** Optional subtitle or counter (e.g. "2 tasks · 0 done" or project name) */
  subtitle?: string;
  /** Optional eyebrow text (sentence case, textMuted) */
  eyebrow?: string;
  /** Optional badge count or status pill */
  badge?: string | number;
  /** Back button callback */
  onBack?: () => void;
  /** Back button accessibility label */
  backAccessibilityLabel?: string;
  /** Left slot override (e.g. WorkspaceSwitcher on Home) */
  leftSlot?: React.ReactNode;
  /** Right action slot (<= 2 icon buttons, 44px hit targets) */
  rightAction?: React.ReactNode;
  /** Backward compatibility alias for rightAction */
  trailing?: React.ReactNode;
  /** SharedValue tracking scroll offset */
  scrollY?: SharedValue<number>;
  /** Scroll distance over which collapse occurs. Default: 50pt */
  collapseThreshold?: number;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * LargeHeader: Collapsing Header Primitive (Phase L2)
 *
 * Implements the Apple-grade collapsing large title pattern:
 * - Expanded: large title (30/36 700 tracking -0.5) with optional eyebrow, badge, and subtitle.
 * - Collapsing: smoothly transitions into compact inline title (17/22 600) on scroll.
 * - Hairline: subtle separator appears once collapsed using `colors.hairline`.
 * - Fallback: graceful static expanded state when `scrollY` is not provided.
 */
export const LargeHeader: React.FC<LargeHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  badge,
  onBack,
  backAccessibilityLabel = 'Go back',
  leftSlot,
  rightAction,
  trailing,
  scrollY,
  collapseThreshold = 50,
  style,
  testID,
}) => {
  const { colors, spacing, radius } = useTheme();
  const trailingContent = rightAction || trailing;
  const dummyScrollY = useSharedValue(0);
  const activeScrollY = scrollY ?? dummyScrollY;

  const T = collapseThreshold;

  const largeTitleAnimStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    const opacity = interpolate(
      activeScrollY.value,
      [0, T * 0.7],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      activeScrollY.value,
      [0, T],
      [0, -14],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const inlineTitleAnimStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 0, transform: [{ translateY: 8 }] };
    }
    const opacity = interpolate(
      activeScrollY.value,
      [T * 0.6, T],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      activeScrollY.value,
      [T * 0.5, T],
      [8, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const hairlineAnimStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 0 };
    }
    const opacity = interpolate(
      activeScrollY.value,
      [T * 0.8, T],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Top compact navigation row (44pt) */}
      <View style={styles.topBar}>
        <View style={styles.leftSlot}>
          {leftSlot ? (
            leftSlot
          ) : onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.surface2,
                  borderRadius: radius.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
            >
              <ChevronLeft size={20} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>

        {/* Center: compact inline title */}
        <Animated.View style={[styles.inlineCenter, inlineTitleAnimStyle]}>
          <RNText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.inlineTitle,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </RNText>
        </Animated.View>

        {/* Right action slot */}
        <View style={styles.rightSlot}>
          {trailingContent}
        </View>
      </View>

      {/* Collapsing hairline divider under top bar */}
      <Animated.View
        style={[
          styles.hairline,
          { backgroundColor: colors.hairline },
          hairlineAnimStyle,
        ]}
      />

      {/* Large Title Section (smoothly translates and fades out) */}
      <Animated.View style={[styles.largeTitleSection, largeTitleAnimStyle]}>
        {eyebrow && (
          <RNText
            style={[
              styles.eyebrow,
              { color: colors.textMuted },
            ]}
          >
            {eyebrow}
          </RNText>
        )}

        <View style={styles.titleRow}>
          <RNText
            style={[
              styles.largeTitle,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </RNText>

          {badge !== undefined && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.surface2,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <RNText
                style={[
                  styles.badgeText,
                  { color: colors.textSecondary },
                ]}
              >
                {badge}
              </RNText>
            </View>
          )}
        </View>

        {subtitle && (
          <RNText
            style={[
              styles.subtitle,
              { color: colors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            {subtitle}
          </RNText>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  leftSlot: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCenter: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  rightSlot: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  largeTitleSection: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  largeTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  badge: {
    height: 22,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
