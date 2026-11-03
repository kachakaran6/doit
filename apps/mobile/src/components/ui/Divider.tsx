import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface DividerProps {
  /**
   * Inset distance from left (or horizontal sides). Defaults to 16 for in-card row separation.
   */
  inset?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * DoIt Premium Divider Primitive (02-SURFACE-SYSTEM.md §2.3)
 * Hairline separator for inside cards with standard 16px inset.
 */
export const Divider: React.FC<DividerProps> = ({ inset = 16, style }) => {
  const { colors, resolvedTheme } = useTheme();

  const dividerColor =
    resolvedTheme === 'dark'
      ? colors.borderSubtle || 'rgba(255,255,255,0.05)'
      : colors.borderSubtle || '#ECEEF2';

  return (
    <View
      style={[
        styles.divider,
        {
          marginLeft: inset,
          backgroundColor: dividerColor,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
