import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { spacing as spacingTokens } from '@doit/tokens';

export type SpacingKey = keyof typeof spacingTokens;

export interface StackProps {
  gap?: SpacingKey;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Use Stack to arrange children vertically with uniform gap token spacing.
 */
export const Stack: React.FC<StackProps> = ({ gap = 'md', children, style }) => {
  const { spacing } = useTheme();
  return <View style={[{ gap: spacing[gap] }, style]}>{children}</View>;
};

export interface RowProps {
  gap?: SpacingKey;
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Use Row to arrange children horizontally with uniform gap token spacing.
 */
export const Row: React.FC<RowProps> = ({
  gap = 'sm',
  align = 'center',
  justify = 'flex-start',
  children,
  style,
}) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          gap: spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface SpacerProps {
  size?: SpacingKey;
  horizontal?: boolean;
}

/**
 * Use Spacer to insert dedicated empty space along an axis.
 */
export const Spacer: React.FC<SpacerProps> = ({ size = 'md', horizontal = false }) => {
  const { spacing } = useTheme();
  const dimension = spacing[size];
  return (
    <View
      style={
        horizontal ? { width: dimension, height: 1 } : { height: dimension, width: 1 }
      }
    />
  );
};

export interface DividerProps {
  style?: ViewStyle;
}

/**
 * Use Divider for 1px hairline separation between sections or list rows.
 */
export const Divider: React.FC<DividerProps> = ({ style }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          width: '100%',
        },
        style,
      ]}
    />
  );
};
