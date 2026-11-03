import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type SurfaceLevel =
  | 'L0'
  | 'L1'
  | 'L2'
  | 'L3'
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
  radiusRole = 'lg',
  highlight = true,
  style,
  children,
  ...rest
}) => {
  const { colors, radius, resolvedTheme } = useTheme();

  let bgColor: string;
  switch (level) {
    case 'L0':
      bgColor = colors.bg;
      break;
    case 'L1':
    case 'surface':
      bgColor = colors.surface;
      break;
    case 'L2':
    case 'surfaceRaised':
      bgColor = colors.surfaceRaised;
      break;
    case 'L3':
    case 'surfaceOverlay':
      bgColor = colors.surfaceOverlay;
      break;
    default:
      bgColor = colors.surface;
  }

  const cornerRadius = radiusRole === 'none' ? 0 : radius[radiusRole];
  const isDark = resolvedTheme === 'dark';
  const showHighlight =
    highlight && (level === 'L1' || level === 'L2' || level === 'surface' || level === 'surfaceRaised');

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderRadius: cornerRadius,
          // In light mode: L1 cards get a hairline border + subtle shadow (02-SURFACE-SYSTEM.md §2.1)
          // In dark mode: ZERO border. Lightness + highlight only.
          borderWidth: !isDark && (level === 'L1' || level === 'surface') ? StyleSheet.hairlineWidth : 0,
          borderColor: !isDark ? colors.border : 'transparent',
          ...(!isDark && (level === 'L1' || level === 'surface')
            ? {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }
            : {}),
        },
        style,
      ]}
      {...rest}
    >
      {isDark && showHighlight && (
        <View
          style={[
            styles.topHighlight,
            {
              left: cornerRadius > 0 ? cornerRadius : 0,
              right: cornerRadius > 0 ? cornerRadius : 0,
              backgroundColor: colors.highlight || 'rgba(255,255,255,0.06)',
            },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    height: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
});
