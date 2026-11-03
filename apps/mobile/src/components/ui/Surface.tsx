import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type SurfaceLevel =
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

export interface SurfaceProps extends ViewProps {
  /**
   * The surface ladder level (02-SURFACE-SYSTEM.md §2.1).
   * L0: Canvas (#08090A)
   * L1: Cards, list rows (#0F1012)
   * L2: Inputs, chips, stat tiles (#16181B)
   * L3: Selected chips, pressed states (#1D2024)
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
   * Replaces border on L1 & L2.
   */
  highlight?: boolean;

  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * DoIt Premium Surface Primitive (02-SURFACE-SYSTEM.md)
 * Implements the 4-step surface ladder with top highlight and zero static borders in dark mode.
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
  const { colors, radius, resolvedTheme } = useTheme();

  const resolvedLevel =
    level === 0 ? 'L0' :
    level === 1 ? 'L1' :
    level === 2 ? 'L2' :
    level === 3 ? 'L3' :
    level;

  const activeRadiusRole = radiusAlias || radiusRole || 'lg';

  let bgColor: string;
  switch (resolvedLevel) {
    case 'L0':
      bgColor = colors.bg;
      break;
    case 'L2':
    case 'surfaceRaised':
      bgColor = colors.surfaceRaised;
      break;
    case 'L3':
    case 'surfaceOverlay':
      bgColor = colors.surfaceOverlay;
      break;
    case 'L1':
    case 'surface':
    default:
      bgColor = colors.surface;
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
      borderRadius = radius.lg; // 20
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

  const isDark = resolvedTheme === 'dark';
  // Highlight applies to L1 and L2 surfaces
  const showHighlight = highlight && (resolvedLevel === 'L1' || resolvedLevel === 'L2' || resolvedLevel === 'surface' || resolvedLevel === 'surfaceRaised');

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderRadius,
        },
        // In light mode, subtle edge separation
        !isDark && styles.lightBorder,
        style,
      ]}
      {...rest}
    >
      {/* 1px top highlight (02-SURFACE-SYSTEM.md §2.2) */}
      {showHighlight && isDark && (
        <View
          pointerEvents="none"
          style={[
            styles.highlightLine,
            {
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
  lightBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  highlightLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
