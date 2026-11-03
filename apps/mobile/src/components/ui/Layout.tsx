import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { spacing as tokenSpacing } from '@doit/tokens';

export type SpacingKey = keyof typeof tokenSpacing;

export interface StackProps {
  gap?: SpacingKey;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Use Stack for vertical component ordering with predictable 8-pt rhythm.
 */
export const Stack: React.FC<StackProps> = ({
  gap = 'md',
  align = 'stretch',
  justify = 'flex-start',
  style,
  children,
}) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'column',
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

export interface RowProps {
  gap?: SpacingKey;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Use Row for horizontal component alignment.
 */
export const Row: React.FC<RowProps> = ({
  gap = 'md',
  align = 'center',
  justify = 'flex-start',
  style,
  children,
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

export { Divider, DividerProps } from './Divider';
