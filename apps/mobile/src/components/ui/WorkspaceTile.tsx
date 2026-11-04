import React from 'react';
import { View, StyleSheet } from 'react-native';
import { accentFor } from '@doit/design-tokens';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface WorkspaceTileProps {
  id: string;
  name?: string;
  size?: number;
}

/**
 * P-01 WorkspaceTile:
 * 04-COLOUR-AS-INFORMATION.md §4.4
 * Workspace tiles use accentFor(id).primary with white initials.
 */
export const WorkspaceTile: React.FC<WorkspaceTileProps> = ({
  id,
  name,
  size = 36,
}) => {
  const { colors, radius } = useTheme();
  const tileAccent = accentFor(id || name || 'default');
  const monogram = (name || id || 'W').trim().slice(0, 2).toUpperCase();

  return (
    <View
      pointerEvents="none"
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius.sm, // 12
          backgroundColor: tileAccent.primary,
        },
      ]}
    >
      <Text
        variant="caption"
        style={{
          fontSize: Math.round(size * 0.4),
          fontWeight: '700',
          color: colors.white, // White initials per §4.4
        }}
      >
        {monogram}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

