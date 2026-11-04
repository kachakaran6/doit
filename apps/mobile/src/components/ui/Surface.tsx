import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Card, CardProps, CardVariant, LegacySurfaceLevel } from './Card';

export type SurfaceLevel = LegacySurfaceLevel;

export interface SurfaceProps extends ViewProps {
  /**
   * The surface ladder level (02-SURFACE-SYSTEM.md §2.1).
   * L0: Canvas
   * L1: Cards, list rows (surface1)
   * L2: Inputs, chips, stat tiles (surface2)
   * L3: Selected chips, pressed states (surface3)
   */
  level?: SurfaceLevel;

  /**
   * Role-based radius (02-SURFACE-SYSTEM.md §2.6)
   * sm: 12 (inputs, chips)
   * md: 16 (buttons, stat tiles)
   * lg: 20 (cards, list rows)
   * xl: 28 (sheets, hero)
   * pill: 999
   */
  radiusRole?: 'sm' | 'md' | 'lg' | 'xl' | 'pill' | 'none';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'pill' | 'none';

  /**
   * Whether to render the 1px top highlight (02-SURFACE-SYSTEM.md §2.2).
   */
  highlight?: boolean;

  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Surface: Backward-Compatible Tonal Surface Primitive
 *
 * Wraps borderless tonal surfaces, completely removing the legacy 1px light border
 * and mapping all colors through `useTheme().colors`.
 */
export const Surface: React.FC<SurfaceProps> = ({
  level = 'L1',
  radiusRole,
  radius: radiusAlias,
  highlight = true,
  style,
  children,
  ...rest
}) => {
  const { colors, radius, elevation, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const resolvedLevel =
    level === 0 ? 'L0' :
    level === 1 ? 'L1' :
    level === 2 ? 'L2' :
    level === 3 ? 'L3' :
    level;

  const activeRadiusRole = radiusAlias || radiusRole || 'lg';

  let bgColor: string;
  let isL0 = false;
  switch (resolvedLevel) {
    case 'L0':
      bgColor = colors.canvas;
      isL0 = true;
      break;
    case 'L2':
    case 'surfaceRaised':
      bgColor = colors.surface2;
      break;
    case 'L3':
    case 'surfaceOverlay':
      bgColor = colors.surface3;
      break;
    case 'L1':
    case 'surface':
    default:
      bgColor = isDark ? colors.surface1 : colors.white;
      break;
  }

  let borderRadius: number = 0;
  switch (activeRadiusRole) {
    case 'sm':
      borderRadius = radius.sm; // 12
      break;
    case 'md':
      borderRadius = radius.md; // 16
      break;
    case 'lg':
      borderRadius = radius.card; // 20
      break;
    case 'xl':
      borderRadius = radius.xl; // 28
      break;
    case 'pill':
      borderRadius = radius.pill; // 999
      break;
    case 'none':
      borderRadius = 0;
      break;
  }

  // Highlight applies to L1 and L2 surfaces in dark mode
  const showHighlight =
    highlight &&
    isDark &&
    (resolvedLevel === 'L1' ||
      resolvedLevel === 'L2' ||
      resolvedLevel === 'surface' ||
      resolvedLevel === 'surfaceRaised');

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderRadius,
          borderWidth: 0, // Strict zero 1px borders
        },
        // Soft elevation on light mode (non-L0)
        !isDark && !isL0 && elevation.cardLight,
        style,
      ]}
      {...rest}
    >
      {/* 1px top highlight in dark mode using theme token */}
      {showHighlight && (
        <View
          pointerEvents="none"
          style={[
            styles.highlightLine,
            {
              backgroundColor: colors.highlight,
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
    overflow: 'hidden',
  },
  highlightLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});

export { Card, CardProps, CardVariant };
