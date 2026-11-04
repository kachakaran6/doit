import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface SkeletonProps {
  /** Width of the skeleton item. Default: '100%' */
  width?: number | string;
  /** Height of the skeleton item. Default: 20 */
  height?: number;
  /** Corner radius. Default: 8 */
  borderRadius?: number;
  /** Radius role token or numeric value */
  radius?: 'sm' | 'md' | 'lg' | 'pill' | number;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * Skeleton: Shimmer Loading Primitive (Phase L2)
 *
 * Pulsing tonal placeholder matching upcoming content dimensions.
 * Strictly uses `colors.surface2` (`surfaceRaised`) without 1px borders.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  radius: radiusProp,
  style,
  testID,
}) => {
  const { colors, radius } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  let resolvedRadius = 8;
  if (borderRadius !== undefined) {
    resolvedRadius = borderRadius;
  } else if (typeof radiusProp === 'number') {
    resolvedRadius = radiusProp;
  } else if (radiusProp === 'sm') {
    resolvedRadius = radius.sm;
  } else if (radiusProp === 'md') {
    resolvedRadius = radius.md;
  } else if (radiusProp === 'lg') {
    resolvedRadius = radius.card;
  } else if (radiusProp === 'pill') {
    resolvedRadius = radius.pill;
  }

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: resolvedRadius,
          backgroundColor: colors.surface2,
          opacity: opacityAnim,
        },
        style,
      ]}
      testID={testID}
    />
  );
};

export interface RowSkeletonProps {
  withLabels?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * RowSkeleton: Skeleton loader matching GroupedRow layout geometry
 */
export const RowSkeleton: React.FC<RowSkeletonProps> = ({
  withLabels = true,
  style,
  testID,
}) => {
  const { colors, radius, elevation, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <View
      style={[
        styles.rowWrapper,
        {
          backgroundColor: isDark ? colors.surface1 : colors.white,
          borderRadius: radius.card,
          borderWidth: 0,
        },
        !isDark && elevation.cardLight,
        style,
      ]}
      testID={testID}
    >
      <View style={[styles.rowContainer, { minHeight: withLabels ? 96 : 56 }]}>
        {/* 22px Circular Checkbox Column */}
        <View style={styles.checkboxCol}>
          <Skeleton width={22} height={22} borderRadius={11} />
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          {/* Meta line */}
          <View style={styles.metaRow}>
            <Skeleton width={56} height={12} borderRadius={4} />
            <Skeleton width={64} height={12} borderRadius={4} />
          </View>

          {/* Title line */}
          <View style={{ marginTop: 8 }}>
            <Skeleton width="80%" height={16} borderRadius={4} />
          </View>

          {/* Labels */}
          {withLabels && (
            <View style={styles.labelsRow}>
              <Skeleton width={60} height={20} borderRadius={10} />
              <Skeleton width={75} height={20} borderRadius={10} />
            </View>
          )}
        </View>

        {/* Trailing Avatar / Slot */}
        <View style={styles.avatarCol}>
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  checkboxCol: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    paddingLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  avatarCol: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
