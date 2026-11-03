import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Surface } from './Surface';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * P-01 Skeleton:
 * Shimmering block placeholder with L2 (surfaceRaised) background.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
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
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceRaised, // L2
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * P-01 RowSkeleton:
 * Matches the real Row anatomy (§6.3) with 44 checkbox column,
 * meta bar, title bar, optional labels bar, and trailing avatar.
 */
export const RowSkeleton: React.FC<{ withLabels?: boolean }> = ({ withLabels = true }) => {
  return (
    <Surface level={1} radius="lg">
      <View style={[styles.rowContainer, { minHeight: withLabels ? 124 : 96 }]}>
        {/* 44 Checkbox Column */}
        <View style={styles.checkboxCol}>
          <Skeleton width={28} height={28} borderRadius={8} />
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          {/* Meta row */}
          <View style={styles.metaRow}>
            <Skeleton width={56} height={12} borderRadius={4} />
            <Skeleton width={64} height={12} borderRadius={4} />
            <Skeleton width={72} height={12} borderRadius={4} />
          </View>

          {/* Title */}
          <View style={{ marginTop: 10 }}>
            <Skeleton width="85%" height={18} borderRadius={4} />
          </View>

          {/* Labels */}
          {withLabels && (
            <View style={styles.labelsRow}>
              <Skeleton width={60} height={20} borderRadius={10} />
              <Skeleton width={75} height={20} borderRadius={10} />
            </View>
          )}
        </View>

        {/* Trailing Avatar */}
        <View style={styles.avatarCol}>
          <Skeleton width={28} height={28} borderRadius={14} />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  checkboxCol: {
    width: 44,
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
    marginTop: 12,
  },
  avatarCol: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
