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

export interface LayoutRowProps {
  gap?: SpacingKey;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Use LayoutRow / FlexRow for horizontal layout alignment.
 */
export const LayoutRow: React.FC<LayoutRowProps> = ({
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

export const FlexRow = LayoutRow;

export interface SpacerProps {
  size?: SpacingKey;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md' }) => {
  const { spacing } = useTheme();
  return <View style={{ width: spacing[size], height: spacing[size] }} />;
};

export interface GridProps {
  columns?: number;
  gap?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  columns = 2,
  gap = 'md',
  style,
  children,
}) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        styles.grid,
        {
          gap: spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface ContainerProps {
  padding?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  padding = 'lg',
  style,
  children,
}) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          padding: spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
